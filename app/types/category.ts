import { Timestamp } from 'firebase/firestore';

export type CategoryType = 'post' | 'resource' | 'event' | 'award' | 'recognition';

export interface Category {
  id: string;
  name: string;
  description?: string; // Make optional to match implementation
  slug: string;
  type: CategoryType;
  featured: boolean;
  icon?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
