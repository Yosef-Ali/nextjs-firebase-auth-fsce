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
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'count'>;
