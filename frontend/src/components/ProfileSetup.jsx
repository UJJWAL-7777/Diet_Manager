import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';

const ProfileSetup = ({ onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        height: '',
        weight: '',
        goal: 'maintenance',
        activityLevel: 'moderate',
        dietaryRestrictions: [],
        allergies: []
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [calculatedTargets, setCalculatedTargets] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const result = await dietAPI.getProfile();
            if (result.success && result.profile) {
                setFormData({
                    age: result.profile.age || '',
                    gender: result.profile.gender || '',
                    height: result.profile.height || '',
                    weight: result.profile.weight || '',
                    goal: result.profile.goal || 'maintenance',
                    activityLevel: result.profile.activityLevel || 'moderate',
                    dietaryRestrictions: result.profile.dietaryRestrictions || [],
                    allergies: result.profile.allergies || []
                });
                if (result.profile.dailyCalories) {
                    setCalculatedTargets({
                        calories: result.profile.dailyCalories,
                        protein: result.profile.proteinTarget,
                        carbs: result.profile.carbsTarget,
                        fat: result.profile.fatTarget
                    });
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            if (name === 'dietaryRestrictions') {
                setFormData(prev => ({
                    ...prev,
                    dietaryRestrictions: checked 
                        ? [...prev.dietaryRestrictions, value]
                        : prev.dietaryRestrictions.filter(item => item !== value)
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAllergyChange = (e) => {
        const allergies = e.target.value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(prev => ({
            ...prev,
            allergies
        }));
    };

    const calculateTargets = () => {
        const { age, gender, height, weight, activityLevel, goal } = formData;
        
        if (!age || !gender || !height || !weight) {
            setMessage({ type: 'error', text: 'Please fill age, gender, height, and weight to calculate targets' });
            return;
        }

        // Basic BMR calculation
        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        // Activity multiplier
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9
        };

        let maintenanceCalories = bmr * (activityMultipliers[activityLevel] || 1.55);

        // Goal adjustment
        if (goal === 'weight_loss') {
            maintenanceCalories -= 500;
        } else if (goal === 'weight_gain' || goal === 'muscle_gain') {
            maintenanceCalories += 500;
        }

        const calories = Math.round(maintenanceCalories);
        const protein = Math.round((calories * 0.3) / 4);
        const fat = Math.round((calories * 0.25) / 9);
        const carbs = Math.round((calories * 0.45) / 4);

        setCalculatedTargets({ calories, protein, carbs, fat });
        setMessage({ type: 'success', text: 'Targets calculated successfully!' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await dietAPI.updateProfile(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile saved successfully!' });
                if (onProfileUpdate) onProfileUpdate();
                
                if (result.profile) {
                    setCalculatedTargets({
                        calories: result.profile.dailyCalories,
                        protein: result.profile.proteinTarget,
                        carbs: result.profile.carbsTarget,
                        fat: result.profile.fatTarget
                    });
                }
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error saving profile' });
        } finally {
            setLoading(false);
        }
    };

    // --- Custom Styles & Classes ---
    const styles = `
        /* Inheriting theme variables from parent if available, else defaults */
        .input-field {
            background-color: var(--bg-main, #f8fafc);
            color: var(--text-main, #0f172a);
            border: 1px solid var(--border, #e2e8f0);
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
            outline: none;
        }
        
        .diet-tag-checkbox {
            position: absolute;
            opacity: 0;
            cursor: pointer;
        }
        
        .diet-tag-label {
            transition: all 0.2s;
        }
        
        .diet-tag-checkbox:checked + .diet-tag-label {
            background-color: #ecfdf5; /* emerald-50 */
            border-color: #10b981;    /* emerald-500 */
            color: #047857;           /* emerald-700 */
            font-weight: 600;
        }
        /* Dark mode specific for checked state */
        .dark .diet-tag-checkbox:checked + .diet-tag-label {
            background-color: rgba(16, 185, 129, 0.2);
            border-color: #10b981;
            color: #34d399;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeIn 0.4s ease-out forwards; }
    `;

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-enter">
            <style>{styles}</style>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* --- Header --- */}
                <div className="card-bg rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Setup</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Fine-tune your personal details for accurate nutrition.</p>
                    </div>
                    {/* Status Message */}
                    {message.text && (
                        <div className={`px-4 py-2 rounded-xl text-sm font-medium animate-enter ${
                            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {message.text}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* --- Left Column: Personal Info --- */}
                    <div className="space-y-6">
                        {/* Personal Details Card */}
                        <div className="card-bg rounded-3xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span>👤</span> Personal Details
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="input-field w-full px-4 py-2.5 rounded-xl"
                                        placeholder="Years"
                                        min="13" max="120"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="input-field w-full px-4 py-2.5 rounded-xl"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Height (cm)</label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="input-field w-full px-4 py-2.5 rounded-xl"
                                        placeholder="cm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="input-field w-full px-4 py-2.5 rounded-xl"
                                        placeholder="kg"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lifestyle Card */}
                        <div className="card-bg rounded-3xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span>🏃</span> Lifestyle & Goals
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Main Goal</label>
                                    <select
                                        name="goal"
                                        value={formData.goal}
                                        onChange={handleChange}
                                        className="input-field w-full px-4 py-2.5 rounded-xl"
                                    >
                                        <option value="weight_loss">📉 Weight Loss</option>
                                        <option value="weight_gain">📈 Weight Gain</option>
                                        <option value="muscle_gain">💪 Muscle Gain</option>
                                        <option value="maintenance">⚖️ Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Activity Level</label>
                                    <select
                                        name="activityLevel"
                                        value={formData.activityLevel}
                                        onChange={handleChange}
                                        className="input-field w-full px-4 py-2.5 rounded-xl"
                                    >
                                        <option value="sedentary">Sedentary (Office job, no exercise)</option>
                                        <option value="light">Light (Exercise 1-3x/week)</option>
                                        <option value="moderate">Moderate (Exercise 3-5x/week)</option>
                                        <option value="active">Active (Exercise 6-7x/week)</option>
                                        <option value="very_active">Very Active (Physical job + training)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Preferences & Results --- */}
                    <div className="space-y-6">
                        
                        {/* Dietary Preferences Card */}
                        <div className="card-bg rounded-3xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span>🥗</span> Dietary Preferences
                            </h3>
                            
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Dietary Restrictions</label>
                            <div className="flex flex-wrap gap-2 mb-5">
                                {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'].map(restriction => (
                                    <label key={restriction} className="relative">
                                        <input
                                            type="checkbox"
                                            name="dietaryRestrictions"
                                            value={restriction}
                                            checked={formData.dietaryRestrictions.includes(restriction)}
                                            onChange={handleChange}
                                            className="diet-tag-checkbox"
                                        />
                                        <span className="diet-tag-label inline-block px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-sm hover:border-gray-300">
                                            {restriction.replace('-', ' ')}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Allergies</label>
                                <input
                                    type="text"
                                    value={formData.allergies.join(', ')}
                                    onChange={handleAllergyChange}
                                    placeholder="e.g., peanuts, shellfish, dairy"
                                    className="input-field w-full px-4 py-2.5 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Calculated Targets Widget */}
                        <div className="card-bg rounded-3xl p-6 shadow-sm border-t-4 border-t-emerald-500">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Targets</h3>
                                <button
                                    type="button"
                                    onClick={calculateTargets}
                                    disabled={!formData.age || !formData.gender || !formData.height || !formData.weight}
                                    className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                                >
                                    ↻ Recalculate
                                </button>
                            </div>

                            {calculatedTargets ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl text-center">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{calculatedTargets.calories}</div>
                                        <div className="text-xs font-medium text-orange-800 dark:text-orange-300">Calories</div>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl text-center">
                                        <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{calculatedTargets.protein}g</div>
                                        <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Protein</div>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-center">
                                        <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{calculatedTargets.carbs}g</div>
                                        <div className="text-xs font-medium text-amber-800 dark:text-amber-300">Carbs</div>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl text-center">
                                        <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{calculatedTargets.fat}g</div>
                                        <div className="text-xs font-medium text-rose-800 dark:text-rose-300">Fat</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400 text-sm italic bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                                    Fill in your details and click calculate to see your nutrition plan.
                                </div>
                            )}
                        </div>

                        {/* Save Action */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfileSetup;