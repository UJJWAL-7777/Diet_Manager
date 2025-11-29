import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dietAPI } from '../services/api';
import ProfileSetup from './ProfileSetup';
import MealPlanner from './MealPlanner';
import FoodSearch from './FoodSearch';
import ProgressTracker from './ProgressTracker';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const result = await dietAPI.getDashboard();
            if (result.success) {
                setDashboardData(result.stats);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderSection = () => {
        switch(activeSection) {
            case 'overview':
                return <DashboardOverview 
                    user={user} 
                    data={dashboardData} 
                    loading={loading} 
                    onRefresh={loadDashboardData}
                />;
            case 'profile':
                return <ProfileSetup onProfileUpdate={loadDashboardData} />;
            case 'meal-plan':
                return <MealPlanner />;
            case 'food-search':
                return <FoodSearch />;
            case 'progress':
                return <ProgressTracker />;
            default:
                return <DashboardOverview 
                    user={user} 
                    data={dashboardData} 
                    loading={loading} 
                    onRefresh={loadDashboardData}
                />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold text-gray-900">🥗 Diet Planner</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user.username}!</span>
                            <button
                                onClick={logout}
                                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {[
                            { id: 'overview', name: 'Overview', icon: '📊' },
                            { id: 'meal-plan', name: 'Meal Plan', icon: '🍽️' },
                            { id: 'food-search', name: 'Food Search', icon: '🔍' },
                            { id: 'progress', name: 'Progress', icon: '📈' },
                            { id: 'profile', name: 'Profile', icon: '👤' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                    activeSection === item.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {renderSection()}
                </div>
            </main>
        </div>
    );
};

// Dashboard Overview Component
const DashboardOverview = ({ user, data, loading, onRefresh }) => {
    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No data available. Set up your profile to get started!</p>
                <button 
                    onClick={onRefresh}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Refresh
                </button>
            </div>
        );
    }

    const { profile, todayMealPlan, recentWeight } = data;

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <span className="text-2xl">🔥</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Daily Calories</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {profile?.dailyCalories || 2000}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-2xl">💪</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Protein Target</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {profile?.proteinTarget || 50}g
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <span className="text-2xl">⚖️</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Current Weight</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {recentWeight || profile?.weight || 'N/A'} kg
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Goal</p>
                            <p className="text-2xl font-semibold text-gray-900 capitalize">
                                {profile?.goal?.replace('_', ' ') || 'Not set'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-black mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                        🍽️ Plan Today's Meals
                    </button>
                    <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        📝 Add Food Entry
                    </button>
                    <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        📊 Update Progress
                    </button>
                </div>
            </div>

            {/* Today's Meals Preview */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-black">Today's Meals</h2>
                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="space-y-3">
                    {todayMealPlan?.meals?.length > 0 ? (
                        todayMealPlan.meals.map((meal, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="capitalize">{meal.name}</span>
                                <span className="text-gray-600">
                                    {meal.items?.length || 0} items
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            No meals planned for today. Start planning!
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Completion */}
            {!profile?.age && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-yellow-400 text-xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Complete your profile
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Set up your age, weight, height and goals to get personalized calorie targets.</p>
                            </div>
                            <div className="mt-3">
                                <button
                                    onClick={() => window.location.hash = 'profile'}
                                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                                >
                                    Set up profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;