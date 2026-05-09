import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Reply, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { CommentResponse } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchRepliesThunk,
  updateCommentThunk,
  deleteCommentThunk,
  createCommentThunk,
} from '../../features/comments/commentsSlice';
import { reactToCommentThunk } from '../../features/reactions/reactionsSlice';
import { ReactionType } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  comment: CommentResponse;
  postId: string;
  depth?: number;
}

export default function CommentItem({ comment, postId, depth = 0 }: Props) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const replies = useAppSelector((s) => s.comments.replies[comment.commentId] || []);
  const reaction = useAppSelector((s) => s.reactions.comments[comment.commentId]);

  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const isOwner = user?.userId === comment.authorId;
  const likeCount = reaction?.likeCount ?? comment.likeCount;
  const dislikeCount = reaction?.dislikeCount ?? comment.dislikeCount;

  useEffect(() => {
    if (editOpen) editRef.current?.focus();
  }, [editOpen]);

  useEffect(() => {
    if (replyOpen) replyRef.current?.focus();
  }, [replyOpen]);

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0 && comment.replyCount > 0) {
      await dispatch(fetchRepliesThunk(comment.commentId));
    }
    setShowReplies(!showReplies);
  };

  const handleReact = (type: ReactionType) => {
    if (!token) { toast.error('Please login to react'); return; }
    dispatch(reactToCommentThunk({ commentId: comment.commentId, type }));
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    await dispatch(updateCommentThunk({ commentId: comment.commentId, content: editText }));
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    dispatch(deleteCommentThunk(comment.commentId));
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await dispatch(createCommentThunk({ postId, content: replyText, parentCommentId: comment.commentId }));
    setReplyText('');
    setReplyOpen(false);
    if (!showReplies) {
      setShowReplies(true);
    }
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
        {comment.authorName?.[0]?.toUpperCase() || 'A'}
      </div>

      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-800">{comment.authorName}</span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {comment.isEdited && <span className="text-xs text-gray-400 italic">(edited)</span>}
        </div>

        {/* Content or Edit */}
        {editOpen ? (
          <div className="mb-2">
            <textarea
              ref={editRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border border-indigo-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
            <div className="flex gap-2 mt-1">
              <button onClick={handleEdit} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700">Save</button>
              <button onClick={() => setEditOpen(false)} className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => handleReact(ReactionType.Like)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              reaction?.currentReaction === ReactionType.Like ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ThumbsUp className="w-3 h-3" /> {likeCount}
          </button>
          <button
            onClick={() => handleReact(ReactionType.Dislike)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              reaction?.currentReaction === ReactionType.Dislike ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ThumbsDown className="w-3 h-3" /> {dislikeCount}
          </button>

          {token && depth === 0 && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-100"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
          )}

          {isOwner && !editOpen && (
            <>
              <button onClick={() => setEditOpen(true)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-100">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={handleDelete} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </>
          )}

          {comment.replyCount > 0 && depth === 0 && (
            <button
              onClick={toggleReplies}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-indigo-600 hover:bg-indigo-50 ml-auto"
            >
              {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply form */}
        {replyOpen && (
          <div className="mt-3 flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                ref={replyRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />
              <div className="flex gap-2 mt-1">
                <button onClick={handleReply} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700">Reply</button>
                <button onClick={() => { setReplyOpen(false); setReplyText(''); }} className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-3 border-l-2 border-gray-100 pl-2 space-y-3">
            {replies.map((reply) => (
              <CommentItem key={reply.commentId} comment={reply} postId={postId} depth={1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
