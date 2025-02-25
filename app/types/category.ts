export type CategoryType = 'post' | 'resource' | 'event';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  type: CategoryType;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  icon?: string;
  itemCount?: number;
}

export interface CreateCategoryInput {
  name: string;
  description: string;
  slug: string;
  type: CategoryType;
  featured?: boolean;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  slug?: string;
  type?: CategoryType;
  featured?: boolean;
  icon?: string;
}
