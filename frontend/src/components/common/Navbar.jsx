import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Bell } from 'lucide-react';

const WMOuBlue = '#1e3a5f';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // CHANGE 1: Removed rounded-xl and mb-6 for a cleaner, flush top bar look
    <nav className="bg-white sticky top-0 z-30 shadow-md px-4 py-3 border-b border-gray-100 mb-6 -mx-4 sm:-mx-8">
      <div className="flex justify-between items-center h-full max-w-full mx-auto sm:px-4">
        
        {/* Left Section: Logo/Title (Hidden on desktop in admin/student layout, but included for general use) */}
        <div className="flex items-center lg:hidden">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-extrabold" style={{ color: WMOuBlue }}>
              School Portal
            </h1>
          </Link>
        </div>

        {/* Right Section: Actions and User Info */}
        <div className="flex items-center space-x-3 sm:space-x-5 ml-auto">
          
          {/* Notification Button */}
          <button 
            className="p-2 rounded-full transition-colors hover:bg-gray-100 relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* User Info (Visible on larger screens) */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                {user?.full_name || 'Guest User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'Admin'}
              </p>
            </div>
            
            {/* Profile Avatar */}
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {user?.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" style={{ color: WMOuBlue }} />
              )}
            </div>
          </div>
          
          {/* Mobile Profile Icon (Visible on small screens) */}
          <div className="sm:hidden h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {user?.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" style={{ color: WMOuBlue }} />
              )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-full transition-colors hover:bg-gray-100"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar