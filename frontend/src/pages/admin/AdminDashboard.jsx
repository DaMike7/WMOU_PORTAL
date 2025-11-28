import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dashboardService } from '../../services/dashboardService';
import { Users, BookOpen, DollarSign, Clock } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const AdminDashboard = () =>{
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: dashboardService.getAdminDashboard,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={data?.total_students || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Courses"
          value={data?.total_courses || 0}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data?.total_revenue || 0)}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Pending Payments"
          value={data?.pending_payments || 0}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Course Registrations
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reg No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.recent_registrations?.map((reg) => (
                <tr key={reg.id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reg.users?.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reg.users?.reg_no}
                  </td>
                  <td className="px-6 py-4">
                    {reg.courses?.course_code} - {reg.courses?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {formatDateTime(reg.registered_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard