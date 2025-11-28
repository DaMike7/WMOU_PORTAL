import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StudentLayout from './StudentLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { User, Camera, Lock } from 'lucide-react';

const ProfilePage = () =>{
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

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      updateUser({ ...user, ...profileData });
      setEditMode(false);
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: authService.uploadProfilePicture,
    onSuccess: (data) => {
      toast.success('Profile picture updated');
      updateUser({ ...user, profile_picture_url: data.url });
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      toast.error('Failed to upload picture');
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
      toast.error(error.response?.data?.detail || 'Failed to change password');
    },
  });

  const handleProfileUpdate = () => {
    updateMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
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

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <div className="card text-center">
          <div className="relative inline-block mb-4">
            {user?.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                <User className="h-16 w-16 text-primary-600" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePictureUpload}
              />
            </label>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
          <p className="text-gray-600 font-mono">{user?.reg_no}</p>
          <p className="text-sm text-gray-500 mt-1 capitalize">{user?.role}</p>
        </div>

        {/* Profile Details Card */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Personal Information
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="btn-secondary text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={user?.full_name}
                disabled
                className="input bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                value={user?.reg_no}
                disabled
                className="input bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={user?.department}
                disabled
                className="input bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                disabled={!editMode}
                className={editMode ? 'input' : 'input bg-gray-100'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                disabled={!editMode}
                className={editMode ? 'input' : 'input bg-gray-100'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
                disabled={!editMode}
                className={editMode ? 'input' : 'input bg-gray-100'}
                rows="3"
              />
            </div>

            {editMode && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditMode(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  disabled={updateMutation.isLoading}
                  className="btn-primary flex-1"
                >
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <Lock className="h-4 w-4" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.old_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, old_password: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) =>
                setPasswordData({ ...passwordData, new_password: e.target.value })
              }
              className="input"
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
                setPasswordData({
                  ...passwordData,
                  confirm_password: e.target.value,
                })
              }
              className="input"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isLoading}
              className="btn-primary"
            >
              {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </Modal>
    </StudentLayout>
  );
}
export default ProfilePage;