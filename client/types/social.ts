import type { User } from './auth';

export interface PostImage {
  url: string;
  publicId: string;
}

export interface Post {
  _id: string;
  author: Pick<User, '_id' | 'username' | 'firstName' | 'lastName' | 'avatar'> & { isOnline?: boolean };
  content: string;
  images: PostImage[];
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  repostsCount: number;
  visibility: 'public' | 'followers' | 'private';
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: Pick<User, '_id' | 'username' | 'firstName' | 'lastName' | 'avatar'>;
  text: string;
  parentComment: string | null;
  likesCount: number;
  repliesCount?: number;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: Pick<User, '_id' | 'username' | 'firstName' | 'lastName' | 'avatar'>;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'mention';
  post?: Pick<Post, '_id' | 'content' | 'images'> | null;
  comment?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Story {
  _id: string;
  author: Pick<User, '_id' | 'username' | 'firstName' | 'lastName' | 'avatar'>;
  mediaUrl: string;
  mediaPublicId: string;
  mediaType: 'image' | 'video';
  caption: string;
  viewedBy: string[];
  likes: string[];
  isViewed?: boolean;
  isLiked?: boolean;
  likesCount?: number;
  expiresAt: string;
  createdAt: string;
}

export interface StoryGroup {
  author: Pick<User, '_id' | 'username' | 'firstName' | 'lastName' | 'avatar'>;
  stories: Story[];
  hasUnread: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}
