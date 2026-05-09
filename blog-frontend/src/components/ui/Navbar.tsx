import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, BookOpen, ChevronDown, User, Settings, LogOut, Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../features/auth/authSlice';
import { getInitials } from '../../utils/helpers';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((s) => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAdmin = user?.roles?.includes('Admin');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            BlogApp
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
              About
            </Link>
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {token && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      getInitials(user.fullName || user.email)
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.fullName || user.email}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Shield className="w-4 h-4" /> Admin
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link to="/" className="block text-gray-700 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/about" className="block text-gray-700 hover:text-indigo-600" onClick={() => setMobileOpen(false)}>About</Link>
          {token ? (
            <>
              <Link to="/profile" className="block text-gray-700" onClick={() => setMobileOpen(false)}>Profile</Link>
              {isAdmin && <Link to="/admin" className="block text-gray-700" onClick={() => setMobileOpen(false)}>Admin</Link>}
              <button onClick={handleLogout} className="block text-red-600 w-full text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-700" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" className="block text-indigo-600 font-medium" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
