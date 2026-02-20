import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const analyticsService = {
    getSummary: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/analytics/summary`, {
                params,
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getTrends: async (params = { days: 7 }) => {
        try {
            const response = await axios.get(`${API_URL}/analytics/trends`, {
                params,
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
