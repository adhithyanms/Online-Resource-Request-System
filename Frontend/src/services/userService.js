import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userService = {
    // Get all users (admin)
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

    // Add user by email (admin)
    addUser: async (email) => {
        try {
            const response = await axios.post(
                `${API_URL}/users`,
                { email },
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Search users by name or email (admin)
    searchUsers: async (query) => {
        try {
            const response = await axios.get(`${API_URL}/users/search`, {
                params: { q: query },
                headers: getAuthHeader()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get all requests for a specific user (admin)
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

    // Update a user's profile (admin) — accepts FormData for file uploads
    updateUserProfile: async (userId, formData) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/${userId}/profile`,
                formData,
                {
                    headers: {
                        ...getAuthHeader(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get current user's own profile (user)
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

    // Update current user's own profile (user) — FormData for file uploads
    updateMyProfile: async (formData) => {
        try {
            const response = await axios.put(
                `${API_URL}/users/me/profile`,
                formData,
                {
                    headers: {
                        ...getAuthHeader(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update role by email (super admin)
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
    },

    // Update role by ID (super admin)
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

    // Delete user (admin)
    deleteUser: async (userId) => {
        try {
            const response = await axios.delete(
                `${API_URL}/users/${userId}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};
