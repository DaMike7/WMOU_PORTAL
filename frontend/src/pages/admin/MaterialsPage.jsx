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

const WMOuBlue = '#1e3a5f';
const WMOuBlueText = 'text-[#1e3a5f]';
const primaryBtnStyle = `px-4 py-2 text-white rounded-xl font-semibold transition-colors disabled:opacity-50`;
const secondaryBtnStyle = `px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors`;
const inputStyle = "w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-[#1e3a5f]/50 focus:border-[#1e3a5f] transition duration-150 ease-in-out shadow-sm";

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
    keepPreviousData: true,
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

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setFormData({ course_id: '', title: '' });
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
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-3xl font-extrabold text-gray-900 ml-10 lg:ml-0">Course Materials</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className={`flex items-center px-4 py-2 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg`}
          style={{ backgroundColor: WMOuBlue }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Material
        </button>
      </div>
      
      <p className="text-gray-500 mb-6 -mt-4 ml-10 lg:ml-0 hidden lg:block">
        Manage lecture notes, slides, and files for all courses. Total: {materialsData?.total || 0} materials
      </p>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
        
        <div className="flex space-x-4 border-b border-gray-100 mb-6 pb-2">
            <span className={`py-2 px-4 font-semibold ${WMOuBlueText} border-b-2 border-[#1e3a5f]`}>
                All Materials ({materialsData?.total || 0})
            </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  File Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {materialsData?.data?.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">{material.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <p className="font-semibold text-sm">{material.courses?.course_code}</p>
                    <p className="text-xs text-gray-500">{material.courses?.title}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 hidden md:table-cell">
                    .{material.file_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {formatDateTime(material.uploaded_at)}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex space-x-2 justify-center">
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition"
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
          
          {materialsData?.data?.length === 0 && (
            <div className="text-center py-8 text-gray-500">No course materials have been uploaded yet.</div>
          )}
        </div>

        {materialsData?.total_pages > 1 && (
          <div className="flex items-center justify-between px-2 sm:px-6 py-4 border-t border-gray-100 mt-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {materialsData.total_pages}
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
                onClick={() => setCurrentPage((p) => Math.min(materialsData.total_pages, p + 1))}
                disabled={currentPage === materialsData.total_pages}
                className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
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
              className={inputStyle}
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
              className={inputStyle}
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
              className={`block w-full text-sm text-gray-900 border border-gray-200 rounded-xl cursor-pointer bg-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200`}
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
              onClick={handleCloseModal}
              className={secondaryBtnStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isLoading}
              className={primaryBtnStyle}
              style={{ backgroundColor: WMOuBlue }}
            >
              {uploadMutation.isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                'Upload Material'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default MaterialsPage;