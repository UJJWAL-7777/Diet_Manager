import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dietAPI } from '../services/api';
import ProfileSetup from './ProfileSetup';
import MealPlanner from './MealPlanner';
import FoodSearch from './FoodSearch';
import ProgressTracker from './ProgressTracker';

// --- Icons Import ---
import { FiSun, FiMoon, FiGrid, FiSearch, FiTrendingUp, FiUser, FiSettings } from 'react-icons/fi';
import { MdRestaurantMenu, MdOutlineFreeBreakfast, MdOutlineLunchDining, MdOutlineDinnerDining, MdOutlineRestaurant } from 'react-icons/md';
import { FaFire, FaWeight, FaBullseye, FaHamburger, FaTrophy } from 'react-icons/fa';
import { GiAvocado, GiChickenLeg, GiSteak } from 'react-icons/gi';
import { IoWaterOutline } from 'react-icons/io5';
import { BiBowlRice } from 'react-icons/bi';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 1. Theme State ---
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(!darkMode);

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

    // --- 2. Custom CSS ---
    const styles = `
      :root {
        --bg-main: #f8fafc;
        --bg-card: #ffffff;
        --text-main: #0f172a;
        --text-sec: #64748b;
        --border: #e2e8f0;
      }

      .dark-theme {
        --bg-main: #0f172a;
        --bg-card: #1e293b;
        --text-main: #f8fafc;
        --text-sec: #94a3b8;
        --border: #334155;
      }

      /* Base Layout Styles */
      .app-bg { background-color: var(--bg-main); color: var(--text-main); transition: background-color 0.3s, color 0.3s; }
      .card-bg { background-color: var(--bg-card); border: 1px solid var(--border); }
      .text-primary { color: var(--text-main); }
      .text-secondary { color: var(--text-sec); }
      
      /* --- NEW: Food Card Designs --- */
      .food-card {
        position: relative;
        overflow: hidden;
        border-radius: 1rem;
        padding: 1.5rem;
        color: white;
        transition: transform 0.2s;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .food-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2); }
      
      /* Gradients & Textures */
      .card-calories {
        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      }
      .card-protein {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }
      .card-weight {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      }
      .card-goal {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      }

      /* Decorative Background Icons (Watermarks) */
      .card-watermark {
        position: absolute;
        right: -10px;
        bottom: -10px;
        font-size: 5rem;
        opacity: 0.2;
        transform: rotate(-15deg);
        pointer-events: none;
      }
      
      /* Glassmorphism Circle overlay */
      .glass-circle {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 3rem;
        height: 3rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
        font-size: 1.25rem;
      }

      /* Navigation & Buttons */
      .nav-btn.active { background-color: #10b981; color: white; }
      .nav-btn:not(.active):hover { background-color: var(--border); }
      
      /* Animations */
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-enter { animation: slideUp 0.4s ease-out forwards; }
    `;

    const renderSection = () => {
        const Wrapper = ({ children }) => <div className="animate-enter">{children}</div>;
        switch(activeSection) {
            case 'overview': return <Wrapper><DashboardOverview user={user} data={dashboardData} loading={loading} onRefresh={loadDashboardData} setActiveSection={setActiveSection} /></Wrapper>;
            case 'profile': return <Wrapper><ProfileSetup onProfileUpdate={loadDashboardData} /></Wrapper>;
            case 'meal-plan': return <Wrapper><MealPlanner /></Wrapper>;
            case 'food-search': return <Wrapper><FoodSearch /></Wrapper>;
            case 'progress': return <Wrapper><ProgressTracker /></Wrapper>;
            default: return <Wrapper><DashboardOverview user={user} data={dashboardData} loading={loading} onRefresh={loadDashboardData} /></Wrapper>;
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center flex-col ${darkMode ? 'dark-theme' : ''} app-bg`}>
                <style>{styles}</style>
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500 border-t-transparent mb-4"></div>
                <p className="text-secondary font-medium">Loading your plan...</p>
            </div>
        );
    }

    // Navigation Items configuration with React Icons
    const navItems = [
        { id: 'overview', name: 'Overview', icon: <FiGrid size={18} /> },
        { id: 'meal-plan', name: 'Meal Plan', icon: <MdRestaurantMenu size={18} /> },
        { id: 'food-search', name: 'Search', icon: <FiSearch size={18} /> },
        { id: 'progress', name: 'Progress', icon: <FiTrendingUp size={18} /> },
        { id: 'profile', name: 'Profile', icon: <FiUser size={18} /> }
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark-theme' : ''} app-bg`}>
            <style>{styles}</style>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md card-bg border-b-0 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl p-2 rounded-xl bg-emerald-100/50 text-emerald-600">
                                <BiBowlRice />
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold text-primary tracking-tight">Diet Planner</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xl text-primary">
                                {darkMode ? <FiSun /> : <FiMoon />}
                            </button>
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-xs text-secondary">Welcome,</span>
                                <span className="text-sm font-bold text-primary">{user.username}</span>
                            </div>
                            <button onClick={logout} className="bg-rose-50 text-rose-600 border border-rose-100 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-rose-600 hover:text-white transition-all">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="card-bg sticky top-[76px] z-40 border-t border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-2 overflow-x-auto py-3 no-scrollbar">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`nav-btn flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                    activeSection === item.id ? 'active' : 'text-secondary'
                                }`}
                            >
                                <span className="mr-2 flex items-center">{item.icon}</span>
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {renderSection()}
            </main>
        </div>
    );
};

