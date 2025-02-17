'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/app/types/user';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userData, loading } = useAuth();

  useEffect(() => {
    if (!loading && userData && userData.role !== UserRole.ADMIN && userData.role !== UserRole.SUPER_ADMIN && userData.role !== UserRole.AUTHOR) {
      router.replace('/unauthorized');
    }
  }, [userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData || (userData.role !== UserRole.ADMIN && userData.role !== UserRole.SUPER_ADMIN && userData.role !== UserRole.AUTHOR)) {
    return null;
  }

  return <>{children}</>;
}
