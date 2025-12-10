import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Configure axios to include token in all requests
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    register: async (userData) => {
        const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        return res.data;
    },

    login: async (credentials) => {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return res.data;
    },

    forgotPassword: async (email) => {
        const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
        return res.data;
    },

    resetPassword: async (resetToken, password) => {
        const res = await axios.put(`${API_BASE_URL}/auth/reset-password/${resetToken}`, { password });
        return res.data;
    }
};

// NEW: Diet Planner API functions
export const dietAPI = {
    // User Profile
    getProfile: async () => {
        const res = await axios.get(`${API_BASE_URL}/diet/profile`);
        return res.data;
    },

    updateProfile: async (profileData) => {
        const res = await axios.post(`${API_BASE_URL}/diet/profile`, profileData);
        return res.data;
    },

    // Food Search
    searchFoods: async (query) => {
        const res = await axios.get(`${API_BASE_URL}/diet/foods/search?query=${query}`);
        return res.data;
    },

    getFoods: async (search = '', category = '', page = 1) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        params.append('page', page);
        
        const res = await axios.get(`${API_BASE_URL}/diet/foods?${params}`);
        return res.data;
    },

    addFood: async (foodData) => {
        const res = await axios.post(`${API_BASE_URL}/diet/foods`, foodData);
        return res.data;
    },

    // Add this new method
    saveExternalFood: async (foodData) => {
        const res = await axios.post(`${API_BASE_URL}/diet/foods/save-external`, { foodData });
        return res.data;
    },

    // Meal Planning
    getMealPlan: async (date) => {
        const res = await axios.get(`${API_BASE_URL}/diet/meal-plan/${date}`);
        return res.data;
    },

    saveMealPlan: async (date, mealPlanData) => {
        const res = await axios.post(`${API_BASE_URL}/diet/meal-plan/${date}`, mealPlanData);
        return res.data;
    },

    // Progress Tracking
    recordProgress: async (progressData) => {
        const res = await axios.post(`${API_BASE_URL}/diet/progress`, progressData);
        return res.data;
    },

    getProgress: async (limit = 30) => {
        const res = await axios.get(`${API_BASE_URL}/diet/progress?limit=${limit}`);
        return res.data;
    },

    // Dashboard
    getDashboard: async () => {
        const res = await axios.get(`${API_BASE_URL}/diet/dashboard`);
        return res.data;
    }
};