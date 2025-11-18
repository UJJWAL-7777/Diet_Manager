import express from 'express';
import UserProfile from '../models/UserProfile.js';
import Food from '../models/Food.js';
import MealPlan from '../models/MealPlan.js';
import Progress from '../models/Progress.js';
import FoodAPIService from '../services/foodAPI.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// User Profile Routes
router.post('/profile', async (req, res) => {
    try {
        const profileData = {
            userId: req.user.userId,
            ...req.body
        };

        let profile = await UserProfile.findOne({ userId: req.user.userId });
        
        if (profile) {
            // Update existing profile
            profile = await UserProfile.findOneAndUpdate(
                { userId: req.user.userId },
                profileData,
                { new: true, runValidators: true }
            );
        } else {
            // Create new profile
            profile = new UserProfile(profileData);
            await profile.save();
        }

        // Calculate targets if enough data is provided
        if (profile.age && profile.height && profile.weight && profile.gender) {
            profile.calculateTargets();
            await profile.save();
        }

        res.json({
            success: true,
            message: 'Profile saved successfully',
            profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving profile',
            error: error.message
        });
    }
});

router.get('/profile', async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user.userId });
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            profile
        });
    } catch (error) {
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
        
        let query = { isPublic: true };
        
        if (search) {
            query.$text = { $search: search };
        }
        
        if (category) {
            query.category = category;
        }

        const foods = await Food.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ name: 1 });

        const total = await Food.countDocuments(query);

        res.json({
            success: true,
            foods,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
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
        
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const results = await FoodAPIService.searchFoods(query);

        res.json({
            success: true,
            results,
            count: results.length
        });
    } catch (error) {
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
        const foodData = {
            ...req.body,
            createdBy: req.user.userId
        };

        const food = new Food(foodData);
        await food.save();

        res.status(201).json({
            success: true,
            message: 'Food created successfully',
            food
        });
    } catch (error) {
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
        const mealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: new Date(date)
        }).populate('meals.items.food');

        res.json({
            success: true,
            mealPlan: mealPlan || { date: new Date(date), meals: [] }
        });
    } catch (error) {
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

        let mealPlan = await MealPlan.findOne({
            userId: req.user.userId,
            date: new Date(date)
        });

        if (mealPlan) {
            // Update existing
            mealPlan.meals = meals;
            mealPlan.notes = notes;
        } else {
            // Create new
            mealPlan = new MealPlan({
                userId: req.user.userId,
                date: new Date(date),
                meals,
                notes
            });
        }

        await mealPlan.save();
        await mealPlan.populate('meals.items.food');

        res.json({
            success: true,
            message: 'Meal plan saved successfully',
            mealPlan
        });
    } catch (error) {
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
        const progressData = {
            userId: req.user.userId,
            ...req.body
        };

        const progress = new Progress(progressData);
        await progress.save();

        res.status(201).json({
            success: true,
            message: 'Progress recorded successfully',
            progress
        });
    } catch (error) {
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
        
        const progress = await Progress.find({ userId: req.user.userId })
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            progress
        });
    } catch (error) {
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
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

export default router;