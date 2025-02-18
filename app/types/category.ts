export type CategoryType = 'post' | 'resource' | 'award' | 'recognition';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  featured: boolean;
  slug?: string;
  description?: string;
  icon?: string;
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
