import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router'; // Using standard web router import
import { authAPI } from '../services/api';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState(true);
    
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const result = await authAPI.resetPassword(resetToken, formData.password);

            if (result.success) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Invalid or expired reset token');
            setValidToken(false);
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

    // --- Invalid Token View ---
    if (!validToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
                <style>{styles}</style>
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center animate-card">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h3>
                    <p className="text-gray-500 mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // --- Main Reset Form View ---
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4 relative overflow-hidden">
            <style>{styles}</style>
            
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
            <div className="absolute top-10 right-10 text-9xl opacity-10 text-white animate-pulse">🔒</div>

            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 animate-card">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transform -rotate-6">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 12 10 10.536 11.464 9 7.464 5.336M12 9a2 2 0 00-2-2m6 2a2 2 0 012 2m-6 4h6m-6 4h6m-6-10h6" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-500">Secure your account with a new password.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Messages */}
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
                    
                    <div className="space-y-4">
                        {/* New Password Input */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
                            <div className="relative input-group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Confirm Password</label>
                            <div className="relative input-group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                    </div>

                    <div className="pt-2">
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
                                    Updating...
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;