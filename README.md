Project for Diet Mangement for the Users

MealPlanner.jsx
import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';

const MealPlanner = () => {
    // --- Existing State & Logic (Unchanged) ---
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealPlan, setMealPlan] = useState({ meals: [] });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [availableFoods, setAvailableFoods] = useState([]);
    const [foodSearchQuery, setFoodSearchQuery] = useState('');

    const mealTypes = [
        { id: 'breakfast', name: 'Breakfast', icon: '🍳', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
        { id: 'lunch', name: 'Lunch', icon: '🍲', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        { id: 'dinner', name: 'Dinner', icon: '🍛', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
        { id: 'snack-1', name: 'Snack 1', icon: '🍎', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/10' },
        { id: 'snack-2', name: 'Snack 2', icon: '🥜', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
        { id: 'snack-3', name: 'Snack 3', icon: '🥛', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' }
    ];

    useEffect(() => {
        loadMealPlan();
        loadAvailableFoods();
    }, [selectedDate]);

    const loadMealPlan = async () => {
        setLoading(true);
        try {
            const result = await dietAPI.getMealPlan(selectedDate);
            if (result.success) {
                const meals = mealTypes.map(mealType => {
                    const existingMeal = result.mealPlan.meals?.find(meal => meal.name === mealType.id);
                    return existingMeal || { name: mealType.id, items: [] };
                });
                setMealPlan({ ...result.mealPlan, meals });
            }
        } catch (error) {
            console.error('Error loading meal plan:', error);
            setMessage({ type: 'error', text: 'Error loading meal plan' });
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableFoods = async () => {
        try {
            const result = await dietAPI.getFoods();
            if (result.success) {
                setAvailableFoods(result.foods);
            }
        } catch (error) {
            console.error('Error loading foods:', error);
        }
    };

    const searchFoods = async () => {
        if (!foodSearchQuery.trim()) {
            loadAvailableFoods();
            return;
        }
        try {
            const result = await dietAPI.searchFoods(foodSearchQuery);
            if (result.success) {
                setAvailableFoods(result.results);
            }
        } catch (error) {
            console.error('Error searching foods:', error);
        }
    };

    const saveMealPlan = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const cleanedMeals = mealPlan.meals.map(meal => ({
                ...meal,
                items: meal.items.filter(item => item.food && item.food._id)
            }));

            const result = await dietAPI.saveMealPlan(selectedDate, {
                meals: cleanedMeals,
                notes: mealPlan.notes || ''
            });
            if (result.success) {
                setMessage({ type: 'success', text: 'Meal plan saved successfully!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving meal plan' });
        } finally {
            setSaving(false);
        }
    };

    // In your MealPlanner.jsx file
const addFoodToMeal = async (mealName, foodItem = null) => {
    if (foodItem) {
        try {
            let foodToAdd = foodItem;
            
            // Check if food is from API (has externalId or source 'usda') and doesn't have _id
            const isExternalFood = (foodItem.externalId || foodItem.source === 'usda' || foodItem.source === 'edamam') && !foodItem._id;
            
            if (isExternalFood) {
                console.log('🌐 Food from API, saving to database first...');
                
                // Save external food to database first
                const saveResult = await dietAPI.saveExternalFood(foodItem);
                
                if (saveResult.success) {
                    foodToAdd = saveResult.food; // Now has a valid MongoDB _id
                    console.log(✅ Food saved with ID: ${foodToAdd._id});
                } else {
                    throw new Error('Failed to save food to database');
                }
            }
            
            // Now add to meal plan
            setMealPlan(prev => ({
                ...prev,
                meals: prev.meals.map(meal => 
                    meal.name === mealName 
                        ? { 
                            ...meal, 
                            items: [...meal.items, { 
                                food: foodToAdd,
                                servingSize: { amount: 100, unit: 'g' },
                                customName: foodToAdd.name
                            }] 
                        }
                        : meal
                )
            }));
            
            // Optional: Show success message
            setMessage({ type: 'success', text: Added ${foodItem.name} to ${mealName} });
            setTimeout(() => setMessage({ type: '', text: '' }), 2000);
            
        } catch (error) {
            console.error('Error adding food:', error);
            setMessage({ 
                type: 'error', 
                text: Failed to add ${foodItem.name}: ${error.message} 
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    } else {
        setMessage({ type: 'info', text: 'Please select a food from the list below' });
    }
};

    const removeFoodFromMeal = (mealName, itemIndex) => {
        setMealPlan(prev => ({
            ...prev,
            meals: prev.meals.map(meal => 
                meal.name === mealName 
                    ? { ...meal, items: meal.items.filter((_, index) => index !== itemIndex) }
                    : meal
            )
        }));
    };

    const updateFoodServing = (mealName, itemIndex, field, value) => {
        setMealPlan(prev => ({
            ...prev,
            meals: prev.meals.map(meal => 
                meal.name === mealName 
                    ? { 
                        ...meal, 
                        items: meal.items.map((item, index) => 
                            index === itemIndex 
                                ? field === 'servingSize'
                                    ? { ...item, servingSize: { ...item.servingSize, ...value } }
                                    : { ...item, [field]: value }
                                : item
                        )
                    }
                    : meal
            )
        }));
    };

    const calculateFoodNutrition = (food, servingSize) => {
        if (!food || !food.nutrition) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const ratio = servingSize.amount / food.servingSize.amount;
        return {
            calories: Math.round(food.nutrition.calories * ratio),
            protein: Math.round(food.nutrition.protein * ratio * 10) / 10,
            carbs: Math.round(food.nutrition.carbs * ratio * 10) / 10,
            fat: Math.round(food.nutrition.fat * ratio * 10) / 10
        };
    };

    const calculateMealNutrition = (meal) => {
        return meal.items.reduce((total, item) => {
            if (!item.food) return total;
            const nutrition = calculateFoodNutrition(item.food, item.servingSize);
            return {
                calories: total.calories + nutrition.calories,
                protein: total.protein + nutrition.protein,
                carbs: total.carbs + nutrition.carbs,
                fat: total.fat + nutrition.fat
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const calculateDailyTotal = () => {
        return mealPlan.meals.reduce((total, meal) => {
            const nutrition = calculateMealNutrition(meal);
            return {
                calories: total.calories + nutrition.calories,
                protein: total.protein + nutrition.protein,
                carbs: total.carbs + nutrition.carbs,
                fat: total.fat + nutrition.fat
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    // --- Custom Styles for Consistency ---
    const styles = `
        :root {
            --bg-main: #f8fafc;
            --bg-card: #ffffff;
            --text-main: #0f172a;
            --text-sec: #64748b;
            --border: #e2e8f0;
        }
        .dark {
            --bg-main: #0f172a;
            --bg-card: #1e293b;
            --text-main: #f8fafc;
            --text-sec: #94a3b8;
            --border: #334155;
        }
        .app-bg { background-color: var(--bg-main); color: var(--text-main); }
        .card-bg { background-color: var(--bg-card); border: 1px solid var(--border); }
        .input-style {
            background-color: var(--bg-main);
            color: var(--text-main);
            border: 1px solid var(--border);
        }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeIn 0.4s ease-out forwards; }
    `;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    const dailyTotal = calculateDailyTotal();

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-enter">
            <style>{styles}</style>

            {/* --- Header Section --- */}
            <div className="card-bg rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meal Planner</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Design your nutrition for the day.</p>
                </div>
                
                {/* Controls */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-style px-4 py-2.5 rounded-xl font-medium w-full md:w-auto outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                        onClick={saveMealPlan}
                        disabled={saving}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-70"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving</>
                        ) : (
                            '💾 Save Plan'
                        )}
                    </button>
                </div>
            </div>

            {/* Notification Message */}
            {message.text && (
                <div className={`p-4 rounded-xl text-center font-medium animate-enter ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                    message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* --- Nutrition Summary Cards --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Calories', val: dailyTotal.calories, unit: '', color: 'text-indigo-500', icon: '🔥' },
                    { label: 'Protein', val: dailyTotal.protein, unit: 'g', color: 'text-emerald-500', icon: '🥩' },
                    { label: 'Carbs', val: dailyTotal.carbs, unit: 'g', color: 'text-amber-500', icon: '🍞' },
                    { label: 'Fat', val: dailyTotal.fat, unit: 'g', color: 'text-rose-500', icon: '🥑' }
                ].map((stat, i) => (
                    <div key={i} className="card-bg p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-2xl mb-1">{stat.icon}</span>
                        <span className={text-2xl font-bold ${stat.color}}>{Math.round(stat.val)}{stat.unit}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* --- Left Column: Food "Pantry" Search --- */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="card-bg rounded-2xl p-5 h-full flex flex-col shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span>🔍</span> Find Foods
                        </h3>
                        
                        {/* Search Bar */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={foodSearchQuery}
                                onChange={(e) => setFoodSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="input-style flex-1 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                                onClick={searchFoods}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-bold transition-colors"
                            >
                                Go
                            </button>
                        </div>

                        {/* Available Foods List */}
                        <div className="flex-1 overflow-y-auto max-h-[600px] custom-scroll space-y-3 pr-2">
                            {availableFoods.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No foods found.</div>
                            ) : (
                                availableFoods.slice(0, 20).map((food, index) => (
                                    <div key={food._id || index} className="input-style p-3 rounded-xl border hover:border-emerald-400 transition-colors group">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">{food.name}</h4>
                                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded uppercase">
                                                {food.category}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            {food.nutrition.calories} cal • {food.nutrition.protein}g P
                                        </div>
                                        
                                        {/* Add Buttons Grid */}
                                        <div className="grid grid-cols-3 gap-1">
                                            {mealTypes.slice(0, 3).map(mealType => (
                                                <button
                                                    key={mealType.id}
                                                    onClick={() => addFoodToMeal(mealType.id, food)}
                                                    className="text-[10px] py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded hover:bg-emerald-500 hover:text-white transition-colors"
                                                >
                                                    + {mealType.name}
                                                </button>
                                            ))}
                                            {/* Condensed Snack Button */}
                                            <button
                                                onClick={() => addFoodToMeal('snack-1', food)}
                                                className="text-[10px] py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-500 hover:text-white transition-colors col-span-3 mt-1"
                                            >
                                                + Add to Snack
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Meal Slots --- */}
                <div className="lg:col-span-2 space-y-6">
                    {mealPlan.meals.map((meal) => {
                        const mealType = mealTypes.find(m => m.id === meal.name) || mealTypes[3];
                        const nutrition = calculateMealNutrition(meal);
                        
                        return (
                            <div key={meal.name} className="card-bg rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                                {/* Meal Header */}
                                <div className={px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center ${mealType.bg}}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{mealType.icon}</span>
                                        <div>
                                            <h3 className={text-lg font-bold capitalize ${mealType.color}}>{mealType.name}</h3>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                                        {nutrition.calories} kcal • {nutrition.protein}g P • {nutrition.carbs}g C
                                    </div>
                                </div>

                                {/* Meal Items */}
                                <div className="p-4 space-y-2">
                                    {meal.items.length === 0 ? (
                                        <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                                            No foods added. Select from the list.
                                        </div>
                                    ) : (
                                        meal.items.map((item, itemIndex) => {
                                            if (!item.food) return null;
                                            const foodNutrition = calculateFoodNutrition(item.food, item.servingSize);
                                            
                                            return (
                                                <div key={itemIndex} className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-colors">
                                                    
                                                    {/* Item Info */}
                                                    <div className="flex-1 w-full text-center sm:text-left">
                                                        <h4 className="font-bold text-gray-800 dark:text-gray-200">{item.food.name}</h4>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{foodNutrition.calories} kcal</span>
                                                            <span className="mx-1">•</span>
                                                            P: {foodNutrition.protein}g • C: {foodNutrition.carbs}g
                                                        </div>
                                                    </div>

                                                    {/* Controls */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-lg p-1">
                                                            <input
                                                                type="number"
                                                                value={item.servingSize.amount}
                                                                onChange={(e) => updateFoodServing(meal.name, itemIndex, 'servingSize', { amount: e.target.value })}
                                                                className="w-16 text-center bg-transparent font-bold text-gray-700 dark:text-gray-200 outline-none text-sm"
                                                            />
                                                            <select
                                                                value={item.servingSize.unit}
                                                                onChange={(e) => updateFoodServing(meal.name, itemIndex, 'servingSize', { unit: e.target.value })}
                                                                className="bg-transparent text-xs text-gray-500 outline-none pr-1"
                                                            >
                                                                <option value="g">g</option>
                                                                <option value="ml">ml</option>
                                                                <option value="cup">cup</option>
                                                                <option value="tbsp">tbsp</option>
                                                                <option value="pc">pc</option>
                                                            </select>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFoodFromMeal(meal.name, itemIndex)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Remove"
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Notes Area */}
                    <div className="card-bg rounded-2xl p-6 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <span>📝</span> Daily Notes
                        </label>
                        <textarea
                            value={mealPlan.notes || ''}
                            onChange={(e) => setMealPlan(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="How did you feel today? Any digestive issues?"
                            rows="3"
                            className="input-style w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealPlanner;











diet.js in backend routes folder

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
    console.log(🥗 Diet API: ${req.method} ${req.originalUrl});
    next();
});

// ========== PUBLIC DEBUG ROUTES ==========

// Debug environment variables (PUBLIC - no auth required)
router.get('/debug-env', (req, res) => {
    res.json({
        success: true,
        environment: {
            USDA_API_KEY: process.env.USDA_API_KEY ? Set (${process.env.USDA_API_KEY.substring(0, 10)}...) : 'Missing',
            EDAMAM_APP_ID: process.env.EDAMAM_APP_ID ? Set (${process.env.EDAMAM_APP_ID.substring(0, 10)}...) : 'Missing',
            EDAMAM_APP_KEY: process.env.EDAMAM_APP_KEY ? Set (${process.env.EDAMAM_APP_KEY.substring(0, 10)}...) : 'Missing',
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
            console.log(\n🔍 Testing: ${query});
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
            https://api.nal.usda.gov/fdc/v1/foods/search,
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
            https://api.nal.usda.gov/fdc/v1/foods/search,
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
            https://api.nal.usda.gov/fdc/v1/foods/search,
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
                keyPreview: ${process.env.USDA_API_KEY.substring(0, 8)}...
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
                console.log(🔍 Testing: "${testCase.query}");
                
                const response = await axios.get(
                    https://api.nal.usda.gov/fdc/v1/foods/search,
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
                preview: ${process.env.USDA_API_KEY.substring(0, 8)}...
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
            https://api.nal.usda.gov/fdc/v1/foods/search,
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
                keyPreview: ${process.env.USDA_API_KEY.substring(0, 8)}...,
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
                keyPreview: process.env.USDA_API_KEY ? ${process.env.USDA_API_KEY.substring(0, 8)}... : 'N/A',
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

        console.log(✅ Added ${createdFoods.length} sample foods to database);
        
        res.json({
            success: true,
            message: Added ${createdFoods.length} sample foods to database,
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



// Add this route in routes/diet.js - either in public or protected section

// Save external food to our database
router.post('/foods/save-external', async (req, res) => {
    try {
        console.log('➕ Saving external food to database');
        
        const { foodData } = req.body;
        const userId = req.user?.userId; // Optional: can be null for system foods
        
        if (!foodData || !foodData.name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Food data is required' 
            });
        }
        
        // Check if food already exists by externalId or similar name
        let existingFood = null;
        
        if (foodData.externalId) {
            existingFood = await Food.findOne({ 
                externalId: foodData.externalId 
            });
        }
        
        // If not found by externalId, check by name and nutrition
        if (!existingFood) {
            existingFood = await Food.findOne({ 
                name: foodData.name,
                'nutrition.calories': foodData.nutrition?.calories || 0,
                source: foodData.source || 'usda'
            });
        }
        
        if (!existingFood) {
            // Create new food
            existingFood = new Food({
                name: foodData.name,
                brand: foodData.brand || 'Generic',
                servingSize: foodData.servingSize || { 
                    amount: 100, 
                    unit: 'g' 
                },
                nutrition: foodData.nutrition || {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    fiber: 0,
                    sugar: 0,
                    sodium: 0,
                    cholesterol: 0
                },
                category: foodData.category || 'other',
                source: foodData.source || 'usda',
                externalId: foodData.externalId,
                isPublic: true,
                createdBy: userId || null
            });
            await existingFood.save();
            console.log(✅ New food saved: ${existingFood.name});
        } else {
            console.log(✅ Food already exists: ${existingFood.name});
        }
        
        res.json({ 
            success: true, 
            food: existingFood 
        });
        
    } catch (error) {
        console.error('❌ Error saving external food:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save food: ' + error.message 
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

        console.log(✅ Found ${foods.length} foods);
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

        console.log(✅ Found ${progress.length} progress records);
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

export default router;















api.js in frontend services folder

import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Configure axios to include token in all requests
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = Bearer ${token};
    }
    return config;
});

export const authAPI = {
    register: async (userData) => {
        const res = await axios.post(${API_BASE_URL}/auth/register, userData);
        return res.data;
    },

    login: async (credentials) => {
        const res = await axios.post(${API_BASE_URL}/auth/login, credentials);
        return res.data;
    },

    forgotPassword: async (email) => {
        const res = await axios.post(${API_BASE_URL}/auth/forgot-password, { email });
        return res.data;
    },

    resetPassword: async (resetToken, password) => {
        const res = await axios.put(${API_BASE_URL}/auth/reset-password/${resetToken}, { password });
        return res.data;
    }
};

// NEW: Diet Planner API functions
export const dietAPI = {
    // User Profile
    getProfile: async () => {
        const res = await axios.get(${API_BASE_URL}/diet/profile);
        return res.data;
    },

    updateProfile: async (profileData) => {
        const res = await axios.post(${API_BASE_URL}/diet/profile, profileData);
        return res.data;
    },

    // Food Search
    searchFoods: async (query) => {
        const res = await axios.get(${API_BASE_URL}/diet/foods/search?query=${query});
        return res.data;
    },

    getFoods: async (search = '', category = '', page = 1) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        params.append('page', page);
        
        const res = await axios.get(${API_BASE_URL}/diet/foods?${params});
        return res.data;
    },

    addFood: async (foodData) => {
        const res = await axios.post(${API_BASE_URL}/diet/foods, foodData);
        return res.data;
    },

    // Add this new method
    saveExternalFood: async (foodData) => {
        const res = await axios.post(${API_BASE_URL}/diet/foods/save-external, { foodData });
        return res.data;
    },

    // Meal Planning
    getMealPlan: async (date) => {
        const res = await axios.get(${API_BASE_URL}/diet/meal-plan/${date});
        return res.data;
    },

    saveMealPlan: async (date, mealPlanData) => {
        const res = await axios.post(${API_BASE_URL}/diet/meal-plan/${date}, mealPlanData);
        return res.data;
    },

    // Progress Tracking
    recordProgress: async (progressData) => {
        const res = await axios.post(${API_BASE_URL}/diet/progress, progressData);
        return res.data;
    },

    getProgress: async (limit = 30) => {
        const res = await axios.get(${API_BASE_URL}/diet/progress?limit=${limit});
        return res.data;
    },

    // Dashboard
    getDashboard: async () => {
        const res = await axios.get(${API_BASE_URL}/diet/dashboard);
        return res.data;
    }
};
