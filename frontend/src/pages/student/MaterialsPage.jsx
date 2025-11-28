import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from './StudentLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { courseService } from '../../services/courseService.js';
import { materialService } from '../../services/materialService.js';
import { Download, FileText, Folder } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const MaterialsPage = () => {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['registeredCourses'],
    queryFn: courseService.getRegisteredCourses,
  });

  if (isLoading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    );
  }

  const approvedCourses = registrations?.filter(
    (reg) => reg.payment_status?.status === 'approved'
  );

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Course Materials</h1>

      {approvedCourses?.length === 0 ? (
        <div className="card">
          <EmptyState
            message="No approved courses. Pay for courses to access materials."
            icon={Folder}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {approvedCourses?.map((reg) => (
            <CourseMaterialsCard key={reg.id} registration={reg} />
          ))}
        </div>
      )}
    </StudentLayout>
  );
}

function CourseMaterialsCard({ registration }) {
  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', registration.course_id],
    queryFn: () => materialService.getCourseMaterials(registration.course_id),
  });

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <Folder className="h-6 w-6 text-primary-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {registration.courses?.course_code}
          </h2>
          <p className="text-sm text-gray-600">{registration.courses?.title}</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : materials?.length === 0 ? (
        <p className="text-gray-500 text-sm">No materials uploaded yet</p>
      ) : (
        <div className="space-y-2">
          {materials?.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{material.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(material.uploaded_at)}
                  </p>
                </div>
              </div>
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
                download
              >
                <Download className="h-5 w-5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default MaterialsPage