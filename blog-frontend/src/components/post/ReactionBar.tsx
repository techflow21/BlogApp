import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { reactToPostThunk } from '../../features/reactions/reactionsSlice';
import { ReactionType } from '../../types';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
}

export default function ReactionBar({ postId, initialLikes, initialDislikes }: Props) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const reaction = useAppSelector((s) => s.reactions.posts[postId]);

  const likeCount = reaction?.likeCount ?? initialLikes;
  const dislikeCount = reaction?.dislikeCount ?? initialDislikes;
  const current = reaction?.currentReaction;

  const handleReact = (type: ReactionType) => {
    if (!token) {
      toast.error('Please login to react');
      return;
    }
    dispatch(reactToPostThunk({ postId, type }));
  };

  const total = likeCount + dislikeCount;
  const likePercent = total > 0 ? Math.round((likeCount / total) * 100) : 50;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-700 mb-4 text-center">How do you find this article?</p>

      <div className="flex gap-4 justify-center mb-4">
        <button
          onClick={() => handleReact(ReactionType.Like)}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all ${
            current === ReactionType.Like
              ? 'bg-indigo-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
          <span className="font-bold text-lg leading-none">{likeCount}</span>
          <span className="text-xs">Likes</span>
        </button>

        <button
          onClick={() => handleReact(ReactionType.Dislike)}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all ${
            current === ReactionType.Dislike
              ? 'bg-red-500 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <ThumbsDown className="w-5 h-5" />
          <span className="font-bold text-lg leading-none">{dislikeCount}</span>
          <span className="text-xs">Dislikes</span>
        </button>
      </div>

      {/* Like ratio bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${likePercent}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-center mt-1">{likePercent}% positive</p>
    </div>
  );
}
