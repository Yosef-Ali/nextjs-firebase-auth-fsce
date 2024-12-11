'use client';

import { useAuth } from '@/app/providers/AuthProvider';
import { Authorization } from '@/app/lib/authorization';
import { useEffect, useState } from 'react';

export function withRoleProtection(Component: React.ComponentType, requiredRole: 'admin' | 'author' | 'user') {
  return function ProtectedComponent(props: any) {
    const { user, userData, loading } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const checkAccess = () => {
        if (loading) return;

        if (!user) {
          setHasAccess(false);
          setChecking(false);
          setError('Please sign in to access this page');
          return;
        }

        try {
          // First check if the user is an admin through email
          if (Authorization.isAdmin(user)) {
            setHasAccess(true);
            setChecking(false);
            return;
          }

          // Then check the userData role
          if (userData) {
            const hasRole = userData.role === requiredRole;
            setHasAccess(hasRole);
            if (!hasRole) {
              setError(`Access Denied: You need ${requiredRole} permissions to view this page`);
            }
          } else {
            setError('User data not found');
            setHasAccess(false);
          }
        } catch (error) {
          console.error('Error checking role:', error);
          setError('Error checking permissions');
          setHasAccess(false);
        }
        setChecking(false);
      };

      checkAccess();
    }, [user, userData, loading]);

    if (loading || checking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
            {error && <p className="mt-2 text-gray-600">{error}</p>}
            {!user && (
              <a href="/sign-in" className="mt-4 text-blue-500 hover:text-blue-700">
                Sign In
              </a>
            )}
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
