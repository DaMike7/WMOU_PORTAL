import React, { useState } from 'react';
import { LogIn, User, Lock, BookOpen, FileText, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login({ reg_no: regNo, password });
      toast.success('Login successful!');
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] p-8 lg:p-12 flex flex-col justify-center items-center text-white">
          <div className="mb-6 lg:mb-8">
            <img src='/wmou.png' className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-lg mb-2"/>
          </div>
          
          <h1 className="text-2xl lg:text-3xl font-bold mb-3 text-center">WMOU PORTAL</h1>

          <div className="space-y-3 lg:space-y-4 w-full max-w-sm">
            <div className="flex items-start space-x-3">
              <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm lg:text-base">Course Registration</h3>
                <p className="text-xs lg:text-sm text-blue-100">Register for courses and access materials instantly</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 lg:h-6 lg:w-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm lg:text-base">View Results</h3>
                <p className="text-xs lg:text-sm text-blue-100">Check your grades and GPA anytime, anywhere</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 lg:h-6 lg:w-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm lg:text-base">Course Materials</h3>
                <p className="text-xs lg:text-sm text-blue-100">Download lecture notes and study materials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-[#1e3a5f] mb-2">SIGN IN</h2>
            <p className="text-sm lg:text-base text-gray-500">Sign in to access the portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full pl-9 lg:pl-10 pr-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  placeholder="Enter reg number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 lg:pl-10 pr-4 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-xs lg:text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-xs lg:text-sm text-[#1e3a5f] hover:underline">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] text-white py-2.5 lg:py-3 rounded-lg font-semibold text-sm lg:text-base hover:bg-[#2d5a8f] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-4 lg:mt-6 text-center">
            <p className="text-xs lg:text-sm text-gray-500">
              Don't have an account?{' '}
              <button type="button" className="text-[#1e3a5f] font-semibold hover:underline">
                Contact Admin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;