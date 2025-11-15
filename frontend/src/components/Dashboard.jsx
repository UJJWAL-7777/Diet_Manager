import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Dashboard
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">
                <strong>Username:</strong> {user.username}
                </p>
                <p className="text-gray-700">
                <strong>Email:</strong> {user.email}
                </p>
                <p className="text-gray-700">
                <strong>User ID:</strong> {user.id}
                </p>
            </div>
            <button
                onClick={logout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                Logout
            </button>
            </div>
        </div>
        </div>
    );
};

export default Dashboard;