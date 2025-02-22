export interface ParentClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  children?: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive';
}