import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Megaphone,
} from 'lucide-react';

const AdminLayout = ({ children }) =>{
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/materials', icon: FileText, label: 'Materials' },
    { path: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  );
}

export default AdminLayout