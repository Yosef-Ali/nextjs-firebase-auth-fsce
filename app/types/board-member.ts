export interface BoardMemberFormData {
  name: string;
  position: string;
  bio: string;
  image: string;
  featured: boolean;
  order: number;
  status: 'published' | 'draft' | 'archived';
}

export interface BoardMember extends BoardMemberFormData {
  id: string;
  createdAt: number;
  updatedAt: number;
}
