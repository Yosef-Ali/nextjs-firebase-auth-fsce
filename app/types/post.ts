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
  coverImage?: string;
  images?: string[];  // Array of image URLs
  published: boolean;
  authorId: string;
  authorEmail: string;
  author?: Author;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  slug: string;
}
