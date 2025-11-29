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
                
                // Update calculated targets from server response
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-900">Profile Setup</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Set up your personal information and goals for personalized nutrition targets.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {message.text && (
                        <div className={`p-4 rounded-md ${
                            message.type === 'success' 
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age
                            </label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                min="13"
                                max="120"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                min="100"
                                max="250"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                min="30"
                                max="300"
                                step="0.1"
                            />
                        </div>
                    </div>

                    {/* Goals and Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Goal
                            </label>
                            <select
                                name="goal"
                                value={formData.goal}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="weight_loss">Weight Loss</option>
                                <option value="weight_gain">Weight Gain</option>
                                <option value="muscle_gain">Muscle Gain</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Activity Level
                            </label>
                            <select
                                name="activityLevel"
                                value={formData.activityLevel}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="sedentary">Sedentary (little to no exercise)</option>
                                <option value="light">Light (exercise 1-3 times/week)</option>
                                <option value="moderate">Moderate (exercise 3-5 times/week)</option>
                                <option value="active">Active (exercise 6-7 times/week)</option>
                                <option value="very_active">Very Active (physical job + exercise)</option>
                            </select>
                        </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Dietary Restrictions
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'].map(restriction => (
                                <label key={restriction} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="dietaryRestrictions"
                                        value={restriction}
                                        checked={formData.dietaryRestrictions.includes(restriction)}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700 capitalize">{restriction.replace('-', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allergies (comma separated)
                        </label>
                        <input
                            type="text"
                            value={formData.allergies.join(', ')}
                            onChange={handleAllergyChange}
                            placeholder="e.g., peanuts, shellfish, dairy"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Calculate Targets Button */}
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={calculateTargets}
                            disabled={!formData.age || !formData.gender || !formData.height || !formData.weight}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Calculate Targets
                        </button>
                    </div>

                    {/* Calculated Targets */}
                    {calculatedTargets && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3">Your Daily Targets</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">{calculatedTargets.calories}</div>
                                    <div className="text-sm text-gray-600">Calories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{calculatedTargets.protein}g</div>
                                    <div className="text-sm text-gray-600">Protein</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{calculatedTargets.carbs}g</div>
                                    <div className="text-sm text-gray-600">Carbs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{calculatedTargets.fat}g</div>
                                    <div className="text-sm text-gray-600">Fat</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;