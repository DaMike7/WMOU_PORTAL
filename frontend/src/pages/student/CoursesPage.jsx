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
import { BookOpen, DollarSign, Briefcase } from 'lucide-react'; // Added icons for detail
// Assuming these are defined elsewhere or we use generic Tailwind classes
// const WMOuBlue = 'bg-[#1e3a5f]'; 
// const WMOuText = 'text-[#1e3a5f]'; 
import PaymentUpload from '../../components/student/PaymentUpload';

// Define the theme color for easy use
const WMOuBlue = '#1e3a5f';

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

  // Function to determine a background color for the course icon/tag (emulating the design)
  const getCourseTagStyle = (index) => {
    const colors = ['bg-pink-400', 'bg-teal-400', 'bg-blue-400', 'bg-orange-400'];
    const shadows = ['shadow-pink-400/50', 'shadow-teal-400/50', 'shadow-blue-400/50', 'shadow-orange-400/50'];
    const idx = index % colors.length;
    return {
      bg: colors[idx],
      shadow: shadows[idx]
    };
  };

  return (
    <StudentLayout>
      {/* Header Section: Combines title and ensures proper alignment with mobile menu on small screens */}
      <div className="flex items-center justify-start lg:justify-between mb-8 relative">
        {/* On mobile, the title will push past the fixed menu button, but on desktop, it starts clearly */}
        <h1 className="text-3xl font-extrabold text-gray-900 ml-16 lg:ml-0">Available Courses</h1>
      </div>
      <p className="text-gray-500 mb-6 -mt-6 ml-0 lg:ml-0 hidden lg:block">
        Browse and register for courses in your department
      </p>

      {/* Filters Card - Styled to match the design's clean, white look */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Academic Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              // Using a cleaner, bordered input style
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Semester Type
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
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

      {/* Courses Grid - Emulating the modern card design */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Available Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {courses?.map((course, index) => {
          const status = course.payment?.status;
          const tagStyle = getCourseTagStyle(index);

          return (
            // Course Card - Clean, rounded white card with slight shadow
            <div key={course.id} className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
              
              {/* Course Code and Status Badge (Top Section) */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${tagStyle.bg} rounded-full flex items-center justify-center text-white shadow-md ${tagStyle.shadow}`}>
                  <BookOpen className="h-5 w-5" />
                </div>
                {course.payment && (
                  <Badge status={status} />
                )}
              </div>
              
              {/* Course Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug">
                {course.title}
              </h3>
              
              {/* Course Code */}
              <p className="text-sm font-mono text-gray-500 mb-4 font-semibold">
                {course.course_code}
              </p>

              <hr className="my-2 border-gray-100" />
              
              {/* Details Section (Emulating the detail lines below the title) */}
              <div className="space-y-2 text-sm mb-5 flex-grow">
                <p className="text-gray-600 flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Department:</span> {course.department}
                </p>
                <p className="text-gray-600 flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Fee:</span>{' '}
                  <span className="text-green-600 font-bold">
                    {formatCurrency(course.fee)}
                  </span>
                </p>
              </div>

              {/* Action Buttons (Strictly maintaining existing logic) */}
              <div className="mt-auto pt-4 border-t border-gray-100">
                {/* Pay Now Button */}
                {!course.payment && (
                  <button
                    onClick={() => handlePayNow(course)}
                    // Custom primary button styling using the theme color
                    style={{ backgroundColor: WMOuBlue }}
                    className="w-full px-4 py-2 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Pay Now
                  </button>
                )}

                {/* Pending Status Button */}
                {status === 'pending' && (
                  <button className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl font-medium cursor-not-allowed shadow-none">
                    Pending Approval
                  </button>
                )}

                {/* Approved Status Button */}
                {status === 'approved' && (
                  <button className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-xl font-medium cursor-not-allowed shadow-none">
                    ✓ Paid & Registered
                  </button>
                )}

                {/* Rejected Status Block */}
                {status === 'rejected' && (
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-xl font-medium cursor-not-allowed shadow-none">
                      Payment Rejected
                    </button>
                    {course.payment.rejection_reason && (
                      <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                        <strong>Reason:</strong> {course.payment.rejection_reason}
                      </p>
                    )}
                    <button
                      onClick={() => handlePayNow(course)}
                      style={{ backgroundColor: WMOuBlue }}
                      className="w-full px-4 py-2 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Pay Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Courses Available */}
      {courses?.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm mt-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No courses available for this session and semester.</p>
        </div>
      )}

      {/* Payment Modal (NO CHANGE) */}
      {selectedCourse && (
        <Modal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCourse(null);
          }}
          title={`Upload Payment Proof for ${selectedCourse.course_code}`}
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