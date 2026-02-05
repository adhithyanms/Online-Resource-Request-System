import { api } from './api';

export const resourceService = {
  getAllResources: async () => {
    return api.get('/resources');
  },

  getResourceById: async (id) => {
    return api.get(`/resources/${id}`);
  },

  createResource: async (formData) => {
    return api.post('/resources', formData);
  },

  updateResource: async (id, formData) => {
    return api.put(`/resources/${id}`, formData);
  },

  deleteResource: async (id) => {
    return api.delete(`/resources/${id}`);
  },
};

