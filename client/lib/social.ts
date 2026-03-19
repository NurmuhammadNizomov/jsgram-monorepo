import { api } from './api';
import type { Post, Comment, Notification, Story, StoryGroup } from '@/types/social';
import type { User } from '@/types/auth';

// ── Posts ────────────────────────────────────────────────────────────────────
export const PostAPI = {
  getFeed: (page = 1) => api.get<Post[]>(`/posts/feed?page=${page}`),
  getExplore: (page = 1) => api.get<Post[]>(`/posts/explore?page=${page}`),
  getUserPosts: (userId: string, page = 1) => api.get<Post[]>(`/posts/user/${userId}?page=${page}`),
  getById: (id: string) => api.get<Post>(`/posts/${id}`),
  create: (data: { content?: string; images?: { url: string; publicId: string }[]; visibility?: string }) =>
    api.post<Post>('/posts', data),
  update: (id: string, content: string) => api.patch<Post>(`/posts/${id}`, { content }),
  delete: (id: string) => api.delete(`/posts/${id}`),
  toggleLike: (id: string) => api.post<{ liked: boolean }>(`/posts/${id}/like`),
  toggleBookmark: (id: string) => api.post<{ bookmarked: boolean }>(`/posts/${id}/bookmark`),
  getBookmarks: (page = 1) => api.get<Post[]>(`/posts/bookmarks?page=${page}`),
};

// ── Comments ──────────────────────────────────────────────────────────────────
export const CommentAPI = {
  getByPost: (postId: string, page = 1) => api.get<Comment[]>(`/posts/${postId}/comments?page=${page}`),
  getReplies: (commentId: string, page = 1) => api.get<Comment[]>(`/comments/${commentId}/replies?page=${page}`),
  create: (postId: string, data: { text: string; parentComment?: string }) =>
    api.post<Comment>(`/posts/${postId}/comments`, data),
  delete: (commentId: string) => api.delete(`/comments/${commentId}`),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const UploadAPI = {
  image: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ url: string; publicId: string; width: number; height: number }>(
      '/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const NotificationAPI = {
  getAll: (page = 1) => api.get<Notification[]>(`/notifications?page=${page}`),
  getUnreadCount: () => api.get<number>('/notifications/unread-count'),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ── Stories ───────────────────────────────────────────────────────────────────
export const StoryAPI = {
  getFeed: () => api.get<StoryGroup[]>('/stories/feed'),
  getMine: () => api.get<Story[]>('/stories/mine'),
  create: (file: File, caption?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (caption) form.append('caption', caption);
    return api.post<Story>('/stories', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getByUser: (userId: string) => api.get<import('@/types/social').StoryGroup | null>(`/stories/user/${userId}`),
  markViewed: (id: string) => api.post(`/stories/${id}/view`),
  toggleLike: (id: string) => api.post<{ liked: boolean; likesCount: number }>(`/stories/${id}/like`),
  delete: (id: string) => api.delete(`/stories/${id}`),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const ChatAPI = {
  sendDirect: (
    recipientId: string,
    text: string,
    storyReply?: { storyId: string; mediaUrl: string; mediaType: string },
  ) => api.post('/conversations/direct', { recipientId, text, ...(storyReply ? { storyReply } : {}) }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const UserAPI = {
  search: (q: string, page = 1) => api.get<User[]>(`/users/search?q=${encodeURIComponent(q)}&page=${page}`),
  getSuggested: (limit = 10) => api.get<User[]>(`/users/suggested?limit=${limit}`),
  getByIdentifier: (identifier: string) => api.get<User & { followersCount: number; followingCount: number; isFollowing: boolean }>(`/users/${identifier}`),
  updateProfile: (data: Partial<{ username: string; firstName: string; lastName: string; bio: string; language: string }>) =>
    api.patch('/users/profile', data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ avatar: string }>('/users/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  toggleBlock: (userId: string) => api.post<{ blocked: boolean }>(`/users/${userId}/block`),
  getBlockedList: () => api.get<User[]>('/users/blocked/list'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/users/profile/password', { currentPassword, newPassword }),
  deactivate: () => api.delete('/users/profile'),
};

// ── Hashtags ──────────────────────────────────────────────────────────────────
export const HashtagAPI = {
  trending: (limit = 20) => api.get<{ tag: string; postsCount: number }[]>(`/hashtags/trending?limit=${limit}`),
  search: (q: string, limit = 10) => api.get<{ tag: string; postsCount: number }[]>(`/hashtags/search?q=${encodeURIComponent(q)}&limit=${limit}`),
};

// ── Follow ────────────────────────────────────────────────────────────────────
export const FollowAPI = {
  toggle: (userId: string) => api.post<{ following: boolean }>(`/users/${userId}/follow`),
  getFollowers: (userId: string, page = 1) => api.get<User[]>(`/users/${userId}/followers?page=${page}`),
  getFollowing: (userId: string, page = 1) => api.get<User[]>(`/users/${userId}/following?page=${page}`),
  getCounts: (userId: string) => api.get<{ followers: number; following: number }>(`/users/${userId}/follow-counts`),
};
