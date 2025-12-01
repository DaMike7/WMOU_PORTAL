import api from './api';

export const paymentService = {
  uploadPaymentProof: async (courseId, amountPaid, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(
      `/api/student/payment/upload-proof?course_id=${courseId}&amount_paid=${amountPaid}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  getAllPayments: async (status, page = 1, limit = 30) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await api.get('/api/admin/payments', { params });
    return response.data;
  },

  approvePayment: async (paymentId, approved, rejectionReason) => {
    const data = {
      approved: approved,
      rejection_reason: rejectionReason || null,
    };
    
    const response = await api.patch(`/api/admin/payments/${paymentId}/approve`, data);
    return response.data;
  },
};