import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { User, Camera, Lock, Mail, Phone, Home, X, Save, Shield, UserPlus } from 'lucide-react';

// External application imports (must be available in your project structure)
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner'; 
import Modal from '../../components/common/Modal'; 
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';


const WMOuBlue = '#1e3a5f'; 
const WMOuBlueBg = 'bg-[#1e3a5f]';
const WMOuBlueText = 'text-[#1e3a5f]';
const WMOuBlueHover = 'hover:bg-[#152945]';

const baseInputStyle = "w-full px-4 py-3 border rounded-xl shadow-sm transition-colors duration-150";
const editableInputStyle = `${baseInputStyle} border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:ring-[#1e3a5f]/50 focus:border-[#1e3a5f]`;
const disabledInputStyle = `${baseInputStyle} border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed`;

const baseButtonStyle = "py-3 px-6 rounded-xl font-semibold shadow-md transition-all duration-200";

const AdminProfilePage = () =>{
  const { user, updateUser } = useAuthStore();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

const { data: creator, isLoading: isCreatorLoading } = useQuery({
  queryKey: ['adminCreator', user?.created_by],
  queryFn: async () => {
    const response = await api.get(`/api/admin/users/${user.created_by}`);
    return response.data;
  },
  enabled: !!user?.created_by,
});

  // Effect to keep local form data in sync with global user store data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  // --- Mutations ---
  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      // Update the global store with the new data
      updateUser({ ...user, ...profileData }); 
      setEditMode(false);
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to update profile';
      toast.error(errorMessage);
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: authService.uploadProfilePicture,
    onSuccess: (data) => {
      toast.success('Profile picture updated');
      // Update the global store with the new picture URL
      updateUser({ ...user, profile_picture_url: data.url });
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to upload picture';
      toast.error(errorMessage);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || 'Failed to change password';
      toast.error(errorMessage);
    },
  });

  // --- Handlers ---
  const handleProfileUpdate = () => {
    if (!profileData.email) {
      toast.error("Email is required.");
      return;
    }
    updateMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
       toast.error('New password must be at least 8 characters long');
      return;
    }
    if (!passwordData.old_password || !passwordData.new_password) {
       toast.error('Please fill out all password fields.');
      return;
    }

    changePasswordMutation.mutate({
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
    });
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadPictureMutation.mutate(file);
    }
  };

  const handleCancelEdit = () => {
    // Reset local state to match current global user state
    setProfileData({
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setEditMode(false);
  }

  const getInputClass = (isEditable) => {
    if (isEditable && editMode) return editableInputStyle;
    return disabledInputStyle;
  };
  
  if (!user) {
    return <LoadingSpinner />; 
  }

  return (
    <AdminLayout>
      <h1 className={`text-3xl font-extrabold ${WMOuBlueText} mb-8 border-b border-gray-200 pb-2`}>
        Admin Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Picture & Info Card (Column 1) */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-fit sticky top-6">
            <div className="relative inline-block mb-4 w-32 h-32 mx-auto">
              {/* Profile Picture */}
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover mx-auto ring-4 ring-gray-200 shadow-inner"
                />
              ) : (
                <div className={`h-full w-full rounded-full ${WMOuBlueBg} flex items-center justify-center mx-auto shadow-inner`}>
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
              {/* Upload Button */}
              <label 
                className={`absolute bottom-0 right-0 ${WMOuBlueBg} text-white p-2 rounded-full cursor-pointer transition-colors ${WMOuBlueHover} shadow-lg ring-4 ring-white`}>
                {uploadPictureMutation.isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  disabled={uploadPictureMutation.isLoading}
                />
              </label>
            </div>
            
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-gray-900">{user.full_name || 'Admin Name'}</h2>
              <p className="text-sm text-gray-600 font-mono mt-1">{user.reg_no || 'N/A'}</p>
              <p className="text-md font-semibold text-gray-700 mt-2 capitalize flex items-center justify-center">
                <Shield className="w-4 h-4 mr-1 text-green-500" /> 
                {user.title || user.role}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
              <button
                onClick={() => setShowPasswordModal(true)}
                className={`flex items-center space-x-2 text-sm font-medium ${WMOuBlueText} hover:underline`}
              >
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
              </button>
            </div>
          </div>
          
          {/* Creator Information Card (Shows who created this admin) */}
          {/* FIX: Changed user.created_by to user.created_by_user_id */}
          {user.created_by && (
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <h3 className={`text-lg font-bold mb-4 pb-2 border-b ${WMOuBlueText} flex items-center`}>
                    <UserPlus className="w-5 h-5 mr-2" /> Account Creator
                </h3>
                {isCreatorLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="space-y-3 text-sm text-gray-700">
                        <p><strong>Name:</strong> {creator?.full_name || 'Unknown'}</p>
                        <p><strong>Title:</strong> {creator?.title || 'System'}</p>
                        {/* FIX: Changed user.created_by to user.created_by_user_id */}
                        <p className="break-all"><strong>ID:</strong> {user.created_by}</p>
                        {creator?.created_at && (
                           <p><strong>Created On:</strong> {new Date(creator.created_at).toLocaleDateString()}</p>
                        )}
                    </div>
                )}
            </div>
          )}

        </div>

        {/* Profile Details Card (Column 2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
            <h2 className={`text-xl font-bold text-gray-900`}>
              Contact & Biographical Information
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className={`flex items-center ${baseButtonStyle} bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm`}
              >
                <Save className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          <form className="space-y-6">
            
            {/* Disabled (Read-only) Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input type="text" value={user.full_name || ''} disabled className={disabledInputStyle} />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Number
                    </label>
                    <input type="text" value={user.reg_no || ''} disabled className={disabledInputStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role / Title
                    </label>
                    <input type="text" value={user.title || user.role || ''} disabled className={disabledInputStyle} />
                  </div>
            </div>
            
            {/* Editable Contact Information Section */}
            <div className='border-t border-gray-100 pt-6'>
                <h3 className={`text-lg font-semibold ${WMOuBlueText} mb-4`}>Editable Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-1 text-gray-400" /> Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!editMode}
                      className={getInputClass(true)}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-1 text-gray-400" /> Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!editMode}
                      className={getInputClass(true)}
                      placeholder="e.g., +234 800 123 4567"
                    />
                  </div>
                </div>
            </div>

            {/* Address */}
            <div className='pt-2'>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Home className="w-4 h-4 mr-1 text-gray-400" /> Address
              </label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                disabled={!editMode}
                className={getInputClass(true)}
                rows="3"
                placeholder="Enter your current office address"
              />
            </div>

            {/* Save/Cancel Buttons */}
            {editMode && (
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={`${baseButtonStyle} bg-gray-400 text-white hover:bg-gray-500 flex-1 flex items-center justify-center`}
                  disabled={updateMutation.isLoading}
                >
                  <X className='h-5 w-5 mr-2'/>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProfileUpdate}
                  disabled={updateMutation.isLoading}
                  className={`${baseButtonStyle} ${WMOuBlueBg} text-white ${WMOuBlueHover} flex-1 flex items-center justify-center`}
                >
                  <Save className='h-5 w-5 mr-2'/>
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4 p-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
              className={editableInputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              className={editableInputStyle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm_password: e.target.value })
              }
              className={editableInputStyle}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className={`${baseButtonStyle} bg-gray-400 text-white hover:bg-gray-500`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isLoading || passwordData.new_password !== passwordData.confirm_password || !passwordData.new_password || !passwordData.old_password}
              className={`${baseButtonStyle} ${WMOuBlueBg} text-white ${WMOuBlueHover}`}
            >
              {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
export default AdminProfilePage;