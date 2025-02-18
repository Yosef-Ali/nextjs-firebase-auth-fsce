import { Timestamp, WithTimestamps } from './index';

export type CategoryType = 'post' | 'resource' | 'award' | 'recognition';

export interface Category extends WithTimestamps {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  featured: boolean;
  description?: string;
  icon?: string;
  itemCount?: number;
}

// Used when creating a new category
export interface CreateCategoryInput {
  name: string;
  slug: string;
  type: CategoryType;
  featured: boolean;
  description?: string;
  icon?: string;
}

// Used when updating an existing category
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// Helper type for category service functions
export interface CategoryWithoutTimestamps extends Omit<Category, keyof WithTimestamps> { }
