import api from './api';

export const courseService = {
  getCourses: async (session, semester) => {
    const params = {};
    if (session) params.session = session;
    if (semester) params.semester = semester;
    const response = await api.get('/api/courses', { params });
    return response.data;
  },

  getCoursesWithPaymentStatus: async (session, semester) => {
    const response = await api.get('/api/student/courses-with-payment-status', {
      params: { session, semester },
    });
    return response.data;
  },

  getRegisteredCourses: async () => {
    const response = await api.get('/api/student/registered-courses');
    return response.data;
  },

  createCourse: async (data) => {
    const response = await api.post('/api/admin/courses', data);
    return response.data;
  },

  updateCourse: async (courseId, data) => {
    const response = await api.patch(`/api/admin/courses/${courseId}`, data);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await api.delete(`/api/admin/courses/${courseId}`);
    return response.data;
  },
};