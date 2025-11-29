import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';

const FoodSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [localFoods, setLocalFoods] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [customFood, setCustomFood] = useState({
        name: '',
        brand: 'Generic',
        servingSize: { amount: 100, unit: 'g' },
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 },
        category: 'other'
    });

    const categories = [
        'fruits', 'vegetables', 'grains', 'protein', 'dairy', 
        'fats', 'beverages', 'snacks', 'condiments', 'other'
    ];

    useEffect(() => {
        loadLocalFoods();
    }, [selectedCategory]);

    const loadLocalFoods = async () => {
        try {
            const result = await dietAPI.getFoods('', selectedCategory);
            if (result.success) {
                setLocalFoods(result.foods);
            }
        } catch (error) {
            console.error('Error loading local foods:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const result = await dietAPI.searchFoods(searchQuery);
            if (result.success) {
                setSearchResults(result.results);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching foods:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomFood = async (e) => {
        e.preventDefault();
        try {
            const result = await dietAPI.addFood(customFood);
            if (result.success) {
                setShowAddForm(false);
                setCustomFood({
                    name: '',
                    brand: 'Generic',
                    servingSize: { amount: 100, unit: 'g' },
                    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 },
                    category: 'other'
                });
                loadLocalFoods();
                alert('Food added successfully!');
            }
        } catch (error) {
            alert('Error adding food');
        }
    };

    const FoodItem = ({ food, isCustom = false }) => (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-semibold text-gray-900">{food.name}</h3>
                    <p className="text-sm text-gray-600">{food.brand}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                    {food.category}
                </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                <div>
                    <span className="font-medium">Calories:</span> {food.nutrition.calories}
                </div>
                <div>
                    <span className="font-medium">Protein:</span> {food.nutrition.protein}g
                </div>
                <div>
                    <span className="font-medium">Carbs:</span> {food.nutrition.carbs}g
                </div>
                <div>
                    <span className="font-medium">Fat:</span> {food.nutrition.fat}g
                </div>
            </div>
            
            <div className="text-xs text-gray-500">
                Serving: {food.servingSize.amount} {food.servingSize.unit}
                {food.source && ` • Source: ${food.source}`}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900">Food Search</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Search for foods in our database or add your own custom foods.
                    </p>
                </div>

                {/* Search Section */}
                <div className="p-6 border-b border-gray-200">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for foods (e.g., apple, chicken, rice)"
                                className=" text-black flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={loading || !searchQuery.trim()}
                                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-90"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </form>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Search Results</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.map((food, index) => (
                                    <FoodItem key={index} food={food} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Foods Section */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-black">Food Database</h3>
                        <div className="flex space-x-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className=" text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                                + Add Custom Food
                            </button>
                        </div>
                    </div>

                    {localFoods.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No foods found in the database. Add some custom foods to get started!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {localFoods.map((food) => (
                                <FoodItem key={food._id} food={food} isCustom={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Custom Food Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Add Custom Food</h3>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleAddCustomFood} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Food Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={customFood.name}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Brand
                                        </label>
                                        <input
                                            type="text"
                                            value={customFood.brand}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, brand: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Serving Amount *
                                        </label>
                                        <input
                                            type="number"
                                            value={customFood.servingSize.amount}
                                            onChange={(e) => setCustomFood(prev => ({
                                                ...prev,
                                                servingSize: { ...prev.servingSize, amount: e.target.value }
                                            }))}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Serving Unit *
                                        </label>
                                        <select
                                            value={customFood.servingSize.unit}
                                            onChange={(e) => setCustomFood(prev => ({
                                                ...prev,
                                                servingSize: { ...prev.servingSize, unit: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="g">g</option>
                                            <option value="ml">ml</option>
                                            <option value="cup">cup</option>
                                            <option value="tbsp">tbsp</option>
                                            <option value="tsp">tsp</option>
                                            <option value="piece">piece</option>
                                            <option value="slice">slice</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category *
                                        </label>
                                        <select
                                            value={customFood.category}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-lg font-semibold mb-3">Nutrition Information (per serving)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(customFood.nutrition).map(([nutrient, value]) => (
                                            <div key={nutrient}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                                    {nutrient}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => setCustomFood(prev => ({
                                                        ...prev,
                                                        nutrition: { ...prev.nutrition, [nutrient]: e.target.value }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                    >
                                        Add Food
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodSearch;