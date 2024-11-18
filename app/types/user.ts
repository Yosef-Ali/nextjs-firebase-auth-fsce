export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  displayName?: string;
  photoURL?: string;
  createdAt: number;  // timestamp in milliseconds
  updatedAt: number;  // timestamp in milliseconds
}
