import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { userService } from '../../services/userService';
import { toast } from 'react-hot-toast';
import { UserPlus, Search, ChevronLeft, ChevronRight, Crown, User } from 'lucide-react';

const WMOuBlue = '#1e3a5f';
const WMOuBlueText = 'text-[#1e3a5f]';

const AdminUsersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    // Non-default/Optional field:
    phone: '', 
    // Password required by backend model, but kept hidden in state:
    password: '1234567', 
  });

  const queryClient = useQueryClient();

  // Fetch only Admin users (role='admin')
  const { data: adminsData, isLoading } = useQuery({
    queryKey: ['adminUsers', currentPage],
    queryFn: () => userService.getAllUsers('admin', currentPage, 50),
    keepPreviousData: true,
  });

  // Mutation to create a new user with role 'admin'
  const createMutation = useMutation({
    // IMPORTANT: ASSUMING this function hits the new /api/admin/adminusers/create endpoint
    mutationFn: userService.createAdminUser, 
    onSuccess: () => {
      toast.success('New Admin user created successfully. Credentials emailed.');
      setShowModal(false);
      queryClient.invalidateQueries(['adminUsers']);
      setFormData({
        email: '',
        full_name: '',
        phone: '', // Reset phone
        password: '1234567',
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create admin user');
    },
  });
  

  const handleSubmit = (e) => {
    e.preventDefault();
    // The role is now set by the backend, so we pass the full formData object.
    createMutation.mutate(formData);
  };

  const filteredAdmins = adminsData?.data?.filter(
    (admin) =>
      admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
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
        <h1 className="text-3xl font-extrabold text-gray-900">Admin User Records</h1>
        <button 
          onClick={() => {
            // Reset form data completely
            setFormData({
              email: '',
              full_name: '', 
              phone: '', // Reset phone
              password: '1234567'
            });
            setShowModal(true);
          }} 
          className={`flex items-center px-4 py-2 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg`}
          style={{ backgroundColor: WMOuBlue }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Admin
        </button>
      </div>
      
      <p className="text-gray-500 mb-6 -mt-4 hidden lg:block">
        Manage all administrative staff accounts. Total: {adminsData?.total || 0} records
      </p>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">

        {/* ... existing search and table display ... */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex space-x-4 border-b border-gray-100 pb-2 w-full sm:w-auto">
                <span className={`py-2 px-4 font-semibold ${WMOuBlueText} border-b-2 border-[#1e3a5f]`}>
                    All Admins ({adminsData?.total || 0})
                </span>
            </div>
            
            <div className="relative w-full sm:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search admin users..."
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
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                {/* --- NEW COLUMN: Created By (Feature 8) --- */}
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAdmins?.map((admin) => (
                <tr key={admin.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center">
                    <Crown className="w-4 h-4 mr-2 text-yellow-500 hidden lg:inline" />
                    {admin.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm hidden sm:table-cell text-red-600 font-bold">
                    {admin.role.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {admin.email}
                  </td>
                  {/* --- NEW DATA CELL: Created By (Feature 8) --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {admin.created_by_name || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={admin.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAdmins?.length === 0 && (
            <div className="text-center py-8 text-gray-500">No admin users found matching your search.</div>
          )}
        </div>

        <div className="flex items-center justify-between px-2 sm:px-6 py-4 border-t border-gray-100 mt-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {adminsData?.total_pages || 1}
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
              onClick={() => setCurrentPage((p) => Math.min(adminsData?.total_pages, p + 1))}
              disabled={currentPage === adminsData?.total_pages || adminsData?.total_pages === 0}
              className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Admin Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Admin User">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={inputStyle}
                placeholder="Enter admin's full name"
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
                placeholder="admin@wmou.edu"
                required
              />
            </div>

            {/* --- ADDED: Phone Number (Non-default, Optional field) --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputStyle}
                placeholder="e.g., +2348012345678"
              />
            </div>
            {/* --- END ADDED --- */}
            
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              **Note:** A temporary password (<code className="bg-blue-100 px-2 py-0.5 rounded">1234567</code>) will be set and the login credentials will be **emailed** to the new admin user.
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
              {createMutation.isLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminUsersPage;