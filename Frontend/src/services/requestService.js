import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const requestService = {
    getAllRequests: async () => {
        try {
            const response = await axios.get(`${API_URL}/requests`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createRequest: async (items, siteId, purpose) => {
        try {
            const response = await axios.post(`${API_URL}/requests`, {
                items,
                siteId,
                purpose
            }, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getMyRequests: async () => {
        try {
            const response = await axios.get(`${API_URL}/requests/my-requests`, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateRequestStatus: async (requestId, status, rejectionReason = '') => {
        try {
            const response = await axios.put(`${API_URL}/requests/${requestId}/status`, {
                status,
                rejectionReason
            }, {
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
