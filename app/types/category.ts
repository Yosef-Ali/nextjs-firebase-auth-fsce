export type CategoryType = 'post' | 'resource' | 'award' | 'recognition';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  featured: boolean;
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
  slug?: string;
  description?: string;
  icon?: string;
}
