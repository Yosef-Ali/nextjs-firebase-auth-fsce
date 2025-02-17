export interface Category {
  id: string;
  name: string;
  type: 'post' | 'resource';
  featured: boolean;
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
