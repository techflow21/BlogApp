import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { commentsApi } from '../../api/endpoints';
import type { CommentResponse } from '../../types';
import toast from 'react-hot-toast';

interface CommentsState {
  items: CommentResponse[];
  replies: Record<string, CommentResponse[]>;
  loading: boolean;
}

const initialState: CommentsState = {
  items: [],
  replies: {},
  loading: false,
};

export const fetchCommentsThunk = createAsyncThunk(
  'comments/fetchByPost',
  async ({ postId, params }: { postId: string; params?: { page?: number; pageSize?: number } }) => {
    const res = await commentsApi.getByPost(postId, params);
    return res.data;
  }
);

export const fetchRepliesThunk = createAsyncThunk(
  'comments/fetchReplies',
  async (commentId: string) => {
    const res = await commentsApi.getReplies(commentId);
    return { commentId, replies: res.data };
  }
);

export const createCommentThunk = createAsyncThunk(
  'comments/create',
  async (data: { postId: string; content: string; parentCommentId?: string }) => {
    const res = await commentsApi.create(data);
    return res.data;
  }
);

export const updateCommentThunk = createAsyncThunk(
  'comments/update',
  async ({ commentId, content }: { commentId: string; content: string }) => {
    const res = await commentsApi.update(commentId, content);
    return res.data;
  }
);

export const deleteCommentThunk = createAsyncThunk(
  'comments/delete',
  async (commentId: string) => {
    await commentsApi.delete(commentId);
    return commentId;
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments(state) {
      state.items = [];
      state.replies = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentsThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchCommentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCommentsThunk.rejected, (state) => { state.loading = false; })
      .addCase(fetchRepliesThunk.fulfilled, (state, action) => {
        state.replies[action.payload.commentId] = action.payload.replies;
      })
      .addCase(createCommentThunk.fulfilled, (state, action) => {
        const comment = action.payload;
        if (comment.parentCommentId) {
          const replies = state.replies[comment.parentCommentId] || [];
          state.replies[comment.parentCommentId] = [...replies, comment];
          const parent = state.items.find((c) => c.commentId === comment.parentCommentId);
          if (parent) parent.replyCount += 1;
        } else {
          state.items.unshift(comment);
        }
        toast.success('Comment posted!');
      })
      .addCase(updateCommentThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((c) => c.commentId === updated.commentId);
        if (idx !== -1) state.items[idx] = updated;
        toast.success('Comment updated!');
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.commentId !== action.payload);
        toast.success('Comment deleted!');
      });
  },
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
