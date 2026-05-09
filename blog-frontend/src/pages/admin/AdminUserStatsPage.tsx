import { useEffect } from 'react';
import { Users, FileText, MessageCircle, ThumbsUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchUserStatsThunk } from '../../features/admin/adminSlice';
import Spinner from '../../components/ui/Spinner';

export default function AdminUserStatsPage() {
  const dispatch = useAppDispatch();
  const { userStats, loading } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchUserStatsThunk());
  }, [dispatch]);

  if (loading && !userStats) return <Spinner />;

  const stats = userStats ? [
    { label: 'Total Users', value: userStats.totalUsers, icon: Users, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Total Posts', value: userStats.totalPosts, icon: FileText, color: 'text-blue-600 bg-blue-100' },
    { label: 'Total Comments', value: userStats.totalComments, icon: MessageCircle, color: 'text-purple-600 bg-purple-100' },
    { label: 'Total Reactions', value: userStats.totalReactions, icon: ThumbsUp, color: 'text-green-600 bg-green-100' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Statistics</h1>
        <p className="text-gray-500 text-sm mt-1">Platform user engagement overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{value?.toLocaleString() ?? 0}</p>
          </div>
        ))}
      </div>

      {userStats && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Engagement Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Posts / User</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.totalUsers > 0
                  ? (userStats.totalPosts / userStats.totalUsers).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Comments / Post</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.totalPosts > 0
                  ? (userStats.totalComments / userStats.totalPosts).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Reactions / Post</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.totalPosts > 0
                  ? (userStats.totalReactions / userStats.totalPosts).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
