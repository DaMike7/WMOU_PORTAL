import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  changePassword: async (data) => {
    const response = await api.post('/api/auth/change-password', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/api/profile', data);
    return response.data;
  },

  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/profile/upload-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getCreatorDetails: async (userId) => {
  const response = await api.get(`/api/admin/users/${userId}`);
  return response.data;
},
};