import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { courseService } from '../../services/courseService';
import { toast } from 'react-hot-toast';
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { DEPARTMENTS, SESSIONS, SEMESTERS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

export default function CoursesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '',
    title: '',
    department: '',
    session: '',
    semester: '',
    fee: '',
  });

  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => courseService.getCourses(),
  });

  const createMutation = useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => {
      toast.success('Course created successfully');
      setShowModal(false);
      queryClient.invalidateQueries(['adminCourses']);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create course');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ courseId, data }) => courseService.updateCourse(courseId, data),
    onSuccess: () => {
      toast.success('Course updated successfully');
      setShowModal(false);
      setEditingCourse(null);
      queryClient.invalidateQueries(['adminCourses']);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      toast.success('Course deleted successfully');
      queryClient.invalidateQueries(['adminCourses']);
    },
  });

  const resetForm = () => {
    setFormData({
      course_code: '',
      title: '',
      department: '',
      session: '',
      semester: '',
      fee: '',
    });
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      title: course.title,
      department: course.department,
      session: course.session,
      semester: course.semester,
      fee: course.fee,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      fee: parseFloat(formData.fee),
    };

    if (editingCourse) {
      updateMutation.mutate({ courseId: editingCourse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(courseId);
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
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingCourse(null);
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses?.map((course) => (
                <tr key={course.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold">
                    {course.course_code}
                  </td>
                  <td className="px-6 py-4">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.session}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{course.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(course.fee)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-800"
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
      </div>

      {/* Add/Edit Course Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCourse(null);
          resetForm();
        }}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Code *
            </label>
            <input
              type="text"
              value={formData.course_code}
              onChange={(e) =>
                setFormData({ ...formData, course_code: e.target.value })
              }
              className="input"
              disabled={!!editingCourse}
              required
            />
          </div>

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
              Session *
            </label>
            <select
              value={formData.session}
              onChange={(e) =>
                setFormData({ ...formData, session: e.target.value })
              }
              className="input"
              required
            >
              <option value="">Select Session</option>
              {SESSIONS.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester *
            </label>
            <select
              value={formData.semester}
              onChange={(e) =>
                setFormData({ ...formData, semester: e.target.value })
              }
              className="input"
              required
            >
              <option value="">Select Semester</option>
              {SEMESTERS.map((sem) => (
                <option key={sem.value} value={sem.value}>
                  {sem.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.fee}
              onChange={(e) =>
                setFormData({ ...formData, fee: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingCourse(null);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="btn-primary"
            >
              {editingCourse ? 'Update' : 'Create'} Course
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}