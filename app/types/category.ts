export type CategoryType = 'post' | 'resource';

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  featured: boolean;
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
