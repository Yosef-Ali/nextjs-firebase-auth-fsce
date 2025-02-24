export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  type: 'post' | 'resource' | 'event';
  createdAt: Date;
}
