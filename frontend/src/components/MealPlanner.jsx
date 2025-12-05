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

    const addFoodToMeal = (mealName, foodItem = null) => {
        if (foodItem) {
            setMealPlan(prev => ({
                ...prev,
                meals: prev.meals.map(meal => 
                    meal.name === mealName 
                        ? { 
                            ...meal, 
                            items: [...meal.items, { 
                                food: foodItem,
                                servingSize: { amount: 100, unit: 'g' },
                                customName: foodItem.name
                            }] 
                        }
                        : meal
                )
            }));
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
                        <span className={`text-2xl font-bold ${stat.color}`}>{Math.round(stat.val)}{stat.unit}</span>
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
                                <div className={`px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center ${mealType.bg}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{mealType.icon}</span>
                                        <div>
                                            <h3 className={`text-lg font-bold capitalize ${mealType.color}`}>{mealType.name}</h3>
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
                                                            🗑️
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

export default MealPlanner;