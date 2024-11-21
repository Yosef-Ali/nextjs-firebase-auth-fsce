export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  section?: string;  
  slug: string;
  coverImage?: string;
  images?: string[];
  published: boolean;
  featured?: boolean;
  authorId: string;
  authorEmail: string;
  author?: Author;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  date?: string;  
  time?: string;  
  location?: string;  
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  category: 'report' | 'publication' | 'media';
  type: 'pdf' | 'doc' | 'image';
  fileUrl: string;
  fileSize?: string;
  downloadCount?: number;
  published: boolean;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}
