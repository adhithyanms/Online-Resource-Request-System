import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const resourceService = {
    getAllResources: async () => {
        try {
            const response = await axios.get(`${API_URL}/resources`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createResource: async (resourceData) => {
        try {
            const response = await axios.post(`${API_URL}/resources`, resourceData, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateResource: async (id, resourceData) => {
        try {
            const response = await axios.put(`${API_URL}/resources/${id}`, resourceData, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteResource: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/resources/${id}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
