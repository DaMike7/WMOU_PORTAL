import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from './StudentLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { resultService } from '../../services/resultService';
import { Award, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGradeColor } from '../../utils/helpers';
import { SESSIONS, SEMESTERS } from '../../utils/constants';

const ResultsPage = () => {
  const [session, setSession] = useState('2025/2026');
  const [semester, setSemester] = useState('First Semester');
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading } = useQuery({
    queryKey: ['results', session, semester, page],
    queryFn: () => resultService.getStudentResults(session, semester, page, limit),
    keepPreviousData: true,
  });

  const totalPages = data ? Math.ceil(data.total_courses / limit) : 0;

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading && !data) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Results</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session
            </label>
            <select
              value={session}
              onChange={(e) => {
                setSession(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              {SEMESTERS.map((sem) => (
                <option key={sem.value} value={sem.value}>
                  {sem.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* GPA Card */}
      {data?.results?.length > 0 && (
        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {semester} - {session}
              </p>
              <p className="text-4xl font-bold text-primary-600">{data.gpa}</p>
              <p className="text-sm text-gray-600 mt-1">Grade Point Average</p>
            </div>
            <TrendingUp className="h-12 w-12 text-primary-600" />
          </div>
        </div>
      )}

      {/* Results Table */}
      {data?.results?.length === 0 ? (
        <div className="card">
          <EmptyState
            message="No results available for this session and semester"
            icon={Award}
          />
        </div>
      ) : (
        <>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.results?.map((result) => (
                    <tr key={result.id} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold">
                        {result.courses?.course_code}
                      </td>
                      <td className="px-6 py-4">{result.courses?.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold">
                        {result.score}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-3xl font-bold ${getGradeColor(
                            result.grade
                          )}`}
                        >
                          {result.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page <span className="font-semibold">{page}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1 || isLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>

                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages || isLoading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </StudentLayout>
  );
};

export default ResultsPage;