import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StudentLayout from './StudentLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dashboardService } from '../../services/dashboardService';
import { announcementService } from '../../services/announcementService';
import { BookOpen, Clock, TrendingUp, Megaphone, CheckCircle, Wallet } from 'lucide-react';
import { getGradeColor, formatDateTime } from '../../utils/helpers';

// --- REDESIGNED STAT CARD ---
// Uses distinct professional gradients and glass-morphism effects for a unique, premium look
const StatCard = ({ title, value, icon: Icon, color }) => {
  // Professional gradient palettes
  const styles = {
    blue: "from-blue-600 to-indigo-700 shadow-blue-900/20",
    yellow: "from-amber-500 to-orange-600 shadow-orange-900/20",
    green: "from-emerald-500 to-teal-600 shadow-emerald-900/20",
    indigo: "from-violet-600 to-purple-700 shadow-purple-900/20",
  };

  const gradient = styles[color] || styles.blue;

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 
      bg-gradient-to-br ${gradient} 
      text-white shadow-xl transition-all duration-300 
      hover:-translate-y-1 hover:shadow-2xl group
    `}>
      {/* Decorative large icon background */}
      <div className="absolute -right-6 -top-6 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
        <Icon size={120} />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Icon & Title Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-inner border border-white/10">
            <Icon size={24} className="text-white" strokeWidth={2.5} />
          </div>
          {/* Optional: Add a small indicator or sparkline here if needed */}
        </div>

        {/* Value & Label */}
        <div>
          <h3 className="text-4xl font-black tracking-tight mb-1 text-white shadow-sm">
            {value}
          </h3>
          <p className="text-sm font-medium text-blue-50/90 uppercase tracking-wider">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MODERN CONTENT CARD ---
const DashboardCard = ({ title, children, className = '' }) => (
  <div className={`
    bg-white rounded-2xl shadow-lg border border-gray-100 
    overflow-hidden flex flex-col ${className}
  `}>
    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
      <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
        {title}
      </h2>
      {/* Three dots menu decoration */}
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
      </div>
    </div>
    <div className="p-6 flex-1">
      {children}
    </div>
  </div>
);


const StudentDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: dashboardService.getStudentDashboard,
  });

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(1, 10),
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
      <div className="min-h-screen bg-gray-50/50 p-0 sm:p-2 space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Overview
          </h1>
          <p className="text-gray-500 mt-1">Welcome back to your student portal.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Registered Courses"
            value={stats?.registered_courses || 0}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            title="Pending Payments"
            value={stats?.pending_payments || 0}
            icon={Wallet}
            color="yellow"
          />
          <StatCard
            title="Current GPA"
            value={stats?.gpa || '0.00'}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Announcements"
            value={announcementsData?.data?.length || 0}
            icon={Megaphone}
            color="indigo"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Results (Wider Column) */}
          <DashboardCard title="Recent Results" className="lg:col-span-2 min-h-[400px]">
            {stats?.recent_results?.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_results.map((result) => (
                  <div
                    key={result.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                        {result.courses?.course_code?.substring(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                          {result.courses?.title}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          {result.courses?.course_code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="block text-xs text-gray-400 font-semibold uppercase">Score</span>
                        <span className="font-bold text-gray-700">{result.score}%</span>
                      </div>
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm
                        ${getGradeColor(result.grade).replace('text-', 'bg-').replace('-600', '-500 text-white')}
                        ${result.grade === 'F' ? 'bg-red-500 text-white' : ''}
                      `}>
                        {result.grade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-100 rounded-xl">
                <BookOpen className="h-10 w-10 mb-3 opacity-20" />
                <p>No results published yet.</p>
              </div>
            )}
          </DashboardCard>

          {/* Announcements (Narrower Column) */}
          <DashboardCard title="Latest Updates" className="lg:col-span-1 h-full">
            {announcementsData?.data?.length > 0 ? (
              <div className="space-y-6">
                {announcementsData.data.slice(0, 5).map((announcement, idx) => (
                  <div key={announcement.id} className="relative pl-6 border-l-2 border-gray-100 last:border-0">
                    {/* Timeline dot */}
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                    
                    <h4 className="text-md font-bold text-gray-900 leading-snug hover:text-indigo-600 transition-colors cursor-pointer">
                      {announcement.title}
                    </h4>
                    <p className="font-medium text-gray-500 mt-1 mb-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      <Clock size={10} />
                      {formatDateTime(announcement.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                <Megaphone className="h-10 w-10 mb-3 opacity-20" />
                <p>No new announcements.</p>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentDashboard;