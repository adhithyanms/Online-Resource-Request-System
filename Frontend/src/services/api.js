const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const getHeaders = (isMultipart = false) => {
    const token = localStorage.getItem('token');
    const headers = {};

    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || 'Something went wrong');
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    // For DELETE requests or empty responses
    if (response.status === 204) return null;

    return response.json();
};

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    post: async (endpoint, data, isMultipart = false) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(isMultipart),
            body: isMultipart ? data : JSON.stringify(data),
        });
        return handleResponse(response);
    },

    put: async (endpoint, data, isMultipart = false) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(isMultipart),
            body: isMultipart ? data : JSON.stringify(data),
        });
        return handleResponse(response);
    },

    patch: async (endpoint, data) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    delete: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};
