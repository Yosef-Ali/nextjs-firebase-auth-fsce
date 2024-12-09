export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  count?: number; // Number of posts in this category
  type: 'post'; // Category type
  featured?: boolean; // New featured property
  icon?: string; // Optional icon property
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'count'>;
