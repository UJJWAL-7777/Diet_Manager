import express from 'express';
import axios from 'axios';
import UserProfile from '../models/UserProfile.js';
import Food from '../models/Food.js';
import MealPlan from '../models/MealPlan.js';
import Progress from '../models/Progress.js';
import FoodAPIService from '../services/foodAPI.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log(`🥗 Diet API: ${req.method} ${req.originalUrl}`);
    next();
});

// ========== PUBLIC DEBUG ROUTES ==========

// Debug environment variables (PUBLIC - no auth required)
router.get('/debug-env', (req, res) => {
    res.json({
        success: true,
        environment: {
            USDA_API_KEY: process.env.USDA_API_KEY ? `Set (${process.env.USDA_API_KEY.substring(0, 10)}...)` : 'Missing',
            EDAMAM_APP_ID: process.env.EDAMAM_APP_ID ? `Set (${process.env.EDAMAM_APP_ID.substring(0, 10)}...)` : 'Missing',
            EDAMAM_APP_KEY: process.env.EDAMAM_APP_KEY ? `Set (${process.env.EDAMAM_APP_KEY.substring(0, 10)}...)` : 'Missing',
            NODE_ENV: process.env.NODE_ENV || 'not set',
            MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing',
            JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
        }
    });
});

// Test API connection (PUBLIC - no auth required)
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Diet API is working!',
        timestamp: new Date().toISOString()
    });
});

// Test search route (PUBLIC - no auth required)
router.get('/test-search', async (req, res) => {
    try {
        const { query } = req.query;
        console.log('🧪 Testing search with query:', query);
        
        const results = await FoodAPIService.searchFoods(query || 'curd');
        
        res.json({
            success: true,
            query,
            results: results.map(f => ({
                name: f.name,
                category: f.category,
                calories: f.nutrition.calories,
                source: f.source
            })),
            count: results.length
        });
    } catch (error) {
        console.error('Test search error:', error);
        res.status(500).json({
            success: false,
            message: 'Test search failed',
            error: error.message
        });
    }
});

// API Test route (PUBLIC - no auth required)
router.get('/test-apis', async (req, res) => {
    try {
        console.log('🧪 Testing external APIs...');
        
        const testQueries = ['orange', 'curd', 'yogurt', 'chicken'];
        const results = {};
        
        for (const query of testQueries) {
            console.log(`\n🔍 Testing: ${query}`);
            const apiResults = await FoodAPIService.searchFoods(query);
            results[query] = {
                count: apiResults.length,
                sources: apiResults.map(f => f.source),
                foods: apiResults.map(f => f.name)
            };
        }
        
        res.json({
            success: true,
            message: 'API Test Results',
            results,
            apiStatus: {
                usdaKey: process.env.USDA_API_KEY ? 'Set' : 'Missing',
                edamamAppId: process.env.EDAMAM_APP_ID ? 'Set' : 'Missing', 
                edamamAppKey: process.env.EDAMAM_APP_KEY ? 'Set' : 'Missing'
            }
        });
        
    } catch (error) {
        console.error('API test error:', error);
        res.status(500).json({
            success: false,
            message: 'API test failed',
            error: error.message
        });
    }
});

