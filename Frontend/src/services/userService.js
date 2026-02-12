import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ;

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

    updateUserRole: async (userId, role) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/${userId}/role`,
                { role },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /** Grant or revoke admin by email (admin only) */
    updateRoleByEmail: async (email, role) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/role-by-email`,
                { email: email.trim(), role },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
