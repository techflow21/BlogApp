import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../api/endpoints';
import type { DashboardSummary, TopPostResponse, PostResponse, UserStats, EngagementPeriod } from '../../types';

interface AdminState {
  dashboard: DashboardSummary | null;
  topByViews: TopPostResponse[];
  topByLikes: TopPostResponse[];
  recentPosts: PostResponse[];
  userStats: UserStats | null;
  engagementStats: EngagementPeriod[] | null;
  loading: boolean;
}

const initialState: AdminState = {
  dashboard: null,
  topByViews: [],
  topByLikes: [],
  recentPosts: [],
  userStats: null,
  engagementStats: null,
  loading: false,
};

export const fetchDashboardThunk = createAsyncThunk('admin/dashboard', async () => {
  const res = await adminApi.dashboard();
  return res.data;
});

export const fetchTopByViewsThunk = createAsyncThunk('admin/topByViews', async (count?: number) => {
  const res = await adminApi.topPostsByViews(count);
  return res.data;
});

export const fetchTopByLikesThunk = createAsyncThunk('admin/topByLikes', async (count?: number) => {
  const res = await adminApi.topPostsByLikes(count);
  return res.data;
});

export const fetchRecentPostsThunk = createAsyncThunk('admin/recentPosts', async (count?: number) => {
  const res = await adminApi.recentPosts(count);
  return res.data;
});

export const fetchUserStatsThunk = createAsyncThunk('admin/userStats', async () => {
  const res = await adminApi.userStats();
  return res.data;
});

export const fetchEngagementStatsThunk = createAsyncThunk('admin/engagementStats', async () => {
  const res = await adminApi.engagementStats();
  return res.data;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardThunk.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardThunk.rejected, (state) => { state.loading = false; })
      .addCase(fetchTopByViewsThunk.fulfilled, (state, action) => { state.topByViews = action.payload; })
      .addCase(fetchTopByLikesThunk.fulfilled, (state, action) => { state.topByLikes = action.payload; })
      .addCase(fetchRecentPostsThunk.fulfilled, (state, action) => { state.recentPosts = action.payload; })
      .addCase(fetchUserStatsThunk.fulfilled, (state, action) => { state.userStats = action.payload; })
      .addCase(fetchEngagementStatsThunk.fulfilled, (state, action) => { state.engagementStats = action.payload; });
  },
});

export default adminSlice.reducer;
