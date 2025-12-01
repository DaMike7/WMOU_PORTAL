import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { userService } from '../../services/userService';
import { toast } from 'react-hot-toast';
import { UserPlus, Search, ChevronLeft, ChevronRight, BookOpen, User, Users } from 'lucide-react';
import { DEPARTMENTS } from '../../utils/constants';

const WMOuBlue = '#1e3a5f';
const WMOuBlueText = 'text-[#1e3a5f]';

const StudentsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    reg_no: '',
    email: '',
    full_name: '',
    department: '',
    phone: '',
    // password is not included here as it's auto-generated/defaulted by the backend
  });

  const queryClient = useQueryClient();

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', currentPage],
    queryFn: () => userService.getAllUsers('student', currentPage, 50),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success('Student created successfully. Login credentials emailed.');
      setShowModal(false);
      queryClient.invalidateQueries(['students']);
      setFormData({
        reg_no: '',
        email: '',
        full_name: '',
        department: '',
        phone: '',
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create student');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => userService.updateUserStatus(userId, status),
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries(['students']);
    },
    onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to update status');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // The backend handles setting the default password and emailing the user
    createMutation.mutate({ ...formData, role: 'student', password: '1234567' });
  };

  const filteredStudents = studentsData?.data?.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (studentId, newStatus) => {
    updateStatusMutation.mutate({ userId: studentId, status: newStatus });
  };
  
  const inputStyle = "w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-[#1e3a5f]/50 focus:border-[#1e3a5f] transition duration-150 ease-in-out shadow-sm";
  const primaryBtnStyle = `px-4 py-2 text-white rounded-xl font-semibold transition-colors disabled:opacity-50`;
  const secondaryBtnStyle = `px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors`;


  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-3xl font-extrabold text-gray-900">Student Records</h1>
        <button 
          onClick={() => {
            setFormData({reg_no: '',email: '',full_name: '',department: '',phone: '',});
            setShowModal(true);
          }} 
          className={`flex items-center px-4 py-2 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg`}
          style={{ backgroundColor: WMOuBlue }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Student
        </button>
      </div>
      
      <p className="text-gray-500 mb-6 -mt-4 hidden lg:block">
        Manage all student accounts and update their status. Total: {studentsData?.total || 0} records
      </p>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">

        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex space-x-4 border-b border-gray-100 pb-2 w-full sm:w-auto">
                <span className={`py-2 px-4 font-semibold ${WMOuBlueText} border-b-2 border-[#1e3a5f]`}>
                    All Students ({studentsData?.total || 0})
                </span>
            </div>
            
            <div className="relative w-full sm:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 ${inputStyle}`}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-blue-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                  Reg No
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Department
                </th>
                {/* --- NEW COLUMN 1: Course Count (Feature 3) --- */}
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Courses
                </th>
                {/* --- NEW COLUMN 2: Created By (Feature 8) --- */}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredStudents?.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400 hidden lg:inline" />
                    {student.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm hidden sm:table-cell text-blue-600">
                    {student.reg_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {student.department}
                  </td>
                  {/* --- NEW DATA CELL 1: Course Count (Feature 3) --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                       <BookOpen className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                       {student.registered_courses_count || 0}
                    </div>
                  </td>
                  {/* --- NEW DATA CELL 2: Created By (Feature 8) --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {student.created_by_name || 'Admin'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={student.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={student.status}
                      onChange={(e) => handleStatusChange(student.id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white shadow-sm hover:border-gray-300 transition"
                      disabled={updateStatusMutation.isLoading}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="GRADUATED">Graduated</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents?.length === 0 && (
            <div className="text-center py-8 text-gray-500">No students found matching your search.</div>
          )}
        </div>

        <div className="flex items-center justify-between px-2 sm:px-6 py-4 border-t border-gray-100 mt-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {studentsData?.total_pages || 1}
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
              onClick={() => setCurrentPage((p) => Math.min(studentsData?.total_pages, p + 1))}
              disabled={currentPage === studentsData?.total_pages || studentsData?.total_pages === 0}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Student Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Student">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registration Number *
              </label>
              <input
                type="text"
                value={formData.reg_no}
                onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })}
                className={inputStyle}
                placeholder="e.g., STU/2024/001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={inputStyle}
                placeholder="Enter student's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputStyle}
                placeholder="student@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={inputStyle}
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputStyle}
                placeholder="+234 XXX XXX XXXX"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              **Note:** A temporary password (<code className="bg-blue-100 px-2 py-0.5 rounded">1234567</code>) will be set and the login credentials will be **emailed** to the student.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className={secondaryBtnStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className={primaryBtnStyle}
              style={{ backgroundColor: WMOuBlue }}
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default StudentsPage;