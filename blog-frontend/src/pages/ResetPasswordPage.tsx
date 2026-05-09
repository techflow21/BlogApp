import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-2xl font-extrabold text-gray-900 mb-2">
            <BookOpen className="w-7 h-7 text-indigo-600" /> BlogApp
          </div>
          <p className="text-gray-500">Set a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 transition">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 outline-none text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 transition">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 outline-none text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-indigo-600 hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
