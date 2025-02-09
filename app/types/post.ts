export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export type PostStatus = 'draft' | 'published' | 'archived';

export interface Category {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string | Category;
  published: boolean;
  authorId: string;
  authorEmail: string;
  date: string;
  createdAt: number;  // timestamp in milliseconds
  updatedAt: number;  // timestamp in milliseconds
  coverImage?: string;
  images?: string[];
  featured?: boolean;
  section?: string;
  tags?: string[];
  time?: string;
  location?: string;
  status?: PostStatus;
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
