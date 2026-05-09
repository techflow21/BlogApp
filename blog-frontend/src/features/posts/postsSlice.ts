import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsApi } from '../../api/endpoints';
import type { PostResponse, PaginatedResponse, CreatePostRequest, UpdatePostRequest } from '../../types';
import toast from 'react-hot-toast';

interface PostsState {
  items: PostResponse[];
  current: PostResponse | null;
  page: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
}

const initialState: PostsState = {
  items: [],
  current: null,
  page: 1,
  pageSize: 10,
  totalCount: 0,
  loading: false,
};

export const fetchPostsThunk = createAsyncThunk(
  'posts/fetchAll',
  async (params?: { page?: number; pageSize?: number; tag?: string; status?: number }) => {
    const res = await postsApi.getAll(params);
    return res.data as PaginatedResponse<PostResponse>;
  }
);

export const fetchPostBySlugThunk = createAsyncThunk(
  'posts/fetchBySlug',
  async (slug: string) => {
    const res = await postsApi.getBySlug(slug);
    return res.data;
  }
);

export const createPostThunk = createAsyncThunk(
  'posts/create',
  async (data: CreatePostRequest) => {
    const res = await postsApi.create(data);
    return res.data;
  }
);

export const updatePostThunk = createAsyncThunk(
  'posts/update',
  async ({ id, data }: { id: string; data: UpdatePostRequest }) => {
    const res = await postsApi.update(id, data);
    return res.data;
  }
);

export const deletePostThunk = createAsyncThunk(
  'posts/delete',
  async (id: string) => {
    await postsApi.delete(id);
    return id;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchPostsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchPostsThunk.rejected, (state) => { state.loading = false; })
      .addCase(fetchPostBySlugThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchPostBySlugThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchPostBySlugThunk.rejected, (state) => { state.loading = false; })
      .addCase(createPostThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        toast.success('Post created!');
      })
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.postId === action.payload.postId);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?.postId === action.payload.postId) state.current = action.payload;
        toast.success('Post updated!');
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.postId !== action.payload);
        toast.success('Post deleted!');
      });
  },
});

export const { clearCurrent } = postsSlice.actions;
export default postsSlice.reducer;
