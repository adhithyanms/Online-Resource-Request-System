import { api } from './api';

export const requestService = {
  getAllRequests: async () => {
    return api.get('/requests');
  },

  getMyRequests: async () => {
    try {
      return await api.get('/requests/my-requests');
    } catch (error) {
      // Fallback logic if the endpoint doesn't exist yet or structured differently
      if (error.status === 404) {
        const all = await api.get('/requests');
        const user = JSON.parse(localStorage.getItem('user'));
        return all.filter(r => r.createdBy === user.id || r.userId === user.id);
      }
      throw error;
    }
  },

  createRequest: async (resourceId, quantity_requested, purpose) => {
    return api.post('/requests', {
      resourceId,
      quantity_requested,
      purpose,
      status: 'pending'
    });
  },

  updateRequestStatus: async (requestId, status, rejectionReason = null) => {
    return api.put(`/requests/${requestId}/status`, { status, rejectionReason });
  },
};

