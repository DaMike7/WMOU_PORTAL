import api from './api';

export const materialService = {
  getCourseMaterials: async (courseId, page = 1, limit = 20) => {
    const response = await api.get(`/api/student/materials/${courseId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  uploadMaterial: async (courseId, title, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(
      `/api/admin/materials?course_id=${courseId}&title=${title}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  getAllMaterials: async (page = 1, limit = 20) => {
    const response = await api.get('/api/admin/materials', {
      params: { page, limit },
    });
    return response.data;
  },

  deleteMaterial: async (materialId) => {
    const response = await api.delete(`/api/admin/materials/${materialId}`);
    return response.data;
  },
};