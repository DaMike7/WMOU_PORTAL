import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                School Portal
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                {user?.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5 text-primary-600" />
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar