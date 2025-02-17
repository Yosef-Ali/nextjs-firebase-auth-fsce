'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/app/types/user';

interface WithRoleProtectionProps {
  [key: string]: any;
}

// Define role hierarchy
const roleHierarchy: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR, UserRole.USER, UserRole.GUEST],
  [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR, UserRole.USER, UserRole.GUEST],
  [UserRole.EDITOR]: [UserRole.EDITOR, UserRole.AUTHOR, UserRole.USER, UserRole.GUEST],
  [UserRole.AUTHOR]: [UserRole.AUTHOR, UserRole.USER, UserRole.GUEST],
  [UserRole.USER]: [UserRole.USER, UserRole.GUEST],
  [UserRole.GUEST]: [UserRole.GUEST]
};

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
        } else {
          // Check if user has the required role or higher in the hierarchy
          const hasRequiredRole = roleHierarchy[userData.role]?.includes(requiredRole);
          if (!hasRequiredRole) {
            router.push('/unauthorized');
          }
        }
      }
    }, [userData, loading, router, requiredRole]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      );
    }

    if (!userData || !roleHierarchy[userData.role]?.includes(requiredRole)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withRoleProtection(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

  return ProtectedComponent;
};