// Dashboard Overview Component
const DashboardOverview = ({ user, data, loading, onRefresh, setActiveSection }) => {
    if (!data) {
        return (
            <div className="card-bg rounded-3xl p-12 text-center flex flex-col items-center">
                <div className="text-6xl mb-4 text-emerald-500">
                    <GiAvocado />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">Let's get started!</h3>
                <p className="text-secondary mb-6">No data available. Set up your profile to generate your plan.</p>
                <button onClick={onRefresh} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-emerald-600">
                    Refresh Dashboard
                </button>
            </div>
        );
    }

    const { profile, todayMealPlan, recentWeight } = data;

    // --- NEW: Designed Food Card Component ---
    const FoodStatCard = ({ type, label, value, unit, icon, watermark }) => {
        // Map types to specific CSS classes defined above
        const classMap = {
            calories: 'card-calories',
            protein: 'card-protein',
            weight: 'card-weight',
            goal: 'card-goal'
        };

        return (
            <div className={`food-card ${classMap[type]}`}>
                {/* Visual Watermark (Large background icon) */}
                <div className="card-watermark">{watermark}</div>
                
                {/* Floating Glass Icon */}
                <div className="glass-circle">
                    {icon}
                </div>

                <div className="relative z-10 mt-2">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">{label}</p>
                    <div className="flex items-baseline mt-1">
                        <span className="text-3xl font-extrabold">{value}</span>
                        {unit && <span className="ml-1 text-sm font-medium opacity-80">{unit}</span>}
                    </div>
                    {/* Decorative tiny dots */}
                    <div className="flex gap-1 mt-3 opacity-50">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header Text */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-2">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Daily Summary</h2>
                    <p className="text-secondary mt-1">Your nutrition snapshot for today.</p>
                </div>
                <div className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                    📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* --- Stats Grid with Food Designs --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FoodStatCard 
                    type="calories" 
                    label="Daily Energy" 
                    value={profile?.dailyCalories || 2000} 
                    unit="kcal" 
                    icon={<FaFire />}
                    watermark={<FaHamburger />} // Burger/Food watermark
                />
                <FoodStatCard 
                    type="protein" 
                    label="Protein Intake" 
                    value={profile?.proteinTarget || 50} 
                    unit="g" 
                    icon={<GiSteak />}
                    watermark={<GiChickenLeg />} // Chicken leg watermark
                />
                <FoodStatCard 
                    type="weight" 
                    label="Current Weight" 
                    value={recentWeight || profile?.weight || '--'} 
                    unit="kg" 
                    icon={<FaWeight />}
                    watermark={<GiAvocado />} // Avocado watermark (healthy weight)
                />
                <FoodStatCard 
                    type="goal" 
                    label="Main Goal" 
                    value={profile?.goal ? profile.goal.split('_')[0] : 'Set Goal'} 
                    unit="" 
                    icon={<FaBullseye />}
                    watermark={<FaTrophy />} // Trophy watermark
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Quick Actions Panel */}
                    <div className="card-bg rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-primary mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <button 
                                onClick={() => setActiveSection && setActiveSection('meal-plan')}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-colors"
                            >
                                <span className="text-2xl mb-2"><MdOutlineRestaurant /></span>
                                <span className="text-sm font-bold">Plan Meals</span>
                            </button>
                            <button 
                                onClick={() => setActiveSection && setActiveSection('food-search')}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                            >
                                <span className="text-2xl mb-2"><FiSearch /></span>
                                <span className="text-sm font-bold">Add Food</span>
                            </button>
                            <button 
                                onClick={() => setActiveSection && setActiveSection('progress')}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                            >
                                <span className="text-2xl mb-2"><FiTrendingUp /></span>
                                <span className="text-sm font-bold">Log Weight</span>
                            </button>
                        </div>
                    </div>

                    {/* Today's Menu */}
                    <div className="card-bg rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                Menu Preview
                            </h2>
                            <button onClick={() => setActiveSection('meal-plan')} className="text-emerald-500 text-sm font-bold hover:underline">View Full Plan →</button>
                        </div>
                        <div className="space-y-3">
                            {todayMealPlan?.meals?.length > 0 ? (
                                todayMealPlan.meals.map((meal, index) => (
                                    <div key={index} className="flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                                                {meal.name.toLowerCase().includes('break') ? <MdOutlineFreeBreakfast /> : 
                                                 meal.name.toLowerCase().includes('lun') ? <MdOutlineLunchDining /> : <MdOutlineDinnerDining />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary capitalize">{meal.name}</h4>
                                                <p className="text-xs text-secondary">{index * 4 + 8}:00 AM - Recommended</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-primary">{meal.items?.length || 0}</span>
                                            <span className="text-xs text-secondary">Items</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                    <p className="text-secondary">No meals planned yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profile Warning */}
                    {!profile?.age && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">Finish Setup <FiSettings /></h3>
                                <p className="text-sm opacity-90 mb-4">Add your details for accurate AI tracking.</p>
                                <button onClick={() => setActiveSection('profile')} className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                                    Go to Profile
                                </button>
                            </div>
                            <div className="absolute right-0 bottom-0 text-6xl opacity-20 transform translate-x-2 translate-y-2">
                                <FiSettings />
                            </div>
                        </div>
                    )}
                    
                    {/* Health Tip */}
                    <div className="card-bg p-6 rounded-2xl border-t-4 border-blue-500 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl text-blue-500"><IoWaterOutline /></span>
                            <span className="text-xs font-bold text-blue-500 uppercase">Hydration Tip</span>
                        </div>
                        <p className="text-primary text-sm leading-relaxed">
                            Drinking water before meals can help you feel fuller and aid digestion. Aim for a glass 30 mins before eating.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;