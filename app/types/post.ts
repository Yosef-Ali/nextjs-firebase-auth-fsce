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
  category: {
    id: string;
    name: string;
  };
  section?: string;  
  slug: string;
  coverImage?: string;
  images?: string[];
  published: boolean;
  featured?: boolean;
  authorId: string;
  authorEmail: string | null;
  author?: Author;
  date: string;
  createdAt: number;  // timestamp in milliseconds
  updatedAt: number;  // timestamp in milliseconds
  tags?: string[];
  time?: string;  
  location?: string;  
  status?: string;  // Add status property
}

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
