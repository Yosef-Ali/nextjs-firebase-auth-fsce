export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  count?: number; // Number of posts/resources in this category
  type: 'post' | 'resource'; // Whether this category is for posts or resources
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'count'>;
