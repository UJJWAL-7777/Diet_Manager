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

    // Helper for category icons
    const getCategoryIcon = (cat) => {
        const map = {
            fruits: '🍎', vegetables: '🥦', grains: '🍞', protein: '🥩',
            dairy: '🥛', fats: '🥑', beverages: '🥤', snacks: '🍪',
            condiments: '🧂', other: '🍽️'
        };
        return map[cat] || '🍽️';
    };

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

    // --- Custom CSS Styles ---
    const styles = `
        /* Inherits variables from Dashboard */
        .search-input {
            background-color: var(--bg-main);
            color: var(--text-main);
            border: 1px solid var(--border);
            transition: all 0.2s;
        }
        .search-input:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            outline: none;
        }
        .macro-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0.5rem;
            border-radius: 0.75rem;
            background-color: var(--bg-main);
        }
        .modal-overlay {
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            position: fixed;
            inset: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-enter { animation: slideUp 0.3s ease-out forwards; }
    `;

    // --- Redesigned Food Item Card ---
    const FoodItem = ({ food }) => (
        <div className="card-bg p-5 rounded-2xl hover:shadow-lg transition-all duration-300 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900 group">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-xl shadow-sm">
                        {getCategoryIcon(food.category)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{food.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{food.brand || 'Generic'}</p>
                    </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">
                    {food.category}
                </span>
            </div>
            
            {/* Macros Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="macro-badge">
                    <span className="text-xs text-gray-400 font-medium">Cals</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{food.nutrition.calories}</span>
                </div>
                <div className="macro-badge">
                    <span className="text-xs text-gray-400 font-medium">Pro</span>
                    <span className="font-bold text-emerald-600">{food.nutrition.protein}g</span>
                </div>
                <div className="macro-badge">
                    <span className="text-xs text-gray-400 font-medium">Carb</span>
                    <span className="font-bold text-amber-500">{food.nutrition.carbs}g</span>
                </div>
                <div className="macro-badge">
                    <span className="text-xs text-gray-400 font-medium">Fat</span>
                    <span className="font-bold text-rose-500">{food.nutrition.fat}g</span>
                </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-500">
                    Serving: <span className="font-semibold text-gray-700 dark:text-gray-300">{food.servingSize.amount} {food.servingSize.unit}</span>
                </div>
                {food.source && (
                    <span className="text-[10px] text-gray-400 italic">Src: {food.source}</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-enter">
            <style>{styles}</style>

            {/* --- Hero Search Section --- */}
            <div className="card-bg rounded-3xl p-8 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Food Database</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                    Search thousands of foods, track your macros, or add your own custom recipes to build your perfect diet.
                </p>

                <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative flex items-center">
                    <span className="absolute left-4 text-xl">🔍</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try 'Grilled Chicken', 'Avocado', or 'Oats'..."
                        className="search-input w-full pl-12 pr-32 py-4 rounded-2xl text-lg shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading || !searchQuery.trim()}
                        className="absolute right-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '...' : 'Search'}
                    </button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-10 text-left animate-enter">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Search Results</h3>
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{searchResults.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {searchResults.map((food, index) => (
                                <FoodItem key={index} food={food} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Library Section --- */}
            <div className="card-bg rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">📚</span>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Library</h3>
                            <p className="text-xs text-gray-500">Foods you've added locally</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="search-input px-4 py-2.5 rounded-xl text-sm font-medium w-full md:w-48 cursor-pointer"
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
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-transform hover:-translate-y-0.5 whitespace-nowrap"
                        >
                            + Add Food
                        </button>
                    </div>
                </div>

                {localFoods.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-slate-800/50">
                        <div className="text-4xl mb-3 opacity-50">🥗</div>
                        <p className="text-gray-500 font-medium">Your library is empty.</p>
                        <button onClick={() => setShowAddForm(true)} className="text-indigo-500 font-bold text-sm mt-2 hover:underline">
                            Add your first item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {localFoods.map((food) => (
                            <FoodItem key={food._id} food={food} isCustom={true} />
                        ))}
                    </div>
                )}
            </div>

            {/* --- Add Custom Food Modal --- */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="card-bg w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll rounded-2xl shadow-2xl relative animate-enter m-4">
                        
                        {/* Header */}
                        <div className="sticky top-0 z-10 card-bg border-b border-gray-100 dark:border-gray-700 p-5 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>📝</span> Add Custom Food
                            </h3>
                            <button 
                                onClick={() => setShowAddForm(false)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleAddCustomFood} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Food Name</label>
                                        <input
                                            type="text"
                                            value={customFood.name}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            className="search-input w-full px-4 py-3 rounded-xl font-medium"
                                            placeholder="e.g. Mom's Lasagna"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Brand / Source</label>
                                        <input
                                            type="text"
                                            value={customFood.brand}
                                            onChange={(e) => setCustomFood(prev => ({ ...prev, brand: e.target.value }))}
                                            className="search-input w-full px-4 py-3 rounded-xl"
                                            placeholder="e.g. Homemade"
                                        />
                                    </div>
                                </div>

                                {/* Serving Info */}
                                <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Serving Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                                            <input
                                                type="number"
                                                value={customFood.servingSize.amount}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, servingSize: { ...prev.servingSize, amount: e.target.value } }))}
                                                required
                                                className="search-input w-full px-3 py-2 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Unit</label>
                                            <select
                                                value={customFood.servingSize.unit}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, servingSize: { ...prev.servingSize, unit: e.target.value } }))}
                                                className="search-input w-full px-3 py-2 rounded-lg"
                                            >
                                                {['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'].map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Category</label>
                                            <select
                                                value={customFood.category}
                                                onChange={(e) => setCustomFood(prev => ({ ...prev, category: e.target.value }))}
                                                className="search-input w-full px-3 py-2 rounded-lg"
                                            >
                                                {categories.map(c => (
                                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Macros Section */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                        <span>📊</span> Nutrition Facts <span className="text-gray-400 font-normal text-xs">(per serving)</span>
                                    </h4>
                                    
                                    {/* Primary Macros */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {[
                                            { key: 'calories', label: 'Calories', color: 'text-gray-500' },
                                            { key: 'protein', label: 'Protein (g)', color: 'text-emerald-500' },
                                            { key: 'carbs', label: 'Carbs (g)', color: 'text-amber-500' },
                                            { key: 'fat', label: 'Fat (g)', color: 'text-rose-500' }
                                        ].map((macro) => (
                                            <div key={macro.key} className="relative">
                                                <label className={`block text-xs font-bold mb-1 ${macro.color}`}>{macro.label}</label>
                                                <input
                                                    type="number"
                                                    value={customFood.nutrition[macro.key]}
                                                    onChange={(e) => setCustomFood(prev => ({
                                                        ...prev,
                                                        nutrition: { ...prev.nutrition, [macro.key]: e.target.value }
                                                    }))}
                                                    className="search-input w-full px-3 py-2.5 rounded-xl text-center font-bold text-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Secondary Macros */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                         {['fiber', 'sugar', 'sodium', 'cholesterol'].map((nut) => (
                                            <div key={nut}>
                                                <label className="block text-xs text-gray-400 capitalize mb-1">{nut}</label>
                                                <input
                                                    type="number"
                                                    value={customFood.nutrition[nut]}
                                                    onChange={(e) => setCustomFood(prev => ({
                                                        ...prev,
                                                        nutrition: { ...prev.nutrition, [nut]: e.target.value }
                                                    }))}
                                                    className="search-input w-full px-3 py-1.5 rounded-lg text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-transform active:scale-95"
                                    >
                                        Save Food
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