// Debug Edamam API directly (PUBLIC - no auth required)
router.get('/debug-edamam', async (req, res) => {
    try {
        const { query = 'avocado' } = req.query;
        console.log('🧪 Testing Edamam API directly...');
        
        const response = await axios.get(
            'https://api.edamam.com/api/food-database/v2/parser',
            {
                params: {
                    app_id: process.env.EDAMAM_APP_ID,
                    app_key: process.env.EDAMAM_APP_KEY,
                    ingr: query,
                    nutritionType: 'cooking'
                }
            }
        );

        console.log('✅ Edamam API Response:', {
            status: response.status,
            results: response.data.hints?.length || 0,
            query: query
        });

        res.json({
            success: true,
            query: query,
            status: response.status,
            resultsCount: response.data.hints?.length || 0,
            results: response.data.hints?.map(hint => ({
                food: hint.food.label,
                category: hint.food.category,
                nutrients: hint.food.nutrients
            })) || []
        });

    } catch (error) {
        console.error('❌ Edamam API Debug Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        res.json({
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
});

// Simple USDA test with minimal parameters (PUBLIC - no auth required)
router.get('/test-usda-minimal', async (req, res) => {
    try {
        console.log('🧪 Testing USDA API with minimal parameters...');
        
        if (!process.env.USDA_API_KEY) {
            return res.json({
                success: false,
                message: 'USDA_API_KEY environment variable is not set'
            });
        }

        // Use only the absolute minimum required parameters
        const response = await axios.get(
            `https://api.nal.usda.gov/fdc/v1/foods/search`,
            {
                params: {
                    api_key: process.env.USDA_API_KEY,
                    query: 'apple'
                    // Don't include pageSize, dataType, or any optional parameters
                },
                timeout: 10000
            }
        );

        console.log('✅ Minimal USDA test successful:', {
            status: response.status,
            totalHits: response.data.totalHits,
            foodsCount: response.data.foods?.length || 0
        });

        res.json({
            success: true,
            message: 'Minimal USDA test passed',
            status: response.status,
            totalHits: response.data.totalHits,
            foodsCount: response.data.foods?.length || 0,
            sampleFoods: response.data.foods?.slice(0, 3).map(f => f.description) || []
        });

    } catch (error) {
        console.error('❌ Minimal USDA test error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        res.json({
            success: false,
            message: 'Minimal USDA test failed',
            error: error.message,
            status: error.response?.status,
            responseData: error.response?.data
        });
    }
});

// Test USDA API with just query and pageSize (PUBLIC - no auth required)
router.get('/test-usda-simple', async (req, res) => {
    try {
        console.log('🧪 Testing USDA API with simple parameters...');
        
        if (!process.env.USDA_API_KEY) {
            return res.json({
                success: false,
                message: 'USDA_API_KEY environment variable is not set'
            });
        }

        // Test with just query and pageSize (no pageNumber, requireAllWords, etc.)
        const response = await axios.get(
            `https://api.nal.usda.gov/fdc/v1/foods/search`,
            {
                params: {
                    api_key: process.env.USDA_API_KEY,
                    query: 'apple',
                    pageSize: 5
                },
                timeout: 10000
            }
        );

        console.log('✅ Simple USDA test successful:', {
            status: response.status,
            totalHits: response.data.totalHits,
            foodsCount: response.data.foods?.length || 0
        });

        res.json({
            success: true,
            message: 'Simple USDA test passed',
            status: response.status,
            totalHits: response.data.totalHits,
            foodsCount: response.data.foods?.length || 0,
            foods: response.data.foods?.slice(0, 3).map(f => ({
                description: f.description,
                dataType: f.dataType,
                category: f.foodCategory
            })) || []
        });

    } catch (error) {
        console.error('❌ Simple USDA test error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        res.json({
            success: false,
            message: 'Simple USDA test failed',
            error: error.message,
            status: error.response?.status,
            responseData: error.response?.data
        });
    }
});

// Debug USDA API directly (PUBLIC - no auth required)
// Debug USDA API directly (PUBLIC - no auth required)
router.get('/debug-usda', async (req, res) => {
    try {
        const { query = 'apple', pageSize = 5 } = req.query;
        console.log('🧪 Testing USDA API directly...');
        
        // Validate and sanitize parameters - remove pageNumber
        const sanitizedQuery = (query || 'apple').toString().trim();
        const sanitizedPageSize = Math.min(Math.max(parseInt(pageSize) || 5, 1), 50);
        
        console.log('🔧 USDA API Parameters:', {
            query: sanitizedQuery,
            pageSize: sanitizedPageSize,
            hasApiKey: !!process.env.USDA_API_KEY
        });

        if (!process.env.USDA_API_KEY) {
            throw new Error('USDA_API_KEY environment variable is not set');
        }

        // Build params object - only use parameters we know work
        const params = {
            api_key: process.env.USDA_API_KEY,
            query: sanitizedQuery,
            pageSize: sanitizedPageSize
            // Remove pageNumber and requireAllWords for now
        };

        console.log('🔧 Final USDA API params:', params);

        const response = await axios.get(
            `https://api.nal.usda.gov/fdc/v1/foods/search`,
            {
                params: params,
                timeout: 15000,
                validateStatus: function (status) {
                    return status < 500;
                }
            }
        );

        console.log('✅ USDA API Response Status:', response.status);
        console.log('✅ USDA API Response Data:', {
            totalHits: response.data.totalHits,
            foodsCount: response.data.foods?.length || 0,
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages
        });

        // Format the response
        const formattedFoods = response.data.foods?.map(food => ({
            fdcId: food.fdcId,
            description: food.description,
            dataType: food.dataType,
            foodCategory: food.foodCategory,
            servingSize: food.servingSize,
            servingSizeUnit: food.servingSizeUnit,
            nutrients: (food.foodNutrients || []).slice(0, 8).map(nutrient => ({
                id: nutrient.nutrientId,
                name: nutrient.nutrientName,
                value: nutrient.value,
                unit: nutrient.unitName
            }))
        })) || [];

        res.json({
            success: true,
            query: sanitizedQuery,
            request: {
                pageSize: sanitizedPageSize
            },
            response: {
                status: response.status,
                totalHits: response.data.totalHits,
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                foodsCount: formattedFoods.length
            },
            foods: formattedFoods,
            apiInfo: {
                keyPresent: true,
                keyPreview: `${process.env.USDA_API_KEY.substring(0, 8)}...`
            }
        });

    } catch (error) {
        console.error('❌ USDA API Debug Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        res.status(500).json({
            success: false,
            error: error.message,
            status: error.response?.status,
            responseData: error.response?.data
        });
    }
});

// Test USDA API with various parameters (PUBLIC - no auth required)
router.get('/test-usda-comprehensive', async (req, res) => {
    try {
        console.log('🧪 Comprehensive USDA API test...');
        
        if (!process.env.USDA_API_KEY) {
            return res.json({
                success: false,
                message: 'USDA_API_KEY environment variable is not set'
            });
        }

        const testCases = [
            { query: 'apple', pageSize: 3 },
            { query: 'chicken breast', pageSize: 2 },
            { query: 'broccoli', pageSize: 1 },
            { query: 'milk', pageSize: 3 }
        ];

        const results = [];

        for (const testCase of testCases) {
            try {
                console.log(`🔍 Testing: "${testCase.query}"`);
                
                const response = await axios.get(
                    `https://api.nal.usda.gov/fdc/v1/foods/search`,
                    {
                        params: {
                            api_key: process.env.USDA_API_KEY,
                            query: testCase.query,
                            pageSize: testCase.pageSize,
                            requireAllWords: true
                        },
                        timeout: 5000
                    }
                );

                results.push({
                    query: testCase.query,
                    success: true,
                    status: response.status,
                    totalHits: response.data.totalHits,
                    foodsCount: response.data.foods?.length || 0,
                    foods: response.data.foods?.map(f => f.description) || []
                });

                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                results.push({
                    query: testCase.query,
                    success: false,
                    error: error.message,
                    status: error.response?.status
                });
            }
        }

        res.json({
            success: true,
            message: 'Comprehensive USDA API test completed',
            apiKeyStatus: {
                present: true,
                preview: `${process.env.USDA_API_KEY.substring(0, 8)}...`
            },
            results
        });

    } catch (error) {
        console.error('❌ Comprehensive USDA test error:', error);
        res.status(500).json({
            success: false,
            message: 'Comprehensive test failed',
            error: error.message
        });
    }
});

// Simple USDA connectivity test (PUBLIC - no auth required)
router.get('/test-usda-connectivity', async (req, res) => {
    try {
        console.log('🔌 Testing USDA API connectivity...');
        
        if (!process.env.USDA_API_KEY) {
            return res.json({
                success: false,
                message: 'USDA_API_KEY environment variable is not set',
                environment: {
                    USDA_API_KEY: 'MISSING',
                    NODE_ENV: process.env.NODE_ENV
                }
            });
        }

        const response = await axios.get(
            `https://api.nal.usda.gov/fdc/v1/foods/search`,
            {
                params: {
                    api_key: process.env.USDA_API_KEY,
                    query: 'test',
                    pageSize: 1
                },
                timeout: 10000
            }
        );

        res.json({
            success: true,
            message: 'USDA API is accessible',
            status: response.status,
            totalHits: response.data.totalHits,
            environment: {
                USDA_API_KEY: 'SET',
                keyPreview: `${process.env.USDA_API_KEY.substring(0, 8)}...`,
                NODE_ENV: process.env.NODE_ENV
            }
        });

    } catch (error) {
        console.error('❌ USDA connectivity test error:', error.message);
        
        res.json({
            success: false,
            message: 'USDA API connectivity test failed',
            error: error.message,
            status: error.response?.status,
            responseData: error.response?.data,
            environment: {
                USDA_API_KEY: process.env.USDA_API_KEY ? 'SET' : 'MISSING',
                keyPreview: process.env.USDA_API_KEY ? `${process.env.USDA_API_KEY.substring(0, 8)}...` : 'N/A',
                NODE_ENV: process.env.NODE_ENV
            }
        });
    }
});

