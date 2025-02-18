import { Timestamp } from '@/types';

export type CategoryType = 'post' | 'resource' | 'award' | 'recognition';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  featured: boolean;
  slug: string;  // Make slug required
  description?: string;
  icon?: string;
  itemCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
