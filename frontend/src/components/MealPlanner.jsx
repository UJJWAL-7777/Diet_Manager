import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';

const MealPlanner = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [mealPlan, setMealPlan] = useState({ meals: [] });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [availableFoods, setAvailableFoods] = useState([]);
    const [foodSearchQuery, setFoodSearchQuery] = useState('');

    const mealTypes = [
        { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
        { id: 'lunch', name: 'Lunch', icon: '🍲' },
        { id: 'dinner', name: 'Dinner', icon: '🍛' },
        { id: 'snack-1', name: 'Snack 1', icon: '🍎' },
        { id: 'snack-2', name: 'Snack 2', icon: '🥜' },
        { id: 'snack-3', name: 'Snack 3', icon: '🥛' }
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
                // Ensure all meal types exist
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
            // Filter out empty food items before saving
            const cleanedMeals = mealPlan.meals.map(meal => ({
                ...meal,
                items: meal.items.filter(item => item.food && item.food._id) // Only items with actual food data
            }));

            const result = await dietAPI.saveMealPlan(selectedDate, {
                meals: cleanedMeals,
                notes: mealPlan.notes || ''
            });
            if (result.success) {
                setMessage({ type: 'success', text: 'Meal plan saved successfully!' });
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
            // Add specific food with real nutrition data
            setMealPlan(prev => ({
                ...prev,
                meals: prev.meals.map(meal => 
                    meal.name === mealName 
                        ? { 
                            ...meal, 
                            items: [...meal.items, { 
                                food: foodItem,
                                servingSize: { 
                                    amount: 100, // Default serving
                                    unit: 'g' 
                                },
                                customName: foodItem.name
                            }] 
                        }
                        : meal
                )
            }));
        } else {
            // Just show food selection, don't add empty item
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

    // REAL NUTRITION CALCULATION
    const calculateFoodNutrition = (food, servingSize) => {
        if (!food || !food.nutrition) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        const ratio = servingSize.amount / food.servingSize.amount;
        
        return {
            calories: Math.round(food.nutrition.calories * ratio),
            protein: Math.round(food.nutrition.protein * ratio * 10) / 10, // 1 decimal
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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const dailyTotal = calculateDailyTotal();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Meal Planner</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Plan your meals for the day and track your nutrition.
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={saveMealPlan}
                                disabled={saving}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Plan'}
                            </button>
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`m-6 p-4 rounded-md ${
                        message.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : message.type === 'error'
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Daily Nutrition Summary */}
                <div className="p-6 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold text-black mb-3">Daily Nutrition Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-indigo-600">{dailyTotal.calories}</div>
                            <div className="text-sm text-gray-600">Calories</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-green-600">{dailyTotal.protein}g</div>
                            <div className="text-sm text-gray-600">Protein</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-yellow-600">{dailyTotal.carbs}g</div>
                            <div className="text-sm text-gray-600">Carbs</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl font-bold text-red-600">{dailyTotal.fat}g</div>
                            <div className="text-sm text-gray-600">Fat</div>
                        </div>
                    </div>
                </div>

                {/* Food Search Section */}
                <div className="p-6 border-b bg-gray-50">
                    <h3 className="text-lg font-semibold text-black mb-3">Add Foods to Your Meals</h3>
                    <div className="flex space-x-4 mb-4">
                        <input
                            type="text"
                            value={foodSearchQuery}
                            onChange={(e) => setFoodSearchQuery(e.target.value)}
                            placeholder="Search foods (apple, chicken, rice...)"
                            className="text-black flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={searchFoods}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                            Search
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                        {availableFoods.slice(0, 9).map((food, index) => (
                            <div key={food._id || index} className="bg-white p-3 rounded border">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{food.name}</h4>
                                        <p className="text-sm text-gray-600">{food.brand}</p>
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                                        {food.category}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                    {food.nutrition.calories} cal • {food.nutrition.protein}g protein
                                </div>
                                <div className="flex space-x-2">
                                    {mealTypes.slice(0, 3).map(mealType => (
                                        <button
                                            key={mealType.id}
                                            onClick={() => addFoodToMeal(mealType.id, food)}
                                            className="flex-1 bg-green-600 text-white text-xs py-1 rounded hover:bg-green-700"
                                        >
                                            + {mealType.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meal Sections */}
                <div className="p-6 space-y-6">
                    {mealPlan.meals.map((meal, mealIndex) => {
                        const mealType = mealTypes.find(m => m.id === meal.name);
                        const nutrition = calculateMealNutrition(meal);
                        
                        return (
                            <div key={meal.name} className="border border-gray-200 rounded-lg">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl">{mealType?.icon}</span>
                                            <h3 className="text-lg font-semibold capitalize text-black">{mealType?.name}</h3>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-sm text-gray-600">
                                                {nutrition.calories} cal • {nutrition.protein}g protein
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {meal.items.length === 0 ? (
                                        <div className="text-center py-6 text-gray-500">
                                            No foods added yet. Select foods from above to add to this meal.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {meal.items.map((item, itemIndex) => {
                                                if (!item.food) return null; // Skip empty items
                                                
                                                const foodNutrition = calculateFoodNutrition(item.food, item.servingSize);
                                                
                                                return (
                                                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900">{item.food.name}</h4>
                                                                    <p className="text-sm text-gray-600">{item.food.brand}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-indigo-600">{foodNutrition.calories} cal</div>
                                                                    <div className="text-xs text-gray-600">
                                                                        P: {foodNutrition.protein}g • C: {foodNutrition.carbs}g • F: {foodNutrition.fat}g
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <input
                                                                    type="number"
                                                                    value={item.servingSize.amount}
                                                                    onChange={(e) => updateFoodServing(meal.name, itemIndex, 'servingSize', { amount: e.target.value })}
                                                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                />
                                                                <select
                                                                    value={item.servingSize.unit}
                                                                    onChange={(e) => updateFoodServing(meal.name, itemIndex, 'servingSize', { unit: e.target.value })}
                                                                    className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                >
                                                                    <option value="g">g</option>
                                                                    <option value="ml">ml</option>
                                                                    <option value="cup">cup</option>
                                                                    <option value="tbsp">tbsp</option>
                                                                    <option value="tsp">tsp</option>
                                                                    <option value="piece">piece</option>
                                                                    <option value="slice">slice</option>
                                                                </select>
                                                                <span className="text-sm text-gray-600">
                                                                    = {Math.round((item.servingSize.amount / item.food.servingSize.amount) * 100)}% of serving
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFoodFromMeal(meal.name, itemIndex)}
                                                            className="text-red-600 hover:text-red-800 p-2 ml-4"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Notes Section */}
                <div className="p-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                    </label>
                    <textarea
                        value={mealPlan.notes || ''}
                        onChange={(e) => setMealPlan(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any notes about your meal plan..."
                        rows="3"
                        className=" text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default MealPlanner;