// Add sample foods to database (PUBLIC - no auth required)
router.get('/force-add-samples', async (req, res) => {
    try {
        console.log('📦 Force adding sample foods to database...');
        
        const sampleFoods = [
            {
                name: 'Apple',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1, cholesterol: 0 },
                category: 'fruits',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Banana',
                brand: 'Generic', 
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1, cholesterol: 0 },
                category: 'fruits',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Orange',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9, sodium: 0, cholesterol: 0 },
                category: 'fruits',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Curd',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 98, protein: 11, carbs: 3, fat: 4.3, fiber: 0, sugar: 3, sodium: 36, cholesterol: 17 },
                category: 'dairy',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Yogurt',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sugar: 4.7, sodium: 46, cholesterol: 13 },
                category: 'dairy',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Chicken Breast',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, cholesterol: 85 },
                category: 'protein',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Brown Rice',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 123, protein: 2.7, carbs: 26, fat: 1, fiber: 1.8, sugar: 0.4, sodium: 1, cholesterol: 0 },
                category: 'grains',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Broccoli',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33, cholesterol: 0 },
                category: 'vegetables',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Milk',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'ml' },
                nutrition: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44, cholesterol: 5 },
                category: 'dairy',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Egg',
                brand: 'Generic',
                servingSize: { amount: 1, unit: 'piece' },
                nutrition: { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, sugar: 0.2, sodium: 71, cholesterol: 186 },
                category: 'protein',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Bread',
                brand: 'Generic',
                servingSize: { amount: 1, unit: 'slice' },
                nutrition: { calories: 79, protein: 3.1, carbs: 14, fat: 1, fiber: 1.2, sugar: 1.6, sodium: 147, cholesterol: 0 },
                category: 'grains',
                source: 'sample',
                isPublic: true,
                createdBy: null
            },
            {
                name: 'Paneer',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 265, protein: 18, carbs: 1.2, fat: 20, fiber: 0, sugar: 0, sodium: 16, cholesterol: 66 },
                category: 'dairy',
                source: 'sample',
                isPublic: true,
                createdBy: null
            }
        ];

        await Food.deleteMany({ source: 'sample' });
        const createdFoods = await Food.insertMany(sampleFoods);

        console.log(`✅ Added ${createdFoods.length} sample foods to database`);
        
        res.json({
            success: true,
            message: `Added ${createdFoods.length} sample foods to database`,
            foods: createdFoods.map(f => f.name)
        });
    } catch (error) {
        console.error('❌ Error adding sample foods:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding sample foods',
            error: error.message
        });
    }
});

// Get sample foods from database (PUBLIC - no auth required)
router.get('/sample-foods', async (req, res) => {
    try {
        const foods = await Food.find({ source: 'sample' }).sort({ name: 1 });
        
        res.json({
            success: true,
            foods,
            count: foods.length
        });
    } catch (error) {
        console.error('❌ Error fetching sample foods:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sample foods',
            error: error.message
        });
    }
});

// ========== PROTECTED ROUTES (Require Authentication) ==========

// All routes below require authentication
router.use(authenticateToken);

// User Profile Routes
router.post('/profile', async (req, res) => {
    try {
        console.log('📝 Saving profile for user:', req.user.userId);
        
        const profileData = {
            userId: req.user.userId,
            ...req.body
        };

        let profile = await UserProfile.findOne({ userId: req.user.userId });
        
        if (profile) {
            profile = await UserProfile.findOneAndUpdate(
                { userId: req.user.userId },
                profileData,
                { new: true, runValidators: true }
            );
        } else {
            profile = new UserProfile(profileData);
            await profile.save();
        }

        if (profile.age && profile.height && profile.weight && profile.gender) {
            profile.calculateTargets();
            await profile.save();
        }

        console.log('✅ Profile saved successfully');
        res.json({
            success: true,
            message: 'Profile saved successfully',
            profile
        });
    } catch (error) {
        console.error('❌ Profile save error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving profile',
            error: error.message
        });
    }
});

