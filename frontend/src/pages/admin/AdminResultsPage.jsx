import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { resultService } from '../../services/resultService';
import { toast } from 'react-hot-toast';
import { Upload, ChevronLeft, ChevronRight, BookOpen, FileText } from 'lucide-react';
import { SESSIONS, SEMESTERS } from '../../utils/constants';

const WMOuBlue = '#1e3a5f';
const primaryBtnStyle = `px-4 py-2 text-white rounded-xl font-semibold transition-colors disabled:opacity-50`;
const secondaryBtnStyle = `px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors`;
const inputStyle = "w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-[#1e3a5f]/50 focus:border-[#1e3a5f] transition duration-150 ease-in-out shadow-sm";

// Helper to determine text color for Grade
const getGradeColor = (grade) => {
    switch (grade) {
        case 'A': return 'text-green-600 font-bold';
        case 'B': return 'text-blue-600 font-semibold';
        case 'C': return 'text-yellow-600';
        case 'D': return 'text-orange-600';
        case 'E': return 'text-red-500';
        case 'F': return 'text-red-700 font-bold';
        default: return 'text-gray-500';
    }
};

const ResultsPage = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState(''); // Textarea content for bulk upload
    const [selectedSession, setSelectedSession] = useState(SESSIONS[0] || '');
    const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0].value || '');
    const [currentPage, setCurrentPage] = useState(1);

    const queryClient = useQueryClient();

    // Data Fetching: Fetches results based on session/semester filters
    const { data: resultsData, isLoading } = useQuery({
        queryKey: ['adminResults', selectedSession, selectedSemester, currentPage],
        // Assuming getStudentResults can be used to fetch all results for a session/semester
        queryFn: () => resultService.getStudentResults(selectedSession, selectedSemester, currentPage, 30),
        keepPreviousData: true,
    });

    // Mutation for Bulk Result Upload (Feature 6)
    const bulkUploadMutation = useMutation({
        mutationFn: ({ session, semester, results }) => 
            resultService.bulkUploadResults(session, semester, results),
        onSuccess: (data) => {
            toast.success(`Successfully uploaded ${data.uploaded_count} results.`);
            if (data.failed_count > 0) {
                 toast.error(`${data.failed_count} results failed to upload. Check logs.`);
            }
            setShowUploadModal(false);
            setUploadData('');
            queryClient.invalidateQueries(['adminResults']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.detail || 'Failed to perform bulk upload. Check data format.');
        },
    });

    const handleBulkUpload = (e) => {
        e.preventDefault();

        // 1. Basic validation
        if (!selectedSession || !selectedSemester) {
            toast.error("Please select a Session and Semester for the upload.");
            return;
        }

        let resultsArray;
        try {
            // 2. Parse the JSON input from the textarea
            resultsArray = JSON.parse(uploadData);
            if (!Array.isArray(resultsArray) || resultsArray.length === 0) {
                throw new Error("Input must be a non-empty JSON array.");
            }

            // 3. Simple schema check on the first element
            const requiredFields = ['reg_no', 'course_code', 'score'];
            const firstItem = resultsArray[0];
            if (!requiredFields.every(field => firstItem.hasOwnProperty(field))) {
                 toast.error(`Invalid data structure. Each object must contain: ${requiredFields.join(', ')}`);
                 return;
            }

        } catch (error) {
            toast.error(`Invalid JSON data format: ${error.message}`);
            return;
        }

        // 4. Execute mutation
        bulkUploadMutation.mutate({
            session: selectedSession,
            semester: selectedSemester,
            results: resultsArray,
        });
    };
    
    // Memoized example for the bulk upload format
    const jsonExample = useMemo(() => ([
        { "reg_no": "STD/2024/001", "course_code": "CSC101", "score": 75 },
        { "reg_no": "STD/2024/002", "course_code": "CSC101", "score": 62 },
        { "reg_no": "STD/2024/003", "course_code": "MTH101", "score": 45 }
    ]), []);
    

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
                <h1 className="text-3xl font-extrabold text-gray-900">Result Management</h1>
                <button
                    onClick={() => {
                        setUploadData('');
                        setShowUploadModal(true);
                    }}
                    className={`flex items-center px-4 py-2 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg`}
                    style={{ backgroundColor: WMOuBlue }}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload Results
                </button>
            </div>
            
            <p className="text-gray-500 mb-6 -mt-4 hidden lg:block">
                View and manage student academic records by session and semester. Total: {resultsData?.total || 0} records
            </p>

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">

                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    {/* Filters */}
                    <div className="flex space-x-4 w-full sm:w-auto">
                        <select
                            value={selectedSession}
                            onChange={(e) => {
                                setSelectedSession(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={inputStyle + " text-sm w-full sm:w-auto"}
                        >
                            <option value="">Filter by Session</option>
                            {SESSIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                         <select
                            value={selectedSemester}
                            onChange={(e) => {
                                setSelectedSemester(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={inputStyle + " text-sm w-full sm:w-auto"}
                        >
                            <option value="">Filter by Semester</option>
                            {SEMESTERS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-blue-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">
                                    Student/Reg No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                                    Course
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                                    Uploaded Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {resultsData?.data?.map((result) => (
                                <tr key={result.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-medium text-gray-900">{result.users?.full_name || 'N/A'}</p>
                                        <p className="font-mono text-xs text-gray-500">{result.users?.reg_no || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <p className="font-semibold text-sm">{result.courses?.course_code || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">{result.courses?.title || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-base font-bold text-gray-800">
                                        {result.score}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg">
                                        <span className={getGradeColor(result.grade)}>{result.grade}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs hidden md:table-cell">
                                        {result.uploaded_at ? new Date(result.uploaded_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {resultsData?.data?.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-lg">
                           No results found for the selected period.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {resultsData?.total_pages > 1 && (
                    <div className="flex items-center justify-between px-2 sm:px-6 py-4 border-t border-gray-100 mt-4">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {resultsData.total_pages}
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
                                onClick={() => setCurrentPage((p) => Math.min(resultsData.total_pages, p + 1))}
                                disabled={currentPage === resultsData.total_pages}
                                className="px-3 py-1.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Upload Modal (Feature 6) */}
            <Modal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setUploadData('');
                }}
                title="Bulk Upload Student Results"
            >
                <form onSubmit={handleBulkUpload} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Select the academic period for these results and paste the data below.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            className={inputStyle}
                            required
                        >
                            <option value="">Select Session *</option>
                            {SESSIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                         <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            className={inputStyle}
                            required
                        >
                            <option value="">Select Semester *</option>
                            {SEMESTERS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="block text-sm font-semibold text-gray-700 pt-2">
                        Results Data (JSON Array) *
                    </label>
                    <textarea
                        value={uploadData}
                        onChange={(e) => setUploadData(e.target.value)}
                        className={inputStyle + " font-mono text-xs"}
                        rows="10"
                        placeholder={JSON.stringify(jsonExample, null, 2)}
                        required
                    />
                    
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
                        <p className="font-semibold flex items-center mb-1">
                            <FileText className="w-4 h-4 mr-2" /> Required Format
                        </p>
                        <p>The data must be a **JSON array** where each object contains the student's `reg_no`, the course `course_code`, and the `score` (0-100).</p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowUploadModal(false)}
                            className={secondaryBtnStyle}
                            disabled={bulkUploadMutation.isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={bulkUploadMutation.isLoading}
                            className={primaryBtnStyle}
                            style={{ backgroundColor: WMOuBlue }}
                        >
                            {bulkUploadMutation.isLoading ? 'Uploading...' : 'Upload Results'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
};

export default ResultsPage;