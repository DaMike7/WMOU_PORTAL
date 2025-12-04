import api from './api';

export const userService = {
  createUser: async (data) => {
    const response = await api.post('/api/admin/users/create', data);
    return response.data;
  },

  createAdminUser: async (data) => {
    const response = await api.post('/api/admin/adminusers/create', data);
    return response.data;
  },

  getAllUsers: async (role, page = 1, limit = 50) => {
    const params = { page, limit };
    if (role) params.role = role;
    const response = await api.get('/api/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/api/admin/users/${userId}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};