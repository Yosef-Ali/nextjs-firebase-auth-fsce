export interface User {
  id: string;
  email: string;
  role: 'user' | 'author' | 'admin';
  displayName?: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
  status?: 'active' | 'invited' | 'suspended';
  invitedBy?: string;
  invitationToken?: string;
}
