import api from './axios';
import type {
  AuthResponse,
  UserProfile,
  PostResponse,
  CommentResponse,
  ReactionResult,
  DashboardSummary,
  TopPostResponse,
  UserStats,
  EngagementPeriod,
  CreatePostRequest,
  UpdatePostRequest,
  PaginatedResponse,
  ReactionType,
} from '../types';

// Auth
export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<AuthResponse>('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', data),
  me: () => api.get<UserProfile>('/api/auth/me'),
  updateMe: (data: { fullName: string; bio: string; profileImageUrl: string }) =>
    api.put<UserProfile>('/api/auth/me', data),
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/api/auth/reset-password', data),
};

// Posts
export const postsApi = {
  getAll: (params?: { page?: number; pageSize?: number; tag?: string; status?: number }) =>
    api.get<PaginatedResponse<PostResponse>>('/api/posts', { params }),
  getById: (id: string) => api.get<PostResponse>(`/api/posts/${id}`),
  getBySlug: (slug: string) => api.get<PostResponse>(`/api/posts/slug/${slug}`),
  create: (data: CreatePostRequest) => api.post<PostResponse>('/api/posts', data),
  update: (id: string, data: UpdatePostRequest) =>
    api.put<PostResponse>(`/api/posts/${id}`, data),
  delete: (id: string) => api.delete(`/api/posts/${id}`),
};

// Comments
export const commentsApi = {
  getByPost: (postId: string, params?: { page?: number; pageSize?: number }) =>
    api.get<CommentResponse[]>(`/api/comments/post/${postId}`, { params }),
  getReplies: (commentId: string) =>
    api.get<CommentResponse[]>(`/api/comments/${commentId}/replies`),
  create: (data: { postId: string; content: string; parentCommentId?: string }) =>
    api.post<CommentResponse>('/api/comments', data),
  update: (commentId: string, content: string) =>
    api.put<CommentResponse>(`/api/comments/${commentId}`, { content }),
  delete: (commentId: string) => api.delete(`/api/comments/${commentId}`),
};

// Reactions
export const reactionsApi = {
  reactToPost: (postId: string, type: ReactionType) =>
    api.post<ReactionResult>(`/api/reactions/posts/${postId}`, { type }),
  reactToComment: (commentId: string, type: ReactionType) =>
    api.post<ReactionResult>(`/api/reactions/comments/${commentId}`, { type }),
  getPostReaction: (postId: string) =>
    api.get<ReactionResult>(`/api/reactions/posts/${postId}`),
  getCommentReaction: (commentId: string) =>
    api.get<ReactionResult>(`/api/reactions/comments/${commentId}`),
};

// Admin
export const adminApi = {
  dashboard: () => api.get<DashboardSummary>('/api/admin/dashboard'),
  topPostsByViews: (count = 5) =>
    api.get<TopPostResponse[]>('/api/admin/top-posts/views', { params: { count } }),
  topPostsByLikes: (count = 5) =>
    api.get<TopPostResponse[]>('/api/admin/top-posts/likes', { params: { count } }),
  recentPosts: (count = 10) =>
    api.get<PostResponse[]>('/api/admin/recent-posts', { params: { count } }),
  userStats: () => api.get<UserStats>('/api/admin/user-stats'),
  engagementStats: () => api.get<EngagementPeriod[]>('/api/admin/engagement-stats'),
};
