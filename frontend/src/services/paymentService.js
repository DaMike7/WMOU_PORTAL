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

  getAllPayments: async (status) => {
    const params = status ? { status } : {};
    const response = await api.get('/api/admin/payments', { params });
    return response.data;
  },

  approvePayment: async (paymentId, approved, rejectionReason) => {
    const response = await api.patch(`/api/admin/payments/${paymentId}/approve`, {
      approved,
      rejection_reason: rejectionReason,
    });
    return response.data;
  },
};