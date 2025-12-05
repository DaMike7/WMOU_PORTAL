import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import CoursesPage from './pages/admin/CoursesPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import MaterialsPage from './pages/admin/MaterialsPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import ResultsPage from './pages/admin/AdminResultsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCoursesPage from './pages/student/CoursesPage';
import StudentPaymentsPage from './pages/student/PaymentsPage';
import StudentMaterialsPage from './pages/student/MaterialsPage';
import StudentResultsPage from './pages/student/ResultsPage';
import ProfilePage from './pages/student/PorfilePage';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Redirect based on role */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                user?.role === 'admin' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/student/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/administrators"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/materials"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MaterialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnnouncementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/materials"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentMaterialsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;