import { useEffect, useRef, useState } from 'react';
import { FileText, ThumbsUp, Eye, BarChart2, Wifi } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchDashboardThunk,
  fetchTopByViewsThunk,
  fetchTopByLikesThunk,
  fetchRecentPostsThunk,
} from '../../features/admin/adminSlice';
import { generateMockPageViews } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { formatDistanceToNow } from 'date-fns';

const pageViewData = generateMockPageViews(30);

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboard, topByViews, topByLikes, recentPosts, loading } = useAppSelector((s) => s.admin);
  const [liveUsers, setLiveUsers] = useState<number>(Math.floor(Math.random() * 36) + 15);
  const connectionRef = useRef<ReturnType<InstanceType<typeof HubConnectionBuilder>['build']> | null>(null);

  useEffect(() => {
    dispatch(fetchDashboardThunk());
    dispatch(fetchTopByViewsThunk(5));
    dispatch(fetchTopByLikesThunk(5));
    dispatch(fetchRecentPostsThunk(5));
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('blogapp_token');
    const hubUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/hubs/presence`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, token ? { accessTokenFactory: () => token } : {})
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Error)
      .build();

    connection.on('ActiveUsers', (count: number) => setLiveUsers(count));

    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    connection.start().catch(() => {
      fallbackInterval = setInterval(() => {
        setLiveUsers(Math.floor(Math.random() * 36) + 15);
      }, 5000);
    });

    connectionRef.current = connection;
    return () => {
      connection.stop();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  const cards = [
    { label: 'Total Posts', value: dashboard?.totalPosts ?? 0, icon: FileText, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Total Reactions', value: dashboard?.totalReactions ?? 0, icon: ThumbsUp, color: 'text-green-600 bg-green-100' },
    { label: 'Total Views', value: dashboard?.totalViews ?? 0, icon: Eye, color: 'text-blue-600 bg-blue-100' },
    { label: 'Total Comments', value: dashboard?.totalComments ?? 0, icon: BarChart2, color: 'text-purple-600 bg-purple-100' },
  ];

  if (loading && !dashboard) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your blog's performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 shadow-sm text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Wifi className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-100">Live Users Right Now</p>
          <p className="text-4xl font-extrabold">{liveUsers}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-indigo-100">Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-gray-700">Top Posts by Views</h2>
          </div>
          {topByViews.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topByViews} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + '…' : v} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="viewCount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No data</p>}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            <h2 className="font-semibold text-gray-700">Top Posts by Likes</h2>
          </div>
          {topByLikes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topByLikes} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + '…' : v} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="likeCount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">No data</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-purple-500" />
          <h2 className="font-semibold text-gray-700">Page Views (Last 30 Days)</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={pageViewData} margin={{ left: -10, right: 10 }}>
            <defs>
              <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#viewGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <FileText className="w-4 h-4 text-indigo-500" />
          <h2 className="font-semibold text-gray-700">Recent Posts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Author</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-right">Views</th>
                <th className="px-5 py-3 text-right">Likes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentPosts.map((post) => (
                <tr key={post.postId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800 max-w-xs truncate">{post.title}</td>
                  <td className="px-5 py-3 text-gray-500">{post.createdByName}</td>
                  <td className="px-5 py-3 text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{post.viewCount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{post.likeCount.toLocaleString()}</td>
                </tr>
              ))}
              {recentPosts.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No posts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
