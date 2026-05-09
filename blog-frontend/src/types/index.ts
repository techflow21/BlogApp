export const PostStatus = {
  Draft: 0,
  Published: 1,
  Archived: 2,
} as const;
export type PostStatus = typeof PostStatus[keyof typeof PostStatus];

export const ReactionType = {
  Like: 1,
  Dislike: 2,
} as const;
export type ReactionType = typeof ReactionType[keyof typeof ReactionType];

export interface PostResponse {
  postId: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  tags: string[];
  coverImageUrl: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  status: PostStatus;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
}

export interface CommentResponse {
  commentId: string;
  postId: string;
  parentCommentId: string | null;
  authorId: string;
  userId: string;
  authorName: string;
  authorImageUrl: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  isDeleted: boolean;
  isEdited: boolean;
}

export interface TopPostResponse {
  postId: string;
  title: string;
  slug: string;
  authorName: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
}

export interface DashboardSummary {
  totalUsers: number;
  totalPosts: number;
  publishedPosts: number;
  totalComments: number;
  totalReactions: number;
  totalViews: number;
}

export interface ReactionResult {
  reacted: boolean;
  currentReaction: ReactionType | null;
  likeCount: number;
  dislikeCount: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  profileImageUrl: string;
  bio: string;
  roles: string[];
  claims: Record<string, string>;
}

export interface AuthResponse {
  token: string;
  expires: string;
  userId: string;
  email: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  summary: string;
  tags: string[];
  coverImageUrl: string;
  status: PostStatus;
}

export interface UpdatePostRequest extends CreatePostRequest {}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersRegisteredThisMonth: number;
  totalPosts: number;
  totalComments: number;
  totalReactions: number;
}

export interface EngagementStats {
  totalReactions: number;
  totalComments: number;
  avgCommentsPerPost: number;
}

export interface EngagementPeriod {
  period: string;
  postCount: number;
  commentCount: number;
  likeCount: number;
  viewCount: number;
}
