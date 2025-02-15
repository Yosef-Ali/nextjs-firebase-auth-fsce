'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/use-auth';
import { UserRole } from '@/app/types/user';

interface WithRoleProtectionProps {
  [key: string]: any;
}

export const withRoleProtection = <P extends WithRoleProtectionProps>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: UserRole
) => {
  const ProtectedComponent: React.FC<P> = (props) => {
    const { userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!userData) {
          router.push('/sign-in');
        } else if (userData.role !== requiredRole) {
          router.push('/unauthorized');
        }
      }
    }, [userData, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      );
    }

    if (!userData || userData.role !== requiredRole) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withRoleProtection(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

  return ProtectedComponent;
};

