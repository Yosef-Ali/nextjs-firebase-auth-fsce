export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  images?: string[];  // Array of image URLs
  published: boolean;
  authorId: string;
  authorEmail: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  slug: string;
}
