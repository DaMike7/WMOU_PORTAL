import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { materialService } from '../../services/materialService';
import { courseService } from '../../services/courseService';
import { toast } from 'react-hot-toast';
import { Upload, Trash2, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const MaterialsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
  });

  const queryClient = useQueryClient();

  const { data: materialsData, isLoading } = useQuery({
    queryKey: ['adminMaterials', currentPage],
    queryFn: () => materialService.getAllMaterials(currentPage, 20),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => courseService.getCourses(),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ courseId, title, file }) =>
      materialService.uploadMaterial(courseId, title, file),
    onSuccess: () => {
      toast.success('Material uploaded successfully');
      setShowModal(false);
      setSelectedFile(null);
      setFormData({ course_id: '', title: '' });
      queryClient.invalidateQueries(['adminMaterials']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to upload material');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: materialService.deleteMaterial,
    onSuccess: () => {
      toast.success('Material deleted successfully');
      queryClient.invalidateQueries(['adminMaterials']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    uploadMutation.mutate({
      courseId: parseInt(formData.course_id),
      title: formData.title,
      file: selectedFile,
    });
  };

  const handleDelete = (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      deleteMutation.mutate(materialId);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
          <p className="text-gray-500 mt-1">
            Total: {materialsData?.total || 0} materials
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Upload className="h-4 w-4 mr-2" />
          Upload Material
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  File Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materialsData?.data?.map((material) => (
                <tr key={material.id} className="table-row">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">{material.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-sm">
                        {material.courses?.course_code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {material.courses?.title}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {material.file_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {formatDateTime(material.uploaded_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {materialsData?.total_pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {materialsData.total_pages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(materialsData.total_pages, p + 1))}
                disabled={currentPage === materialsData.total_pages}
                className="px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Material Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedFile(null);
          setFormData({ course_id: '', title: '' });
        }}
        title="Upload Course Material"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course *
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Course</option>
              {coursesData?.data?.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Material Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g., Lecture Notes Week 1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              File *
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="input"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: PDF, DOC, DOCX, PPT, PPTX, ZIP (Max 10MB)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setSelectedFile(null);
                setFormData({ course_id: '', title: '' });
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isLoading}
              className="btn-primary"
            >
              {uploadMutation.isLoading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default MaterialsPage;