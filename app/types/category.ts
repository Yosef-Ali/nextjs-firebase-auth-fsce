export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  count?: number; // Number of posts in this category
  itemCount?: number; // Number of items in this category
  type: 'post' | 'resource'; // Category type
  featured?: boolean; // Featured property
  icon?: string; // Optional icon property
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'count' | 'itemCount'>;
