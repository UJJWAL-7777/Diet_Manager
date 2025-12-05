import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = ({ switchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const result = await authAPI.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                login(result.user, result.token);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    // --- Custom Styles & Animations ---
    const styles = `
        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-slide-in { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        
        .input-group:focus-within svg { color: #10b981; }
        .input-group:focus-within input { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
    `;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
            <style>{styles}</style>

            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse animate-fade-in">
                
                {/* Right Side - Visual (Reverse for Register) */}
                <div className="md:w-1/2 relative hidden md:block">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 to-teal-900/60 backdrop-blur-[1px]"></div>
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center">
                        <span className="text-6xl mb-4 transform hover:scale-110 transition-transform cursor-default">🥑</span>
                        <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
                        <p className="text-lg opacity-90">Join thousands of others tracking their nutrition and living healthier lives.</p>
                    </div>
                </div>

                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 bg-white flex flex-col justify-center relative">
                    
                    <div className="mb-8 text-center md:text-left animate-slide-in">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500">Sign up to get your personalized diet plan.</p>
                    </div>

                    <form className="space-y-5 animate-slide-in" onSubmit={handleSubmit}>
                        
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm flex items-center">
                                <span className="mr-2">⚠️</span>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        
                        {/* Username Input */}
                        <div className="relative input-group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 bg-gray-50"
                                    placeholder="JaneDoe"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="relative input-group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 bg-gray-50"
                                    placeholder="jane@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative input-group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 bg-gray-50"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative input-group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 bg-gray-50"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Already a member?</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={switchToLogin}
                            className="w-full flex justify-center py-3 px-4 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-200 hover:text-emerald-600 transition-all duration-200"
                        >
                            Sign in instead
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;