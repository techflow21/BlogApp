import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reactionsApi } from '../../api/endpoints';
import type { ReactionResult, ReactionType } from '../../types';

interface ReactionsState {
  posts: Record<string, ReactionResult>;
  comments: Record<string, ReactionResult>;
}

const initialState: ReactionsState = {
  posts: {},
  comments: {},
};

export const reactToPostThunk = createAsyncThunk(
  'reactions/reactToPost',
  async ({ postId, type }: { postId: string; type: ReactionType }) => {
    const res = await reactionsApi.reactToPost(postId, type);
    return { postId, result: res.data };
  }
);

export const fetchPostReactionThunk = createAsyncThunk(
  'reactions/fetchPost',
  async (postId: string) => {
    const res = await reactionsApi.getPostReaction(postId);
    return { postId, result: res.data };
  }
);

export const reactToCommentThunk = createAsyncThunk(
  'reactions/reactToComment',
  async ({ commentId, type }: { commentId: string; type: ReactionType }) => {
    const res = await reactionsApi.reactToComment(commentId, type);
    return { commentId, result: res.data };
  }
);

const reactionsSlice = createSlice({
  name: 'reactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(reactToPostThunk.fulfilled, (state, action) => {
        state.posts[action.payload.postId] = action.payload.result;
      })
      .addCase(fetchPostReactionThunk.fulfilled, (state, action) => {
        state.posts[action.payload.postId] = action.payload.result;
      })
      .addCase(reactToCommentThunk.fulfilled, (state, action) => {
        state.comments[action.payload.commentId] = action.payload.result;
      });
  },
});

export default reactionsSlice.reducer;
