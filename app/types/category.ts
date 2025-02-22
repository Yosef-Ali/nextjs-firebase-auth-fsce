export interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  featured: boolean;
  description?: string;
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum CategoryType {
  POST = 'post',
  EVENT = 'event',
  RESOURCE = 'resource'
}
