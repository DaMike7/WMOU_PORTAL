import api from './api';

export const announcementService = {
  getAnnouncements: async () => {
    const response = await api.get('/api/announcements');
    return response.data;
  },

  createAnnouncement: async (data) => {
    const response = await api.post('/api/admin/announcements', data);
    return response.data;
  },

  deleteAnnouncement: async (announcementId) => {
    const response = await api.delete(`/api/admin/announcements/${announcementId}`);
    return response.data;
  },
};