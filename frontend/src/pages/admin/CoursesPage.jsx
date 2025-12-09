import React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { courseService } from '../../services/courseService';
import { toast } from 'react-hot-toast';
import { BookOpen, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Filter, Users } from 'lucide-react';
import { DEPARTMENTS, SESSIONS, SEMESTERS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';


const WMOuBlue = '#1e3a5f'; // Theme color
const WMOuBlueBg = 'bg-[#1e3a5f]';
const WMOuBlueText = 'text-[#1e3a5f]';

// Course Form Component (Remains largely the same, but kept for context)
const CourseForm = ({ formData, setFormData, handleSubmit, isEditing, createMutation, updateMutation, resetForm, onClose }) => {
    const isMutating = createMutation.isLoading || updateMutation.isLoading;

    const inputStyle = "w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-[#1e3a5f]/50 focus:border-[#1e3a5f] transition duration-150 ease-in-out shadow-sm";
    const primaryBtnStyle = `px-4 py-2 text-white rounded-xl font-semibold transition-colors disabled:opacity-50`;
    const secondaryBtnStyle = `px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors`;
    
    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course Code */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Course Code *
                    </label>
                    <input
                        type="text"
                        value={formData.course_code}
                        onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                        className={inputStyle}
                        placeholder="e.g., CSC101"
                        disabled={isEditing}
                        required
                    />
                </div>

                {/* Fee */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fee (₦) *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.fee}
                        onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                        className={inputStyle}
                        placeholder="10000"
                        required
                    />
                </div>
            </div>

            {/* Course Title */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Title *
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={inputStyle}
                    placeholder="e.g., Introduction to Computer Science"
                    required
                />
            </div>

            {/* Department */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Session */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Session *
                    </label>
                    <select
                        value={formData.session}
                        onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                        className={inputStyle}
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

                {/* Semester */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Semester *
                    </label>
                    <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className={inputStyle}
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        resetForm();
                    }}
                    className={secondaryBtnStyle}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isMutating}
                    className={primaryBtnStyle}
                    style={{ backgroundColor: WMOuBlue }}
                >
                    {isMutating
                        ? (isEditing ? 'Updating...' : 'Creating...')
                        : (isEditing ? 'Update Course' : 'Add Course')
                    }
                </button>
            </div>
        </form>
    );
};


const CoursesPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDepartment, setSelectedDepartment] = useState(null); // Feature 1: Department Filter
    const [formData, setFormData] = useState({
        course_code: '',
        title: '',
        department: '',
        session: '',
        semester: '',
        fee: '',
    });

    const queryClient = useQueryClient();

    const { data: coursesData, isLoading, isPreviousData } = useQuery({
        queryKey: ['adminCourses', currentPage, selectedDepartment],
        queryFn: () => courseService.getCourses(
            null,
            null,
            selectedDepartment,
            currentPage,
            20 
        ),
        keepPreviousData: true,
    });

    // Reset page to 1 when department filter changes
    const handleDepartmentChange = (dept) => {
        setSelectedDepartment(dept);
        setCurrentPage(1);
    };

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
    
    // Function to mimic the status badge
    const renderStatusBadge = () => (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Active
        </span>
    );

    return (
        <AdminLayout>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6 relative">
                <h1 className="text-3xl font-extrabold text-gray-900">Course Management</h1>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingCourse(null);
                        setShowModal(true);
                    }}
                    className={`flex items-center px-4 py-2 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg`}
                    style={{ backgroundColor: WMOuBlue }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Course
                </button>
            </div>
            
            <p className="text-gray-500 mb-6 -mt-4 lg:block">
                Manage your courses, departments, and fees. Total: {coursesData?.total || 0} courses
            </p>

            {/* Main Content Card */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    {/* Department Filter (Feature 1) */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                         <Filter className="w-5 h-5 text-gray-500" />
                        <select
                            value={selectedDepartment || ""}
                            onChange={(e) => handleDepartmentChange(e.target.value || null)}
                            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white shadow-sm hover:border-gray-300 transition w-full sm:w-56"
                        >
                            <option value="">All Departments ({coursesData?.total || 0})</option>
                            {DEPARTMENTS.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Simple Total Count Badge */}
                    <div className="py-2 px-4 font-semibold text-white rounded-xl" style={{ backgroundColor: WMOuBlue }}>
                         <Users className="w-4 h-4 mr-1 inline" /> Students Enrolled: {coursesData?.data?.reduce((sum, course) => sum + (course.students_count || 0), 0) || 0}
                    </div>
                </div>

                {/* Table Section */}
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-blue-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">
                                    Course Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sm:table-cell">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider md:table-cell">
                                    Session/Semester
                                </th>
                                {/* --- NEW COLUMN: Student Count (Feature 2) --- */}
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Students
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Fee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {coursesData?.data?.map((course) => (
                                <tr key={course.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-normal font-medium text-gray-900">
                                        {course.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-sm text-blue-600">
                                        {course.course_code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 sm:table-cell">
                                        {course.department}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 md:table-cell">
                                        {course.session} ({course.semester.split(' ')[0]})
                                    </td>
                                    {/* --- NEW DATA CELL: Student Count (Feature 2) --- */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-gray-800">
                                        {course.students_count || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                                        {formatCurrency(course.fee)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="text-gray-500 hover:text-blue-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="text-gray-500 hover:text-red-600 p-1 rounded-lg hover:bg-gray-100 transition"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {coursesData?.total === 0 && (
                        <div className="text-center py-8 text-gray-500 text-lg">
                           No courses found {selectedDepartment ? `in ${selectedDepartment}.` : 'in the system.'}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {coursesData?.total_pages > 1 && (
                    <div className="flex items-center justify-between px-2 sm:px-6 py-4 border-t border-gray-100 mt-4">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {coursesData.total_pages}
                            {isPreviousData && ' (loading next page...)'}
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
                                onClick={() => setCurrentPage((p) => Math.min(coursesData.total_pages, p + 1))}
                                disabled={currentPage === coursesData.total_pages}
                                className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Course Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingCourse(null);
                    resetForm();
                }}
                title={editingCourse ? 'Edit Course Details' : 'Add New Course'}
            >
                <CourseForm 
                    formData={formData} 
                    setFormData={setFormData} 
                    handleSubmit={handleSubmit} 
                    isEditing={!!editingCourse} 
                    createMutation={createMutation} 
                    updateMutation={updateMutation} 
                    resetForm={resetForm} 
                    onClose={() => setShowModal(false)} // Pass specific close function
                />
            </Modal>
        </AdminLayout>
    );
};

export default CoursesPage;