import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const authAPI = {
    register: async (userData) => {
        const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        return res.data;
    },

    login: async (credentials) => {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return res.data;
    },
};
