import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userService = {
    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_URL}/users`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    addUser: async (email) => {
        try {
            const response = await axios.post(`${API_URL}/users`, { email }, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    searchUsers: async (query) => {
        try {
            const response = await axios.get(`${API_URL}/users/search?q=${query}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getUserRequests: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/users/${userId}/requests`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateUserProfile: async (userId, formData) => {
        try {
            const response = await axios.put(`${API_URL}/users/${userId}/profile`, formData, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            const response = await axios.put(`${API_URL}/users/${userId}/role`, { role }, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await axios.delete(`${API_URL}/users/${userId}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getMyProfile: async () => {
        try {
            const response = await axios.get(`${API_URL}/users/me`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateMyProfile: async (formData) => {
        try {
            const response = await axios.put(`${API_URL}/users/me/profile`, formData, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
