import React, { useState } from 'react';
import { authAPI } from '../services/api';

const ForgotPassword = ({ switchToLogin }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const result = await authAPI.forgotPassword(email);

            if (result.success) {
                setSuccess('Password reset email sent successfully! Check your inbox.');
                setEmail('');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('An error occurred while sending reset email');
        } finally {
            setLoading(false);
        }
    };

    // --- Custom Styles & Animations ---
    const styles = `
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-card { animation: slideUp 0.5s ease-out forwards; }
        
        .input-group:focus-within svg { color: #10b981; }
        .input-group:focus-within input { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
    `;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 relative overflow-hidden">
            <style>{styles}</style>
            
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
            <div className="absolute top-10 left-10 text-9xl opacity-10 text-white animate-pulse">🔑</div>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 animate-card">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transform rotate-3">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 12 10 10.536 11.464 9 7.464 5.336M12 9a2 2 0 00-2-2m6 2a2 2 0 012 2m-6 4h6m-6 4h6m-6-10h6" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Don't worry! It happens. Please enter the email address associated with your account.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Feedback Messages */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r text-sm font-medium flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r text-sm font-medium flex items-center">
                            <span className="mr-2">✅</span> {success}
                        </div>
                    )}
                    
                    {/* Email Input */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                        <div className="relative input-group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-200 bg-gray-50"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending Link...
                            </div>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>

                    {/* Back to Login */}
                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={switchToLogin}
                            className="text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors flex items-center justify-center mx-auto"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;