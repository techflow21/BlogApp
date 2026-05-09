import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  BookOpen, LayoutDashboard, FileText, TrendingUp,
  Users, BarChart2, Settings, ChevronLeft, ChevronRight,
  LogOut, Menu
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../features/auth/authSlice';
import { format } from 'date-fns';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/posts', label: 'Posts', icon: FileText },
  { to: '/admin/top-posts', label: 'Top Posts', icon: TrendingUp },
  { to: '/admin/user-stats', label: 'User Stats', icon: Users },
  { to: '/admin/engagement', label: 'Engagement', icon: BarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (item: { to: string; exact?: boolean }) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const breadcrumb = navItems.find((n) => isActive(n))?.label || 'Admin';

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        } shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
          {!collapsed && (
            <Link to="/admin" className="flex items-center gap-2 font-bold text-lg text-indigo-400">
              <BookOpen className="w-5 h-5" />
              BlogApp
            </Link>
          )}
          {collapsed && <BookOpen className="w-5 h-5 text-indigo-400 mx-auto" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-gray-800 transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-800 px-2 py-3">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Menu className="w-5 h-5 text-gray-500 md:hidden" />
            <nav className="text-sm text-gray-500">
              <span className="text-gray-400">Admin</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-gray-700">{breadcrumb}</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 tabular-nums">
              {format(now, 'PPp')}
            </span>
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user.fullName || user.email)[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user.fullName || user.email}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
