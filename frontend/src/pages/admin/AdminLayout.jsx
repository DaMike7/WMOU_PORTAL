import React, { useState } from 'react'; 
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  FileText,
  Megaphone,
  LogOut,
  Menu, 
  X,  
  ShieldUser,
  BookOpenText,
  UserStar,
} from 'lucide-react';

const WMOuBlue = 'bg-[#1e3a5f]'
const WMOuPortalName = 'WMOU Portal';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/administrators', icon: ShieldUser, label: 'Administrators' },
    { path: '/admin/students', icon: Users, label: 'Students' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/materials', icon: FileText, label: 'Materials' },
    { path: '/admin/results/student', icon: BookOpenText, label: 'Students Results' },
    { path: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    { path: '/admin/profile', icon: UserStar, label: 'Profile' },
  ];

  const SidebarContent = (
    <div className="p-4 pt-8 text-white space-y-8 h-full flex flex-col">
      {/* Logo and Name Section */}
      <div className="flex items-center space-x-3 mb-8">
        <img src='/wmou.png' className='w-10 h-10' alt="WMOu Logo" />
        <h1 className="text-xl font-bold">{WMOuPortalName}</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-grow">
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
              {/* The icon and label */}
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              
              {/* This is the subtle indicator line often seen in this type of design */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-current rounded-l-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleLogout}
          className={`flex items-center justify-center w-full space-x-2 px-4 py-3 rounded-xl transition-colors text-white border border-white/50 hover:bg-white/10`}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );


  return (
    // FIX 1: Ensure the outer container dictates the overall scroll if necessary
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Mobile Menu Button (Hamburger) */}
      <button
        className="fixed top-4 left-4 z-40 lg:hidden p-2 text-gray-700 bg-white rounded-full shadow-md"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar (Fixed) */}
      <div
        className={`w-64 h-screen ${WMOuBlue} shadow-xl fixed top-0 left-0 hidden lg:block z-30`}
      >
        {SidebarContent}
      </div>
      
      {/* Spacer for Fixed Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>

      {/* Mobile Sidebar (Fixed) */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
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

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-h-screen"> 
        
        {/* FIX 2: Navbar moved here, outside the children's scrolling area, and made full-width. */}
        <header className="hidden lg:block sticky top-0 z-20 bg-gray-50 pt-8 px-8 pb-4">
          <Navbar />
        </header>

        {/* The main scrollable content area */}
        <main className="flex-1 p-4 sm:p-8 pt-0 overflow-y-auto"> 
          <div className="block lg:hidden pt-8">
             <Navbar /> {/* Keep a version for smaller screens, if needed */}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;