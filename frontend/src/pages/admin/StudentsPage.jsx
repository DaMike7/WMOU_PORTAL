import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { userService } from '../../services/userService';
import { toast } from 'react-hot-toast';
import { UserPlus, Search } from 'lucide-react';
import { DEPARTMENTS, STUDENT_STATUS } from '../../utils/constants';

export default function StudentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    reg_no: '',
    email: '',
    full_name: '',
    department: '',
    phone: '',
  });

  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => userService.getAllUsers('student'),
  });

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success('Student created successfully');
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
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, role: 'student' });
  };

  const filteredStudents = students?.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.reg_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, reg no, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reg No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents?.map((student) => (
                <tr key={student.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap font-mono">
                    {student.reg_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={student.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={student.status}
                      onChange={(e) =>
                        updateStatusMutation.mutate({
                          userId: student.id,
                          status: e.target.value,
                        })
                      }
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="graduated">Graduated</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Student">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number *
            </label>
            <input
              type="text"
              value={formData.reg_no}
              onChange={(e) =>
                setFormData({ ...formData, reg_no: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="input"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="btn-primary"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}