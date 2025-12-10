import React, { useState, useEffect } from 'react';
import { dietAPI } from '../services/api';

// --- Icons Import ---
import { 
    FaWeight, 
    FaSmile, 
    FaMeh, 
    FaFrown, 
    FaSadTear, 
    FaGrinStars, 
    FaBolt, 
    FaHistory, 
    FaArrowUp, 
    FaArrowDown, 
    FaChartBar,
    FaBatteryQuarter,
    FaBatteryFull
} from 'react-icons/fa';
import { GiChest, GiBelt, GiShorts, GiBiceps, GiLeg } from 'react-icons/gi';

const ProgressTracker = () => {
    // --- State ---
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

    // --- Effects ---
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
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error recording progress' });
        } finally {
            setSaving(false);
        }
    };

    // Updated Mood Options with Icons
    const moodOptions = [
        { value: 'excellent', label: 'Excellent', icon: <FaGrinStars />, color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
        { value: 'good', label: 'Good', icon: <FaSmile />, color: 'bg-blue-100 border-blue-300 text-blue-800' },
        { value: 'okay', label: 'Okay', icon: <FaMeh />, color: 'bg-gray-100 border-gray-300 text-gray-800' },
        { value: 'poor', label: 'Poor', icon: <FaFrown />, color: 'bg-orange-100 border-orange-300 text-orange-800' },
        { value: 'terrible', label: 'Terrible', icon: <FaSadTear />, color: 'bg-red-100 border-red-300 text-red-800' }
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

    // --- Custom Styles ---
    const styles = `
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
        
        /* Custom Range Slider */
        input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #10b981;
            margin-top: -8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            cursor: pointer;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #cbd5e1; /* Darker gray for light mode */
            border-radius: 2px;
        }
        .dark input[type=range]::-webkit-slider-runnable-track {
            background: #475569;
        }

        .animate-enter {
            animation: slideUp 0.4s ease-out forwards;
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-enter">
            <style>{styles}</style>

            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Progress Tracker</h2>
                <p className="text-gray-600 dark:text-gray-400">Record your journey and visualize your improvements.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- Left Column: Data Entry --- */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="card-bg rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
                        
                        {/* Status Message */}
                        {message.text && (
                            <div className={`p-4 rounded-xl text-center font-medium ${
                                message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                                'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Weight Section */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wide mb-3">
                                Current Weight
                            </label>
                            <div className="relative max-w-xs">
                                <input
                                    type="number"
                                    name="weight"
                                    value={progressData.weight}
                                    onChange={handleChange}
                                    step="0.1"
                                    required
                                    className="search-input w-full pl-4 pr-12 py-4 rounded-2xl text-2xl font-bold text-gray-900 dark:text-white"
                                    placeholder="0.0"
                                />
                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">kg</span>
                            </div>
                        </div>

                        {/* Measurements Grid */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wide mb-4">
                                Body Measurements (cm)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    { key: 'chest', label: 'Chest', icon: <GiChest /> },
                                    { key: 'waist', label: 'Waist', icon: <GiBelt /> },
                                    { key: 'hips', label: 'Hips', icon: <GiShorts /> },
                                    { key: 'arms', label: 'Arms', icon: <GiBiceps /> },
                                    { key: 'thighs', label: 'Thighs', icon: <GiLeg /> }
                                ].map((m) => (
                                    <div key={m.key} className="relative group">
                                        <label className="block text-xs text-gray-600 dark:text-gray-500 mb-1 ml-1 font-semibold">{m.label}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50 text-lg text-emerald-600 dark:text-emerald-400">
                                                {m.icon}
                                            </span>
                                            <input
                                                type="number"
                                                name={`measurements.${m.key}`}
                                                value={progressData.measurements[m.key]}
                                                onChange={handleChange}
                                                className="search-input w-full pl-10 pr-3 py-2.5 rounded-xl font-medium text-gray-900 dark:text-white"
                                                placeholder="--"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-200 dark:border-gray-700" />

                        {/* Mood Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wide mb-4">
                                How are you feeling?
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {moodOptions.map(option => (
                                    <label 
                                        key={option.value} 
                                        className={`
                                            cursor-pointer flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all
                                            ${progressData.mood === option.value 
                                                ? `${option.color} shadow-sm transform scale-105` 
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-slate-800'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="mood"
                                            value={option.value}
                                            checked={progressData.mood === option.value}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-2xl mb-1">{option.icon}</span>
                                        <span className={`text-xs font-bold ${progressData.mood !== option.value ? 'text-gray-600 dark:text-gray-400' : ''}`}>{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Energy Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wide">
                                    Energy Level
                                </label>
                                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
                                    {progressData.energyLevel}<span className="text-sm text-emerald-600 dark:text-emerald-400">/10</span>
                                </span>
                            </div>
                            <input
                                type="range"
                                name="energyLevel"
                                min="1"
                                max="10"
                                value={progressData.energyLevel}
                                onChange={handleChange}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium items-center">
                                <span className="flex items-center gap-1"><FaBatteryQuarter /> Low Energy</span>
                                <span className="flex items-center gap-1">High Energy <FaBatteryFull /></span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wide mb-3">
                                Daily Notes
                            </label>
                            <textarea
                                name="notes"
                                value={progressData.notes}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Any non-scale victories? How was your sleep?"
                                className="search-input w-full p-4 rounded-xl resize-none text-gray-900 dark:text-white placeholder-gray-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving || !progressData.weight}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-none transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                            >
                                {saving ? 'Saving...' : 'Record Progress'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- Right Column: History Timeline --- */}
                <div className="lg:col-span-1">
                    <div className="card-bg rounded-3xl p-6 shadow-sm h-full flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <span><FaHistory className="text-emerald-500"/></span> History
                        </h3>

                        <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-4 max-h-[800px]">
                            {progressHistory.length === 0 ? (
                                <div className="text-center py-10 opacity-60">
                                    <div className="text-4xl mb-3 flex justify-center text-gray-400"><FaChartBar /></div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">No records found yet.</p>
                                </div>
                            ) : (
                                progressHistory.map((entry, index) => {
                                    const weightChange = getWeightChange(index);
                                    
                                    return (
                                        <div key={entry._id} className="relative pl-6 pb-6 border-l-2 border-gray-200 dark:border-gray-700 last:pb-0 last:border-0">
                                            {/* Timeline Dot */}
                                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800"></div>
                                            
                                            {/* Content Card */}
                                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-200 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                    
                                                    {/* Weight Change Badge */}
                                                    {weightChange && (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                            weightChange.direction === 'down' 
                                                                ? 'bg-emerald-100 text-emerald-800 dark:text-emerald-700' 
                                                                : weightChange.direction === 'up'
                                                                ? 'bg-rose-100 text-rose-800 dark:text-rose-700'
                                                                : 'bg-gray-100 text-gray-800 dark:text-gray-600'
                                                        }`}>
                                                            {weightChange.direction === 'down' ? <FaArrowDown /> : <FaArrowUp />} {weightChange.value}kg
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                        {entry.weight} <span className="text-sm text-gray-500 font-normal">kg</span>
                                                    </span>
                                                    <div className="text-2xl" title="Mood">
                                                        {moodOptions.find(m => m.value === entry.mood)?.icon}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 mb-2">
                                                    <span className="text-xs font-semibold bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 flex items-center gap-1">
                                                        <FaBolt className="text-yellow-500"/> Energy: {entry.energyLevel}/10
                                                    </span>
                                                </div>

                                                {entry.notes && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-500 italic mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                                                        "{entry.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;