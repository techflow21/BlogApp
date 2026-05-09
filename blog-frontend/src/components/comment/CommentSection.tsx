import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchCommentsThunk, createCommentThunk } from '../../features/comments/commentsSlice';
import CommentItem from './CommentItem';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';

interface Props {
  postId: string;
}

export default function CommentSection({ postId }: Props) {
  const dispatch = useAppDispatch();
  const { items: comments, loading } = useAppSelector((s) => s.comments);
  const { token, user } = useAppSelector((s) => s.auth);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    dispatch(fetchCommentsThunk({ postId }));
  }, [dispatch, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!token) {
      toast.error('Please login to comment');
      return;
    }
    await dispatch(createCommentThunk({ postId, content: text }));
    setText('');
  };

  return (
    <section id="comments" className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Add comment */}
      {token ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" /> Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700">
          <a href="/login" className="font-medium underline">Login</a> to join the conversation.
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.commentId} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </section>
  );
}
