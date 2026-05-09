import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
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
          <p className="text-gray-500">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Check your inbox</h3>
              <p className="text-sm text-gray-500 mb-6">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link to="/login" className="text-indigo-600 font-medium hover:underline text-sm">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 transition">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 outline-none text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