router.get('/profile', async (req, res) => {
    try {
        console.log('📋 Fetching profile for user:', req.user.userId);
        
        const profile = await UserProfile.findOne({ userId: req.user.userId });
        
        if (!profile) {
            return res.json({
                success: true,
                profile: null
            });
        }

        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// Food Routes - Search our database
router.get('/foods', async (req, res) => {
    try {
        const { search, category, page = 1, limit = 20 } = req.query;
        
        console.log('🔍 Searching foods:', { search, category, page, limit });
        
        let query = { isPublic: true };
        
        if (search && search.trim() !== '') {
            query.$text = { $search: search };
        }
        
        if (category && category !== '') {
            query.category = category;
        }

        const foods = await Food.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ name: 1 });

        const total = await Food.countDocuments(query);

        console.log(`✅ Found ${foods.length} foods`);
        res.json({
            success: true,
            foods,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('❌ Foods fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching foods',
            error: error.message
        });
    }
});

// Food Routes - Search external APIs
router.get('/foods/search', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        console.log('🔍 External food search:', query);
        const results = await FoodAPIService.searchFoods(query);

        res.json({
            success: true,
            results,
            count: results.length
        });
    } catch (error) {
        console.error('❌ Food search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching foods',
            error: error.message
        });
    }
});

// Add custom food to our database
router.post('/foods', async (req, res) => {
    try {
        console.log('➕ Adding custom food for user:', req.user.userId);
        
        const foodData = {
            ...req.body,
            createdBy: req.user.userId
        };

        const food = new Food(foodData);
        await food.save();

        console.log('✅ Food created successfully:', food.name);
        res.status(201).json({
            success: true,
            message: 'Food created successfully',
            food
        });
    } catch (error) {
        console.error('❌ Food creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating food',
            error: error.message
        });
    }
});

// Meal Plan Routes
router.get('/meal-plan/:date', async (req, res) => {
    try {
        const { date } = req.params;
        console.log('📅 Fetching meal plan for:', date);
        
        const mealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: new Date(date)
        }).populate('meals.items.food');

        if (!mealPlan) {
            return res.json({
                success: true,
                mealPlan: { 
                    date: new Date(date), 
                    meals: [],
                    notes: ''
                }
            });
        }

        res.json({
            success: true,
            mealPlan
        });
    } catch (error) {
        console.error('❌ Meal plan fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching meal plan',
            error: error.message
        });
    }
});

router.post('/meal-plan/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { meals, notes } = req.body;

        console.log('💾 Saving meal plan for:', date);
        
        let mealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: new Date(date)
        });

        if (mealPlan) {
            mealPlan.meals = meals;
            mealPlan.notes = notes;
        } else {
            mealPlan = new MealPlan({
                userId: req.user.userId,
                date: new Date(date),
                meals,
                notes
            });
        }

        await mealPlan.save();
        await mealPlan.populate('meals.items.food');

        console.log('✅ Meal plan saved successfully');
        res.json({
            success: true,
            message: 'Meal plan saved successfully',
            mealPlan
        });
    } catch (error) {
        console.error('❌ Meal plan save error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving meal plan',
            error: error.message
        });
    }
});

// Progress Routes
router.post('/progress', async (req, res) => {
    try {
        console.log('📊 Recording progress for user:', req.user.userId);
        
        const progressData = {
            userId: req.user.userId,
            ...req.body
        };

        const progress = new Progress(progressData);
        await progress.save();

        console.log('✅ Progress recorded successfully');
        res.status(201).json({
            success: true,
            message: 'Progress recorded successfully',
            progress
        });
    } catch (error) {
        console.error('❌ Progress recording error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording progress',
            error: error.message
        });
    }
});

router.get('/progress', async (req, res) => {
    try {
        const { limit = 30 } = req.query;
        console.log('📈 Fetching progress history, limit:', limit);
        
        const progress = await Progress.find({ userId: req.user.userId })
            .sort({ date: -1 })
            .limit(parseInt(limit));

        console.log(`✅ Found ${progress.length} progress records`);
        res.json({
            success: true,
            progress
        });
    } catch (error) {
        console.error('❌ Progress fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progress',
            error: error.message
        });
    }
});

// Dashboard Stats
router.get('/dashboard', async (req, res) => {
    try {
        console.log('🏠 Fetching dashboard data for user:', req.user.userId);
        
        const profile = await UserProfile.findOne({ userId: req.user.userId });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayMealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: today
        }).populate('meals.items.food');

        const recentProgress = await Progress.findOne({
            userId: req.user.userId
        }).sort({ date: -1 });

        console.log('✅ Dashboard data fetched successfully');
        res.json({
            success: true,
            stats: {
                profile: profile || {},
                todayMealPlan: todayMealPlan || { meals: [] },
                recentWeight: recentProgress?.weight || null,
                lastUpdated: recentProgress?.date || null
            }
        });
    } catch (error) {
        console.error('❌ Dashboard fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

export default router;