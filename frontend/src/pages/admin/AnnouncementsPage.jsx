import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { announcementService } from '../../services/announcementService';
import { toast } from 'react-hot-toast';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { DEPARTMENTS } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

export default function AnnouncementsPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_department: '',
  });

  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    // FIX: Wrap the function call in an anonymous function. 
    // This ensures TanStack Query's context object is NOT passed as the 'page' argument,
    // allowing the service function's default (page=1, limit=10) to be used correctly.
    queryFn: () => announcementService.getAnnouncements(),
  });

  const createMutation = useMutation({
    mutationFn: announcementService.createAnnouncement,
    onSuccess: () => {
      toast.success('Announcement created successfully');
      setShowModal(false);
      setFormData({ title: '', content: '', target_department: '' });
      queryClient.invalidateQueries(['announcements']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create announcement');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: announcementService.deleteAnnouncement,
    onSuccess: () => {
      toast.success('Announcement deleted successfully');
      queryClient.invalidateQueries(['announcements']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      target_department: formData.target_department || null,
    };
    createMutation.mutate(data);
  };

  const handleDelete = (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate(announcementId);
    }
  };
  
  // Custom styles (Assuming you have these defined elsewhere, but using placeholders here for a complete file)
  const WMOuBlue = '#1e3a5f';
  const inputStyle = "w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-[#1e3a5f]/50 focus:border-[#1e3a5f] transition duration-150 ease-in-out shadow-sm";
  const btnPrimaryStyle = `px-4 py-2 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 bg-[#1e3a5f] hover:bg-opacity-90`;
  const btnSecondaryStyle = `px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors`;
  const cardStyle = "bg-white p-6 rounded-2xl shadow-lg border border-gray-100";
  const primaryTextColor = 'text-[#1e3a5f]';


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
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <button onClick={() => setShowModal(true)} className={btnPrimaryStyle}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements?.data?.map((announcement) => ( // assuming backend returns { data: [], total: x }
          <div key={announcement.id} className={cardStyle}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Megaphone className={`h-5 w-5 ${primaryTextColor}`} />
                  <h3 className="text-lg font-bold text-gray-900">
                    {announcement.title}
                  </h3>
                </div>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 flex-wrap">
                  <span>By: {announcement.users?.full_name || 'Admin'}</span>
                  <span>•</span>
                  <span>{formatDateTime(announcement.created_at)}</span>
                  {announcement.target_department && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold">
                        {announcement.target_department}
                      </span>
                    </>
                  )}
                  {!announcement.target_department && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                        All Departments
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(announcement.id)}
                className="text-red-600 hover:text-red-800 ml-4 p-2 rounded-full hover:bg-red-50 transition-colors"
                disabled={deleteMutation.isLoading}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
         {announcements?.data?.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-white rounded-2xl shadow-lg border border-gray-100">
                <p className="text-lg font-medium">No announcements published yet.</p>
                <p className="text-sm">Click 'New Announcement' to start broadcasting messages.</p>
            </div>
          )}
      </div>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setFormData({ title: '', content: '', target_department: '' });
        }}
        title="Create Announcement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={inputStyle}
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className={inputStyle}
              rows="6"
              placeholder="Enter announcement content"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Department (Optional)
            </label>
            <select
              value={formData.target_department}
              onChange={(e) =>
                setFormData({ ...formData, target_department: e.target.value })
              }
              className={inputStyle}
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to send to all departments
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setFormData({ title: '', content: '', target_department: '' });
              }}
              className={btnSecondaryStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className={btnPrimaryStyle}
            >
              {createMutation.isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}