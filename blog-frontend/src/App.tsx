import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch } from './hooks/redux';
import { fetchMeThunk } from './features/auth/authSlice';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ui/ProtectedRoute';

import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminTopPostsPage from './pages/admin/AdminTopPostsPage';
import AdminUserStatsPage from './pages/admin/AdminUserStatsPage';
import AdminEngagementPage from './pages/admin/AdminEngagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('blogapp_token');
    if (token) dispatch(fetchMeThunk());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected public routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute requireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/posts" element={<AdminPostsPage />} />
          <Route path="/admin/top-posts" element={<AdminTopPostsPage />} />
          <Route path="/admin/user-stats" element={<AdminUserStatsPage />} />
          <Route path="/admin/engagement" element={<AdminEngagementPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
