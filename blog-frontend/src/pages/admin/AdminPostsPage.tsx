import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPostsThunk, deletePostThunk } from '../../features/posts/postsSlice';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, ExternalLink } from 'lucide-react';
import { statusLabel, statusColor } from '../../utils/helpers';
import Spinner from '../../components/ui/Spinner';
import { Link } from 'react-router-dom';

export default function AdminPostsPage() {
  const dispatch = useAppDispatch();
  const { items: posts, loading, totalCount: total } = useAppSelector((s) => s.posts);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    dispatch(fetchPostsThunk({ page, pageSize }));
  }, [dispatch, page]);

  const handleDelete = (postId: string) => {
    if (confirm('Delete this post? This cannot be undone.')) {
      dispatch(deletePostThunk(postId));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <p className="text-gray-500 text-sm mt-1">{total} posts total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Author</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Views</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.postId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 max-w-xs">
                      <p className="font-medium text-gray-800 truncate">{post.title}</p>
                      <p className="text-gray-400 text-xs truncate">{post.summary}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{post.createdByName}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(post.status)}`}>
                        {statusLabel(post.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">{post.viewCount.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/posts/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.postId)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400">No posts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
