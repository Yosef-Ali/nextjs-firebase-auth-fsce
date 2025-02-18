import { Timestamp, WithTimestamps } from './index';
import { Category } from './category';
import { Author } from '@/app/types/author';

export type PostStatus = 'draft' | 'published' | 'archived';

export interface BasePost extends WithTimestamps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
  sticky: boolean;
  section?: string;
  images: string[];
  authorId: string;
  authorEmail: string;
  authorName?: string;
  date: Timestamp;
  category: Category | string;
  featured: boolean;
  status?: PostStatus;
  author?: Author;
  tags: string[];
}

export interface Event extends BasePost {
  time: string;
  location: string;
}

export interface NewsPost extends BasePost {
  source?: string;
  sourceUrl?: string;
}

export type Post = BasePost | Event | NewsPost;

export type CreatePostInput = Omit<BasePost, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePostInput = Partial<Omit<BasePost, 'id' | 'createdAt' | 'updatedAt'>>;

export const isEvent = (post: Post): post is Event => {
  return 'time' in post || 'location' in post;
};

export const isNewsPost = (post: Post): post is NewsPost => {
  return 'source' in post || 'sourceUrl' in post;
};

export const isBasePost = (post: Post): post is BasePost => {
  return !isEvent(post) && !isNewsPost(post);
};

export interface Resource {
  id: string;
  title: string;
  description?: string;
  category: 'report' | 'publication' | 'media';
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'mp3' | 'mp4' | 'jpg' | 'png';
  fileUrl: string;
  fileSize?: string;
  downloadCount?: number;
  published: boolean;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  status?: string;
}
