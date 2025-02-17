import { BaseModel } from './base';

export type CategoryType = 'post' | 'resource' | 'award' | 'recognition';

export interface Category extends BaseModel {
  id: string;
  name: string;
  title?: string;
  slug: string;
  type: CategoryType;
  description?: string;
  icon?: string;
  featured?: boolean;
  parentId?: string;
  itemCount?: number;
  createdAt: number;
  updatedAt: number;
  menuPath?: string | null;
}

export type CategoryWithPosts = Category & {
  posts: number;
};
