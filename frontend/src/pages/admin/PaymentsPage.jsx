import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const PaymentsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const queryClient = useQueryClient();

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['adminPayments', statusFilter, currentPage],
    queryFn: () => paymentService.getAllPayments(statusFilter || null, currentPage, 30),
  });

  const approveMutation = useMutation({
    mutationFn: ({ paymentId, approved, rejectionReason }) =>
      paymentService.approvePayment(paymentId, approved, rejectionReason),
    onSuccess: (data, variables) => {
      toast.success(variables.approved ? 'Payment approved' : 'Payment rejected');
      queryClient.invalidateQueries(['adminPayments']);
      setSelectedPayment(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to process payment');
    },
  });

  const handleApprove = (payment) => {
    if (window.confirm('Are you sure you want to approve this payment?')) {
      approveMutation.mutate({
        paymentId: payment.id,
        approved: true,
      });
    }
  };

  const handleReject = (payment) => {
    setSelectedPayment(payment);
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    approveMutation.mutate({
      paymentId: selectedPayment.id,
      approved: false,
      rejectionReason,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Approvals</h1>
        <p className="text-gray-500 mt-1">
          Total: {paymentsData?.total || 0} payments
        </p>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reg No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receipt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentsData?.data?.map((payment) => (
                <tr key={payment.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {payment.users?.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {payment.users?.reg_no}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-sm">{payment.courses?.course_code}</p>
                      <p className="text-xs text-gray-500">{payment.courses?.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                    {formatCurrency(payment.amount_paid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                    {formatDateTime(payment.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowReceiptModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(payment)}
                          className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(payment)}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    {payment.status === 'approved' && (
                      <span className="text-green-600 text-sm font-medium">Approved</span>
                    )}
                    {payment.status === 'rejected' && (
                      <span className="text-red-600 text-sm font-medium">Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paymentsData?.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {paymentsData.total_pages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(paymentsData.total_pages, p + 1))}
                disabled={currentPage === paymentsData.total_pages}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

{/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedPayment(null);
        }}
        title="Payment Receipt"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <img
              src={selectedPayment.receipt_url}
              alt="Payment Receipt"
              className="w-full rounded-lg border border-gray-300"
            />
            <a
              href={selectedPayment.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center"
            >
              Open in New Tab
            </a>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={!!selectedPayment && !showReceiptModal}
        onClose={() => {
          setSelectedPayment(null);
          setRejectionReason('');
        }}
        title="Reject Payment"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting this payment:
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="input"
            rows="4"
            placeholder="Enter rejection reason..."
            required
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setSelectedPayment(null);
                setRejectionReason('');
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={submitRejection}
              disabled={approveMutation.isLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {approveMutation.isLoading ? 'Rejecting...' : 'Reject Payment'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default PaymentsPage;