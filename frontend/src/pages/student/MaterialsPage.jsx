import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from './StudentLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { courseService } from '../../services/courseService.js';
import { materialService } from '../../services/materialService.js';
import { Download, FileText, Folder, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const MaterialsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ['registeredCourses', currentPage],
    queryFn: () => courseService.getRegisteredCourses(currentPage, 20),
  });

  if (isLoading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    );
  }

  const approvedCourses = registrationsData?.data?.filter(
    (reg) => reg.payment_status?.status === 'approved'
  );

  return (
    <StudentLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Course Materials</h1>
        <p className="text-gray-500 mt-1">
          Access study materials for your registered courses
        </p>
      </div>

      {approvedCourses?.length === 0 ? (
        <div className="card">
          <EmptyState
            message="No approved courses. Pay for courses to access materials."
            icon={Folder}
          />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {approvedCourses?.map((reg) => (
              <CourseMaterialsCard key={reg.id} registration={reg} />
            ))}
          </div>

          {/* Pagination */}
          {registrationsData?.total_pages > 1 && (
            <div className="flex items-center justify-between mt-6 card">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {registrationsData.total_pages}
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
                  onClick={() => setCurrentPage((p) => Math.min(registrationsData.total_pages, p + 1))}
                  disabled={currentPage === registrationsData.total_pages}
                  className="px-3 py-1.5 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </StudentLayout>
  );
};

function CourseMaterialsCard({ registration }) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: materialsData, isLoading } = useQuery({
    queryKey: ['materials', registration.course_id, currentPage],
    queryFn: () => materialService.getCourseMaterials(registration.course_id, currentPage, 20),
  });

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <Folder className="h-6 w-6 text-[#1e3a5f]" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {registration.courses?.course_code}
          </h2>
          <p className="text-sm text-gray-600">{registration.courses?.title}</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : materialsData?.data?.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">No materials uploaded yet</p>
      ) : (
        <>
        <div className="space-y-3">
          {materialsData?.data?.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-4 bg-white border-2 border-[#1e3a5f]/10 rounded-xl hover:border-[#1e3a5f]/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#1e3a5f]/10 rounded-lg group-hover:bg-[#1e3a5f]/20 transition-colors">
                  <FileText className="h-6 w-6 text-[#1e3a5f]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{material.title}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded: {formatDateTime(material.uploaded_at)}
                  </p>
                </div>
              </div>
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8f] transition-colors shadow-md hover:shadow-lg"
                download
              >
                <Download className="h-5 w-5" />
              </a>
            </div>
          ))}
        </div>

          {/* Pagination for materials */}
          {materialsData?.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-xs text-gray-500">
                Page {currentPage} of {materialsData.total_pages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(materialsData.total_pages, p + 1))}
                  disabled={currentPage === materialsData.total_pages}
                  className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MaterialsPage;