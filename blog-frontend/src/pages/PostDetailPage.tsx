import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Eye, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchPostBySlugThunk } from '../features/posts/postsSlice';
import { fetchPostReactionThunk } from '../features/reactions/reactionsSlice';
import ReactionBar from '../components/post/ReactionBar';
import CommentSection from '../components/comment/CommentSection';
import Spinner from '../components/ui/Spinner';
import { readingTime } from '../utils/helpers';

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { current: post, loading } = useAppSelector((s) => s.posts);

  useEffect(() => {
    if (slug) {
      dispatch(fetchPostBySlugThunk(slug));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (post?.postId) {
      dispatch(fetchPostReactionThunk(post.postId));
    }
  }, [dispatch, post?.postId]);

  if (loading) return <Spinner />;
  if (!post) return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-xl font-medium">Post not found</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-10">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          {/* Cover */}
          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full max-h-96 object-cover rounded-2xl mb-8"
            />
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <a
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  <Tag className="w-3 h-3" /> {tag}
                </a>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {post.createdByName?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="font-medium text-gray-700">{post.createdByName}</span>
            </div>
            <span>{format(new Date(post.createdAt), 'MMMM d, yyyy')}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {readingTime(post.content)} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {post.viewCount} views
            </span>
          </div>

          {/* Content */}
          <div
            className="prose prose-indigo max-w-none mb-12 text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Reaction bar */}
          <ReactionBar
            postId={post.postId}
            initialLikes={post.likeCount}
            initialDislikes={post.dislikeCount}
          />

          {/* Comments */}
          <CommentSection postId={post.postId} />
        </article>

        {/* Sidebar */}
        <aside className="hidden xl:block w-72 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-3">About the author</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {post.createdByName?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{post.createdByName}</p>
                  <p className="text-xs text-gray-400">Blog Author</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
