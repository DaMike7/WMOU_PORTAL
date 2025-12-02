import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Turnstile from "react-turnstile";
import {WHATSAPP_LINK} from '../utils/constants.js'

const Login = () => {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!regNo.trim()) {
      newErrors.regNo = 'Registration number is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const data = await login({ reg_no: regNo, password });
      toast.success('Login successful!');
      
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
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2f1] to-[#b2dfdb] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Sign in
          </h2>
          <p className="text-gray-600 mb-8">Use your Registration number and password</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => {
                    setRegNo(e.target.value);
                    setErrors({ ...errors, regNo: '' });
                  }}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] transition-all ${
                    errors.regNo ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Registration Number"
                />
              </div>
              {errors.regNo && (
                <p className="text-red-500 text-sm mt-1 ml-1">{errors.regNo}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] transition-all ${
                    errors.password ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="Password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 ml-1">{errors.password}</p>
              )}
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-[#1e3a5f] transition-colors"
              >
                don't have an account yet? <span><a href={WHATSAPP_LINK} target='_blank' rel="noopener noreferrer" className='underline font-semibold'>contact admin</a></span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a5f] text-white py-3.5 rounded-xl font-semibold text-base hover:bg-[#2d5a8f] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner className='animate-spin' size="sm" />
                  <span className="ml-2">Sign in...</span>
                </span>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>
        </div>

        {/* Right Side - Welcome */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] p-12 flex-col items-center justify-center text-white relative overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full"></div>
          
          <div className="relative z-10 text-center">
            <div className="mb-6">
              <img 
                src='/wmou.png' 
                className="w-24 h-24 mx-auto bg-white rounded-2xl shadow-lg p-2" 
                alt="WMOU Logo"
              />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">WMOU PORTAL</h1>
            
            <h2 className="text-3xl font-bold mb-4">Welcome !</h2>
            <p className="text-blue-100 mb-8 max-w-xs mx-auto">
              Enter your personal details to use all the site's features
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login