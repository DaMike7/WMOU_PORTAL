import api from './api';

export const resultService = {
  getStudentResults: async (session, semester) => {
    const params = {};
    if (session) params.session = session;
    if (semester) params.semester = semester;
    const response = await api.get('/api/student/results', { params });
    return response.data;
  },

  bulkUploadResults: async (session, semester, results) => {
    const response = await api.post('/api/admin/results/bulk-upload', {
      session,
      semester,
      results,
    });
    return response.data;
  },
};