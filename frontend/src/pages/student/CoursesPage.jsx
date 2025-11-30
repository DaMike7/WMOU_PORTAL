import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from './StudentLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { courseService } from '../../services/courseService';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/helpers';
import { SESSIONS, SEMESTERS } from '../../utils/constants';
import { BookOpen } from 'lucide-react';
import PaymentUpload from '../../components/student/PaymentUpload';

const CoursesPage = () => {
  const { user } = useAuthStore();
  const [session, setSession] = useState('2025/2026');
  const [semester, setSemester] = useState('First Semester');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['studentCourses', session, semester],
    queryFn: () => courseService.getCoursesWithPaymentStatus(session, semester),
  });

  const handlePayNow = (course) => {
    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
        <p className="text-gray-500 mt-1">
          Browse and register for courses in your department
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="input"
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="input"
            >
              {SEMESTERS.map((sem) => (
                <option key={sem.value} value={sem.value}>
                  {sem.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <div key={course.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-[#1e3a5f]" />
                <span className="font-mono font-bold text-lg">
                  {course.course_code}
                </span>
              </div>
              {course.payment && (
                <Badge status={course.payment.status} />
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {course.title}
            </h3>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Department:</span> {course.department}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Fee:</span>{' '}
                <span className="text-green-600 font-bold">
                  {formatCurrency(course.fee)}
                </span>
              </p>
            </div>

            {!course.payment && (
              <button
                onClick={() => handlePayNow(course)}
                className="btn-primary w-full"
              >
                Pay Now
              </button>
            )}

            {course.payment?.status === 'pending' && (
              <button className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium cursor-not-allowed">
                Pending Approval
              </button>
            )}

            {course.payment?.status === 'approved' && (
              <button className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium cursor-not-allowed">
                ✓ Paid & Registered
              </button>
            )}

            {course.payment?.status === 'rejected' && (
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium cursor-not-allowed">
                  Payment Rejected
                </button>
                {course.payment.rejection_reason && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    <strong>Reason:</strong> {course.payment.rejection_reason}
                  </p>
                )}
                <button
                  onClick={() => handlePayNow(course)}
                  className="btn-primary w-full text-sm"
                >
                  Pay Again
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {courses?.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No courses available for this session and semester.</p>
        </div>
      )}

      {/* Payment Modal */}
      {selectedCourse && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCourse(null);
          }}
          title="Upload Payment Proof"
        >
          <PaymentUpload
            course={selectedCourse}
            onSuccess={() => {
              setShowPaymentModal(false);
              setSelectedCourse(null);
            }}
          />
        </Modal>
      )}
    </StudentLayout>
  );
};

export default CoursesPage;