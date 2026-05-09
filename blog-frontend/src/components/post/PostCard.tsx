import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, MessageCircle, Eye, Share2, Clock } from 'lucide-react';
import type { PostResponse } from '../../types';
import { readingTime } from '../../utils/helpers';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { reactToPostThunk } from '../../features/reactions/reactionsSlice';
import { ReactionType } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  post: PostResponse;
}

export default function PostCard({ post }: Props) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const reaction = useAppSelector((s) => s.reactions.posts[post.postId]);

  const likeCount = reaction?.likeCount ?? post.likeCount;
  const dislikeCount = reaction?.dislikeCount ?? post.dislikeCount;

  const handleReact = (type: ReactionType) => {
    if (!token) {
      toast.error('Please login to react');
      return;
    }
    dispatch(reactToPostThunk({ postId: post.postId, type }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/posts/${post.slug}`);
    toast.success('Link copied to clipboard!');
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {post.coverImageUrl && (
        <Link to={`/posts/${post.slug}`}>
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-48 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </Link>
      )}
      <div className="p-5">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link to={`/posts/${post.slug}`}>
          <h2 className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
            {post.title}
          </h2>
        </Link>

        {/* Summary */}
        <p className="text-gray-500 text-sm line-clamp-3 mb-4">{post.summary}</p>

        {/* Author + meta */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {post.createdByName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{post.createdByName || 'Anonymous'}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span>·</span>
              <Clock className="w-3 h-3" />
              <span>{readingTime(post.content)} min read</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleReact(ReactionType.Like)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              reaction?.currentReaction === ReactionType.Like
                ? 'bg-indigo-100 text-indigo-600'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ThumbsUp className="w-4 h-4" /> {likeCount}
          </button>
          <button
            onClick={() => handleReact(ReactionType.Dislike)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              reaction?.currentReaction === ReactionType.Dislike
                ? 'bg-red-100 text-red-500'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ThumbsDown className="w-4 h-4" /> {dislikeCount}
          </button>
          <Link
            to={`/posts/${post.slug}#comments`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> {post.commentCount}
          </Link>
          <div className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400">
            <Eye className="w-4 h-4" /> {post.viewCount}
          </div>
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
