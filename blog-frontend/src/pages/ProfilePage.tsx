import { useState, useEffect } from 'react';
import { User, Mail, Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateMeThunk } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((s) => s.auth);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateMeThunk({ fullName, bio, profileImageUrl: user?.profileImageUrl || '' }));
    if (updateMeThunk.fulfilled.match(result)) {
      toast.success('Profile updated!');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
            {(user.fullName || user.email)[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.fullName || 'Your Profile'}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <div className="flex gap-2 mt-1">
              {user.roles?.map((role) => (
                <span key={role} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 transition">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-2.5 bg-gray-50">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="email"
                value={user.email}
                disabled
                className="flex-1 outline-none text-sm text-gray-400 bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
