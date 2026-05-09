import { useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchEngagementStatsThunk } from '../../features/admin/adminSlice';
import Spinner from '../../components/ui/Spinner';

export default function AdminEngagementPage() {
  const dispatch = useAppDispatch();
  const { engagementStats, loading } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchEngagementStatsThunk());
  }, [dispatch]);

  if (loading && !engagementStats) return <Spinner />;

  const chartData = (engagementStats ?? []).map((item) => ({
    period: item.period,
    posts: item.postCount,
    comments: item.commentCount,
    likes: item.likeCount,
    views: item.viewCount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Engagement Stats</h1>
        <p className="text-gray-500 text-sm mt-1">Content engagement over time</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h2 className="font-semibold text-gray-700">Views Over Time</h2>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#viewsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">No engagement data available</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-4">Posts, Comments & Likes</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="posts" fill="#6366f1" radius={[4, 4, 0, 0]} name="Posts" />
              <Bar dataKey="comments" fill="#a855f7" radius={[4, 4, 0, 0]} name="Comments" />
              <Bar dataKey="likes" fill="#10b981" radius={[4, 4, 0, 0]} name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">No data available</p>
        )}
      </div>
    </div>
  );
}
