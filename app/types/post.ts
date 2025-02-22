import { Category } from './category';

export enum PostStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Category | string;
  published: boolean;
  authorId: string;
  authorEmail: string;
  authorName?: string;
  sticky: boolean;
  section?: string;
  createdAt: number;
  updatedAt: number;
  coverImage?: string;
  images?: string[];
  tags?: string[];
  time?: string;
  location?: string;
  status?: PostStatus;
  date?: number;
  author?: Author;
  featured?: boolean;
}

export type CreatePostInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePostInput = Partial<CreatePostInput>;

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
