import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from './StudentLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { paymentService } from '../../services/paymentService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { Receipt, Eye } from 'lucide-react';
import { useState } from 'react';
import Modal from '../../components/common/Modal';

const PaymentsPage = () => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['studentPaymentHistory'],
    queryFn: () => paymentService.getStudentPaymentHistory(1, 20),
  });

  if (isLoading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

      {paymentsData?.data?.length === 0 ? (
        <div className="card">
          <EmptyState message="No payment records found" icon={Receipt} />
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentsData?.data?.map((payment) => (
                  <tr key={payment.id} className="table-row">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{payment.courses?.course_code}</p>
                        <p className="text-sm text-gray-500">{payment.courses?.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {formatCurrency(payment.amount_paid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={payment.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.receipt_url && (
                        <button
                          onClick={() => setSelectedReceipt(payment)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Payment Receipt"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <img
              src={selectedReceipt.receipt_url}
              alt="Receipt"
              className="w-full rounded-lg border"
            />
            {selectedReceipt.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">
                  Rejection Reason:
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {selectedReceipt.rejection_reason}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </StudentLayout>
  );
}

export default PaymentsPage;