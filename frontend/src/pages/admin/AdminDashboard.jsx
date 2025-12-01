import React from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dashboardService } from '../../services/dashboardService';
import { Users, BookOpen, DollarSign, Clock, CreditCard, Bell, GraduationCap, TrendingUp, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import CountUp from 'react-countup';
import { authService } from '../../services/authService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Configuration ---
// Primary Blue Accent Color
const PRIMARY_BLUE = '#1e3a5f'; 
const CHART_COLORS = [
  '#1e3a5f',
  '#4ade80',
  '#a855f7',
  '#facc15',
  '#fb7185', 
];

// --- Custom ModernStatCard Component ---
// Emulating the distinct colored card design from the uploaded images.
const ModernStatCard = ({ title, value, icon: Icon, iconBgColor, textColor }) => {
  const isCurrency = typeof value === 'string' && value.startsWith('₦');
  const numericValue = isCurrency ? parseFloat(value.replace('₦', '').replace(/,/g, '')) : value;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transition duration-300 hover:shadow-xl flex items-center justify-between">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <div className={`text-3xl font-extrabold ${textColor}`}>
          {isCurrency ? (
            <CountUp 
              start={0} 
              end={numericValue} 
              duration={2.5} 
              separator="," 
              decimals={2}
              prefix="₦"
            />
          ) : (
            <CountUp 
              start={0} 
              end={numericValue} 
              duration={2.5} 
              separator="," 
            />
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${iconBgColor}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};


// --- Chart Components Implementation ---

const RevenueBarChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Revenue (NGN)',
        data: data.map(item => item.amount),
        backgroundColor: PRIMARY_BLUE,
        borderRadius: 4,
        maxBarThickness: 30,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        callbacks: { 
          label: (context) => formatCurrency(context.parsed.y) 
        } 
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [2], color: '#e5e7eb' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl h-full transition duration-300 hover:shadow-2xl">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
        Monthly Revenue Dynamics
      </h3>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

const StatusDoughnutChart = ({ data, title }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: CHART_COLORS,
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, padding: 20 } },
      tooltip: { 
        callbacks: { 
          label: (context) => `${context.label}: ${context.raw}` 
        } 
      },
      title: { display: true, text: title, font: { size: 16, weight: 'bold' } }
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl h-full transition duration-300 hover:shadow-2xl flex flex-col justify-between">
      <div className="h-64 flex justify-center items-center">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};


const AdminDashboard = () =>{
  const adminUser = authService.getCurrentUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: dashboardService.getAdminDashboard,
  });

  const metrics = {
    student: data?.student_metrics || {},
    course: data?.course_metrics || {},
    financial: data?.financial_metrics || {},
    activity: data?.activity || {},
  };

  const pendingCount = metrics.financial.pending_count || 0;
  const adminName = adminUser?.full_name?.split(' ')[0] || 'Admin';


  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-red-600 p-4 bg-red-100 rounded-lg">Error loading dashboard: {error.message}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Dashboard</h1>

      {/* 1. Greeting Card - Blue BG */}
      <div className="relative bg-[#1e3a5f] text-white p-8 rounded-2xl shadow-xl mb-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-20 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome Back, {adminName}!</h2>
          <p className="text-lg font-light">
            You currently have <span className="font-extrabold text-yellow-300">
              <CountUp start={0} end={pendingCount} duration={2.5} />
            </span> unreviewed {pendingCount === 1 ? 'payment' : 'payments'} waiting for your approval.
          </p>
          <button className="mt-4 flex items-center text-sm font-semibold bg-white text-blue-600 py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition duration-150">
             Review Payments Now 
             <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid - Emulating the Sleek Card Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <ModernStatCard
          title="Active Students"
          value={metrics.student.total_active || 0}
          icon={Users}
          iconBgColor="bg-purple-500" // Purple accent
          textColor="text-purple-600"
        />
        <ModernStatCard
          title="Total Courses"
          value={metrics.course.total_courses || 0}
          icon={BookOpen}
          iconBgColor="bg-blue-500" // Blue accent
          textColor="text-blue-600"
        />
        <ModernStatCard
          title="Total Revenue"
          value={formatCurrency(metrics.financial.total_revenue || 0)}
          icon={DollarSign}
          iconBgColor="bg-red-500" // Red accent
          textColor="text-red-600"
        />
        <ModernStatCard
          title="Pending Payments"
          value={metrics.financial.pending_count || 0}
          icon={CreditCard}
          iconBgColor="bg-amber-500" // Amber/Yellow accent
          textColor="text-amber-600"
        />
      </div>

      {/* Charts and Breakdowns (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Student Status & Department Chart */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
             <StatusDoughnutChart 
                title="Student Enrollment Status" 
                data={metrics.activity.status_distribution} 
            />
            {/* Using Bar Chart Style for Department Breakdown */}
             <RevenueBarChart 
                data={metrics.student.by_department.map(d => ({ name: d.name, amount: d.value }))}
             />
        </div>

        {/* Most Enrolled Course Card */}
        <div className="bg-[#1e3a5f] text-white p-6 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center">
            <GraduationCap className="w-10 h-10 mb-3 text-white opacity-80" />
            <h3 className="text-lg font-medium opacity-80 mb-1">Most Enrolled Course</h3>
            <p className="text-2xl font-extrabold">{metrics.course.most_enrolled?.title || 'N/A'}</p>
            <p className="text-sm font-light mt-1">Enrolled: {metrics.course.most_enrolled?.count || 0} Students</p>
        </div>
      </div>

      {/* Financial Trend and Activity Lists (Row 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2">
          <RevenueBarChart 
            data={metrics.financial.revenue_trend.map(t => ({ name: t.name, amount: t.amount }))}
            title="Monthly Revenue Dynamics"
          />
        </div>

        {/* Latest Announcements List */}
        <div className="bg-white p-6 rounded-2xl shadow-xl lg:col-span-1 transition duration-300 hover:shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4 border-b pb-2">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Latest System Announcements
          </h2>
          <ul className="divide-y divide-gray-200">
            {metrics.activity.latest_announcements?.length > 0 ? (
              metrics.activity.latest_announcements.map((ann) => (
                <li key={ann.id} className="py-3 hover:bg-blue-50/30 rounded-md px-1 transition duration-150">
                  <p className="font-medium text-gray-900 truncate">{ann.title}</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {formatDateTime(ann.created_at)}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500 p-2">No recent announcements.</p>
            )}
          </ul>
        </div>
      </div>
      
      {/* Latest Pending Payments List (Full Width) */}
      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 transition duration-300 hover:shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
          <Clock className="w-5 h-5 mr-2 text-yellow-600" />
          Latest Pending Payments (Requires Review)
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider rounded-tl-lg">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Reg No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Date Submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {metrics.activity.latest_pending_payments?.length > 0 ? (
                metrics.activity.latest_pending_payments.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {p.users?.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-600">
                      {p.users?.reg_no}
                    </td>
                    <td className="px-6 py-4">
                      {p.courses?.course_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-purple-600">
                      {formatCurrency(p.amount_paid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(p.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-lg">
                    All payments are up-to-date! No pending reviews.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;