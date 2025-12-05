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

const WMOuBlue = 'bg-[#1e3a5f]'
const WMOuPortalName = 'WMOU Portal';

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
    // FIX: Removed overflow-x-hidden from here, let the parent handle it
    <div className="p-4 pt-8 text-white space-y-8 h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-8">
        <img src='/wmou.png' className='w-10 h-10' alt="WMOu Logo" />
        <h1 className="text-xl font-bold">{WMOuPortalName}</h1>
      </div>

      {/* FIX: Set navigation area to scroll vertically if content is too long */}
      <nav className="space-y-2 flex-grow overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Improved active check logic to prevent 'results' matching 'courses' if routes were /courses/123/results
          const isActive = 
            location.pathname === item.path || 
            (location.pathname.startsWith(item.path) && location.pathname.charAt(item.path.length) === '/');

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
    // Top-level container ensures the whole app doesn't overflow horizontally
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-40 lg:hidden p-2 text-gray-700 bg-white rounded-full shadow-md"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop FIXED Sidebar */}
      <div
        className={`w-64 h-screen ${WMOuBlue} shadow-xl fixed top-0 left-0 hidden lg:block z-30 overflow-y-auto`}
      >
        {SidebarContent}
      </div>
      
      {/* Spacer div to keep content from sliding under the sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* MOBILE Sidebar - Ensure full height and internal scrolling */}
          <div
            className={`fixed top-0 left-0 w-64 h-screen ${WMOuBlue} z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto`}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        <header className="hidden lg:block sticky top-0 bg-gray-50 z-20 pt-8 px-8 pb-4">
          <Navbar />
        </header>

        {/* Main Content Area - Allows vertical scrolling of content */}
        <main className="flex-1 p-4 sm:p-8 pt-0 overflow-y-auto overflow-x-hidden">
          <div className="block lg:hidden pt-8">
             <Navbar />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;