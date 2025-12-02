import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, Filter, Info } from 'lucide-react'; // Added Info icon
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const WMOuBlue = '#1e3a5f';
const WMOuBlueText = 'text-[#1e3a5f]';
const primaryBtnStyle = `px-4 py-2 text-white rounded-xl font-semibold transition-colors disabled:opacity-50`;
const secondaryBtnStyle = `px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors`;
const inputStyle = "w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-[#1e3a5f]/50 focus:border-[#1e3a5f] transition duration-150 ease-in-out shadow-sm";

const PaymentsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // New state for details modal
  const [rejectionReason, setRejectionReason] = useState('');

  const queryClient = useQueryClient();

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['adminPayments', statusFilter, currentPage],
    queryFn: () => paymentService.getAllPayments(statusFilter || null, currentPage, 30),
    keepPreviousData: true,
  });

  const approveMutation = useMutation({
    mutationFn: ({ paymentId, approved, rejectionReason }) =>
      paymentService.approvePayment(paymentId, approved, rejectionReason),
    onSuccess: (data, variables) => {
      // Logic for handling both approval and rejection success
      toast.success(variables.approved ? 'Payment approved. Student has been registered for the course.' : 'Payment rejected. Notification sent to student.');
      queryClient.invalidateQueries(['adminPayments']);
      setSelectedPayment(null);
      setRejectionReason('');
      setShowDetailsModal(false); // Close the rejection modal on success
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to process payment');
    },
  });

  const handleApprove = (payment) => {
    if (window.confirm(`Are you sure you want to approve the ${formatCurrency(payment.amount_paid)} payment for ${payment.users?.full_name}?`)) {
      approveMutation.mutate({
        paymentId: payment.id,
        approved: true,
      });
    }
  };

  const handleReject = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true); // Use the details modal for rejection input
  };

  // Submit rejection logic now moved to this component
  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    // Call the mutation with 'approved: false' and the reason
    approveMutation.mutate({
      paymentId: selectedPayment.id,
      approved: false,
      rejectionReason,
    });
  };

  const handleCloseRejectionModal = () => {
    setSelectedPayment(null);
    setRejectionReason('');
    setShowDetailsModal(false);
  };

  // Function to handle viewing status details (rejection reason or approval details)
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  // Determine if the current modal should be the Rejection Modal or the Details Modal
  const isRejectionModalOpen = !!selectedPayment && showDetailsModal && selectedPayment.status === 'pending';
  const isDetailsModalOpen = !!selectedPayment && showDetailsModal && selectedPayment.status !== 'pending';


  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-3xl font-extrabold text-gray-900 ml-10 lg:ml-0">Payment Approvals</h1>
      </div>
      
      <p className="text-gray-500 mb-6 -mt-4 ml-10 lg:ml-0 hidden lg:block">
        Review and approve student payment receipts. Total: {paymentsData?.total || 0} payments
      </p>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex space-x-4 border-b border-gray-100 pb-2 w-full sm:w-auto">
                <span className={`py-2 px-4 font-semibold ${WMOuBlueText} border-b-2 border-[#1e3a5f]`}>
                    All ({paymentsData?.total || 0})
                </span>
            </div>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition text-sm shadow-sm`}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Student/Reg No
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Reviewer
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paymentsData?.data?.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-900">{payment.users?.full_name}</p>
                    <p className="font-mono text-xs text-gray-500">{payment.users?.reg_no}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <p className="font-semibold text-sm">{payment.courses?.course_code}</p>
                    <p className="text-xs text-gray-500">{payment.courses?.title}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                    {formatCurrency(payment.amount_paid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs hidden md:table-cell">
                    {formatDateTime(payment.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowReceiptModal(true);
                      }}
                      className="text-gray-500 hover:text-[#1e3a5f] p-2 rounded-lg hover:bg-gray-100 transition"
                      title="View Receipt"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {payment.status === 'pending' ? (
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => handleApprove(payment)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition"
                          title="Approve"
                          disabled={approveMutation.isLoading}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(payment)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                          title="Reject"
                          disabled={approveMutation.isLoading}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                         onClick={() => handleViewDetails(payment)}
                         className={`text-sm font-medium p-2 rounded-lg transition ${payment.status === 'approved' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                         title="View Details"
                      >
                         <Info className="h-5 w-5 mx-auto" />
                      </button>
                    )}
                  </td>
                  {/* Reviewer Column (Feature 5) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden lg:table-cell">
                    {payment.reviewed_by_name || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {paymentsData?.data?.length === 0 && (
            <div className="text-center py-8 text-gray-500">No payments found.</div>
          )}
        </div>

        {paymentsData?.total_pages > 1 && (
          <div className="flex items-center justify-between px-2 sm:px-6 py-4 border-t border-gray-100 mt-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {paymentsData.total_pages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(paymentsData.total_pages, p + 1))}
                disabled={currentPage === paymentsData.total_pages}
                className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Receipt View Modal (Unchanged) */}
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
            <div className="w-full h-96 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                    src={selectedPayment.receipt_url}
                    alt="Payment Receipt"
                    className="object-contain w-full h-full"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/600x400?text=Receipt+Not+Available"; }}
                />
            </div>
            <a
              href={selectedPayment.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className={primaryBtnStyle + " w-full text-center"}
              style={{ backgroundColor: WMOuBlue }}
            >
              Open in New Tab
            </a>
          </div>
        )}
      </Modal>

      {/* Rejection/Details Modal (Consolidated) */}
      <Modal
        // Open if a payment is selected AND the details/rejection modal is active (and not the receipt modal)
        isOpen={showDetailsModal}
        onClose={handleCloseRejectionModal}
        title={selectedPayment?.status === 'pending' ? "Reject Payment" : "Payment Details"}
      >
        {selectedPayment && (
          <div className="space-y-4">
            {/* Display for Approved/Rejected Statuses */}
            {selectedPayment.status !== 'pending' && (
              <div className={`p-3 rounded-lg ${selectedPayment.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <p className="font-semibold mb-1">Status: {selectedPayment.status.toUpperCase()}</p>
                <p className="text-sm">Processed by: **{selectedPayment.reviewed_by_name || 'N/A'}** on {formatDateTime(selectedPayment.reviewed_at)}</p>
                {selectedPayment.rejection_reason && (
                  <p className="mt-2 text-sm">
                    **Reason for Rejection:** {selectedPayment.rejection_reason}
                  </p>
                )}
              </div>
            )}

            {/* Rejection Input for Pending Status */}
            {selectedPayment.status === 'pending' && (
              <>
                <p className="text-gray-700">
                  Please provide a reason for rejecting this payment:
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className={inputStyle}
                  rows="4"
                  placeholder="Enter rejection reason..."
                  required
                />
              </>
            )}
            
            <div className="flex justify-end space-x-3 border-t pt-3 mt-4">
              <button
                onClick={handleCloseRejectionModal}
                className={secondaryBtnStyle}
                disabled={approveMutation.isLoading}
              >
                Close
              </button>
              {selectedPayment.status === 'pending' && (
                <button
                  onClick={submitRejection}
                  disabled={approveMutation.isLoading || !rejectionReason.trim()}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 ${approveMutation.isLoading ? 'bg-red-400' : 'bg-red-600'} text-white hover:bg-red-700`}
                >
                  {approveMutation.isLoading ? 'Rejecting...' : 'Reject Payment'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default PaymentsPage;