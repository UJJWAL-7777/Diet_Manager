import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';

const ProgressTracker = () => {
    const [progressData, setProgressData] = useState({
        weight: '',
        measurements: {
            chest: '',
            waist: '',
            hips: '',
            arms: '',
            thighs: ''
        },
        mood: 'good',
        energyLevel: 5,
        notes: ''
    });
    const [progressHistory, setProgressHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadProgressHistory();
    }, []);

    const loadProgressHistory = async () => {
        try {
            const result = await dietAPI.getProgress(10);
            if (result.success) {
                setProgressHistory(result.progress);
            }
        } catch (error) {
            console.error('Error loading progress history:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('measurements.')) {
            const measurementType = name.split('.')[1];
            setProgressData(prev => ({
                ...prev,
                measurements: {
                    ...prev.measurements,
                    [measurementType]: value
                }
            }));
        } else {
            setProgressData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await dietAPI.recordProgress(progressData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Progress recorded successfully!' });
                setProgressData({
                    weight: '',
                    measurements: { chest: '', waist: '', hips: '', arms: '', thighs: '' },
                    mood: 'good',
                    energyLevel: 5,
                    notes: ''
                });
                loadProgressHistory();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error recording progress' });
        } finally {
            setSaving(false);
        }
    };

    const moodOptions = [
        { value: 'excellent', label: 'Excellent', emoji: '😄' },
        { value: 'good', label: 'Good', emoji: '😊' },
        { value: 'okay', label: 'Okay', emoji: '😐' },
        { value: 'poor', label: 'Poor', emoji: '😔' },
        { value: 'terrible', label: 'Terrible', emoji: '😞' }
    ];

    const getWeightChange = (currentIndex) => {
        if (currentIndex === progressHistory.length - 1 || progressHistory.length < 2) return null;
        
        const currentWeight = progressHistory[currentIndex].weight;
        const previousWeight = progressHistory[currentIndex + 1].weight;
        
        if (!currentWeight || !previousWeight) return null;
        
        const change = currentWeight - previousWeight;
        return {
            value: Math.abs(change).toFixed(1),
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
        };
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Progress Entry Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900">Record Progress</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Track your weight, measurements, and how you're feeling.
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

                            {/* Weight */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={progressData.weight}
                                    onChange={handleChange}
                                    step="0.1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter your current weight"
                                />
                            </div>

                            {/* Measurements */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Body Measurements (cm)
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[
                                        { key: 'chest', label: 'Chest' },
                                        { key: 'waist', label: 'Waist' },
                                        { key: 'hips', label: 'Hips' },
                                        { key: 'arms', label: 'Arms' },
                                        { key: 'thighs', label: 'Thighs' }
                                    ].map(measurement => (
                                        <div key={measurement.key}>
                                            <label className="block text-xs text-gray-600 mb-1">
                                                {measurement.label}
                                            </label>
                                            <input
                                                type="number"
                                                name={`measurements.${measurement.key}`}
                                                value={progressData.measurements[measurement.key]}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="cm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mood and Energy */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mood
                                    </label>
                                    <div className="space-y-2">
                                        {moodOptions.map(option => (
                                            <label key={option.value} className="flex items-center space-x-3">
                                                <input
                                                    type="radio"
                                                    name="mood"
                                                    value={option.value}
                                                    checked={progressData.mood === option.value}
                                                    onChange={handleChange}
                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm">
                                                    <span className="mr-2">{option.emoji}</span>
                                                    {option.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Energy Level: {progressData.energyLevel}/10
                                    </label>
                                    <input
                                        type="range"
                                        name="energyLevel"
                                        min="1"
                                        max="10"
                                        value={progressData.energyLevel}
                                        onChange={handleChange}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Low</span>
                                        <span>High</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={progressData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="How are you feeling? Any observations about your progress?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving || !progressData.weight}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Progress'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Progress History */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Progress</h3>
                        </div>

                        <div className="p-6">
                            {progressHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No progress records yet. Start tracking to see your history here!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {progressHistory.map((entry, index) => {
                                        const weightChange = getWeightChange(index);
                                        
                                        return (
                                            <div key={entry._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-semibold">
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </div>
                                                    {weightChange && (
                                                        <span className={`text-xs px-2 py-1 rounded ${
                                                            weightChange.direction === 'down' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : weightChange.direction === 'up'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {weightChange.direction === 'down' ? '↓' : '↑'} 
                                                            {weightChange.value}kg
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {entry.weight && (
                                                    <div className="text-lg font-bold text-indigo-600 mb-2">
                                                        {entry.weight} kg
                                                    </div>
                                                )}
                                                
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    {entry.mood && (
                                                        <div>
                                                            Mood: {moodOptions.find(m => m.value === entry.mood)?.emoji} {moodOptions.find(m => m.value === entry.mood)?.label}
                                                        </div>
                                                    )}
                                                    {entry.energyLevel && (
                                                        <div>
                                                            Energy: {entry.energyLevel}/10
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {entry.notes && (
                                                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                        {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;