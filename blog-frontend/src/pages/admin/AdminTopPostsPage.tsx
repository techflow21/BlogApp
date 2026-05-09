import { useEffect, useState } from 'react';
import { Eye, ThumbsUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTopByViewsThunk, fetchTopByLikesThunk } from '../../features/admin/adminSlice';
import Spinner from '../../components/ui/Spinner';

type Tab = 'views' | 'likes';

export default function AdminTopPostsPage() {
  const dispatch = useAppDispatch();
  const { topByViews, topByLikes, loading } = useAppSelector((s) => s.admin);
  const [tab, setTab] = useState<Tab>('views');

  useEffect(() => {
    dispatch(fetchTopByViewsThunk(10));
    dispatch(fetchTopByLikesThunk(10));
  }, [dispatch]);

  const data = tab === 'views' ? topByViews : topByLikes;
  const metric = tab === 'views' ? 'viewCount' : 'likeCount';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Top Posts</h1>
        <p className="text-gray-500 text-sm mt-1">Best performing content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([['views', Eye, 'By Views'], ['likes', ThumbsUp, 'By Likes']] as const).map(([key, Icon, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left w-12">#</th>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Author</th>
                <th className="px-5 py-3 text-right">{tab === 'views' ? 'Views' : 'Likes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((post, i) => (
                <tr key={post.postId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-2xl font-bold text-gray-200 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-5 py-3">
                    <a
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="font-medium text-gray-800 hover:text-indigo-600 transition-colors"
                      rel="noreferrer"
                    >
                      {post.title}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{post.authorName}</td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-800">
                    {(post[metric as keyof typeof post] as number)?.toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
