import { User } from '@/app/types/user';
import Link from 'next/link';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <div className="space-y-2">
        <p>Name: {user.displayName || 'Not set'}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Status: {user.status}</p>
      </div>
      {user.role === 'ADMIN' && (
        <Link href="/admin">Admin Dashboard</Link>
      )}
    </div>
  );
}
