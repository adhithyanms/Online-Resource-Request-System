import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const siteService = {
    // Get all sites (admin)
    getAllSites: async () => {
        try {
            const response = await axios.get(`${API_URL}/sites`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get sites assigned to current user (user)
    getMySites: async () => {
        try {
            const response = await axios.get(`${API_URL}/sites/my-sites`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create a new site (admin)
    createSite: async (siteData) => {
        try {
            const response = await axios.post(`${API_URL}/sites`, siteData, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update an existing site (admin)
    updateSite: async (siteId, siteData) => {
        try {
            const response = await axios.put(`${API_URL}/sites/${siteId}`, siteData, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete a site (admin)
    deleteSite: async (siteId) => {
        try {
            const response = await axios.delete(`${API_URL}/sites/${siteId}`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
