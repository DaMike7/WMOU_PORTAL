import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from './StudentLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dashboardService } from '../../services/dashboardService';
import { announcementService } from '../../services/announcementService';
import { BookOpen, Clock, TrendingUp, Megaphone } from 'lucide-react';
import { getGradeColor, formatDateTime } from '../../utils/helpers';

const StudentDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: dashboardService.getStudentDashboard,
  });

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementService.getAnnouncements,
  });

  if (statsLoading) {
    return (
      <StudentLayout>
        <LoadingSpinner />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Registered Courses"
          value={stats?.registered_courses || 0}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pending_payments || 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Current GPA"
          value={stats?.gpa || '0.00'}
          icon={TrendingUp}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Results</h2>
          {stats?.recent_results?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_results.map((result) => (
                <div
                  key={result.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{result.courses?.course_code}</p>
                    <p className="text-sm text-gray-500">{result.courses?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </p>
                    <p className="text-sm text-gray-500">{result.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No results available yet</p>
          )}
        </div>

        {/* Announcements */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Announcements</h2>
          {announcements?.length > 0 ? (
            <div className="space-y-3">
              {announcements.slice(0, 5).map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded"
                >
                  <div className="flex items-start space-x-2">
                    <Megaphone className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {announcement.title}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {announcement.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDateTime(announcement.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No announcements</p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentDashboard;