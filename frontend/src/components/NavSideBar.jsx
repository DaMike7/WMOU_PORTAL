import React, { useState } from 'react';
import { 
  Home, 
  Building2, 
  Users, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Monitor, 
  MessageSquare,
  ChevronDown,
  Menu,
  X,
  User
} from 'lucide-react';

const NavSideBar = ({ 
  adminName = "Admin User", 
  adminRole = "Administrator",
  currentPage = "Dashboard" 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/dashboard' 
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users, 
      path: '/users' 
    },
    { 
      id: 'courses', 
      label: 'Courses', 
      icon: BookOpen, 
      path: '/courses' 
    },
    { 
      id: 'results', 
      label: 'Results', 
      icon: FileText, 
      path: '/admin/results' 
    },
    { 
      id: 'fees', 
      label: 'Payments', 
      icon: DollarSign, 
      path: '/admin/payments' 
    },
    { 
      id: 'materials', 
      label: 'Course Materials', 
      icon: Monitor, 
      path: '/admin/course_materials' 
    },
    { 
      id: 'announcements', 
      label: 'Announcements', 
      icon: MessageSquare, 
      path: '/announcements' 
    }
  ];

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Menu Toggle & Session Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <div className="hidden md:block">
              <h2 className="text-sm font-semibold text-gray-900">SECOND TERM</h2>
              <p className="text-xs text-gray-500">2022/2023 Session</p>
            </div>
          </div>

          {/* Right: Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{adminName}</p>
              <p className="text-xs text-gray-500">{adminRole}</p>
            </div>
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('profile')}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform hidden sm:block ${
                  activeDropdown === 'profile' ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown */}
              {activeDropdown === 'profile' && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    My Profile
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Settings
                  </a>
                  <hr className="my-1 border-gray-200" />
                  <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40
        ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* School Logo/Name */}
          <div className={`p-6 border-b border-gray-200 ${!isSidebarOpen && 'lg:p-4'}`}>
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'lg:justify-center'}`}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <img src="/wmou.png"/>
              </div>
              {(isSidebarOpen || isMobileMenuOpen) && (
                <div className="lg:hidden xl:block">
                  <h1 className="text-sm font-bold text-[#1e3a5f]">WMOU NNEWI</h1>
                  <p className="text-xs text-gray-500">Admin Portal</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.label;

                return (
                  <li key={item.id}>
                    <a
                      href={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-[#1e3a5f] text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${!isSidebarOpen && 'lg:justify-center lg:px-2'}
                      `}
                      title={!isSidebarOpen ? item.label : ''}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`} />
                      {(isSidebarOpen || isMobileMenuOpen) && (
                        <span className="text-sm font-medium lg:hidden xl:block">
                          {item.label}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Support Section */}
          <div className={`p-4 border-t border-gray-200 ${!isSidebarOpen && 'lg:p-2'}`}>
            <a
              href="/support"
              className={`
                flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all
                ${!isSidebarOpen && 'lg:justify-center lg:px-2'}
              `}
            >
              <MessageSquare className="w-5 h-5 text-gray-600 flex-shrink-0" />
              {(isSidebarOpen || isMobileMenuOpen) && (
                <span className="text-sm font-medium lg:hidden xl:block">Support</span>
              )}
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area (Example) */}
      <main className={`
        pt-16 transition-all duration-300
        ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}
      `}>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">
              Welcome to {currentPage}
            </h2>
            <p className="text-gray-600">
              This is your main content area. Import the NavSideBar component into any page.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NavSideBar;