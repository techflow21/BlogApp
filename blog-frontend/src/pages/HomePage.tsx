import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchPostsThunk } from '../features/posts/postsSlice';
import PostCard from '../components/post/PostCard';
import Spinner from '../components/ui/Spinner';

const TAGS = ['technology', 'programming', 'design', 'career', 'tutorial', 'open-source', 'javascript', 'dotnet'];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { items: posts, loading, totalCount: total } = useAppSelector((s) => s.posts);
  const [searchParams, setSearchParams] = useSearchParams();

  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const load = useCallback(() => {
    dispatch(fetchPostsThunk({ page, pageSize: 9, tag: tag || undefined }));
  }, [dispatch, page, tag, search]);

  useEffect(() => { load(); }, [load]);

  const setTag = (t: string) => {
    setSearchParams(t ? { tag: t } : {});
  };

  const totalPages = Math.ceil(total / 9);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-8">
        {/* Left: Tag Cloud */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24">
            <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
              <Tag className="w-4 h-4 text-indigo-500" /> Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTag('')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !tag ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'
                }`}
              >
                All
              </button>
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    tag === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Posts feed */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {tag ? `#${tag}` : search ? `"${search}"` : 'Latest Posts'}
            </h1>
            <span className="text-sm text-gray-400">{total} posts</span>
          </div>

          {loading ? (
            <Spinner />
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No posts found</p>
              <p className="text-sm mt-1">Try a different topic or search term</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.postId} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button
                    disabled={page <= 1}
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(p) })}
                        className={`px-4 py-2 rounded-lg text-sm border ${
                          p === page ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Right: Trending */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-24">
            <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
              <TrendingUp className="w-4 h-4 text-purple-500" /> Trending
            </h3>
            {posts.slice(0, 5).map((post, i) => (
              <a
                key={post.postId}
                href={`/posts/${post.slug}`}
                className="flex gap-2 mb-4 group"
              >
                <span className="text-2xl font-bold text-gray-200 leading-tight">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 line-clamp-2 leading-snug">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.viewCount} views</p>
                </div>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
