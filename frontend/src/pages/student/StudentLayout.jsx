import React, { useState } from 'react'; 
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  FileText,
  Award,
  User,
  LogOut,
  Menu, 
  X,  
} from 'lucide-react';


// Use your provided blue color
const WMOuBlue = 'bg-[#1e3a5f]'
const WMOuPortalName = 'WMOU Portal'; // Defined name

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const location = useLocation();

  const menuItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/courses', icon: BookOpen, label: 'Courses' },
    { path: '/student/payments', icon: CreditCard, label: 'Payments' },
    { path: '/student/materials', icon: FileText, label: 'Materials' },
    { path: '/student/results', icon: Award, label: 'Results' },
    { path: '/student/profile', icon: User, label: 'Profile' },
  ];

  const SidebarContent = (
    <div className="p-4 pt-8 text-white space-y-8 h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-8">
        <img src='/wmou.png' className='w-10 h-10' alt="WMOu Logo" />
        <h1 className="text-xl font-bold">{WMOuPortalName}</h1>
      </div>

      <nav className="space-y-2 flex-grow overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)} 
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium relative
                ${isActive
                  ? 'bg-white text-gray-800 shadow-md' 
                  : 'text-white hover:bg-white/20' 
                }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>

              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-current rounded-l-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <button
          onClick={handleLogout}
          className={`flex items-center justify-center w-full space-x-2 px-4 py-3 rounded-xl transition-colors text-white border border-white/50 hover:bg-white/10`}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <button
        className="fixed top-4 left-4 z-40 lg:hidden p-2 text-gray-700 bg-white rounded-full shadow-md"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar - Fixed and Sticky */}
      <div
        className={`w-64 h-screen ${WMOuBlue} shadow-xl fixed top-0 left-0 hidden lg:block`}
      >
        {SidebarContent}
      </div>

      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-opacity-30 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <div
            className={`fixed top-0 left-0 w-64 h-full ${WMOuBlue} z-50 transform transition-transform duration-300 ease-in-out lg:hidden`}
          >
            <button
              className="absolute top-4 right-4 text-white p-1 z-50"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            {SidebarContent}
          </div>
        </>
      )}

      {/* Main Content - Add left margin to account for fixed sidebar */}
      <div className="flex-1 p-4 sm:p-8 overflow-y-auto pt-16 lg:pt-0 lg:ml-64">
        <div className="hidden lg:block">
          <Navbar />
        </div>
        {children}
      </div>
    </div>
  );
};

export default StudentLayout;