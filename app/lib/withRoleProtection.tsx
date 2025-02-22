'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/app/lib/firebase/context';
import { LoadingScreen } from '@/components/loading-screen';
import { UserRole } from '@/app/types/user';
import { Authorization } from './authorization';

export function withRoleProtection<P extends object>(
    Component: React.ComponentType<P>,
    requiredRoles: UserRole[]
) {
    return function ProtectedRoute(props: P) {
        const { user, userData, loading } = useAuthContext();
        const router = useRouter();
        const auth = Authorization.getInstance();

        useEffect(() => {
            if (!loading) {
                if (!user || !userData) {
                    router.replace('/sign-in');
                    return;
                }

                // Check if user has any of the required roles
                const hasRequiredRole = requiredRoles.some(role =>
                    auth.hasMinimumRole(userData.role, role)
                );

                if (!hasRequiredRole) {
                    router.replace('/unauthorized');
                    return;
                }
            }
        }, [user, userData, loading, router, requiredRoles]);

        if (loading) {
            return <LoadingScreen />;
        }

        // Check if user has any of the required roles
        const hasRequiredRole = requiredRoles.some(role =>
            auth.hasMinimumRole(userData?.role, role)
        );

        if (!user || !userData || !hasRequiredRole) {
            return null;
        }

        return <Component {...props} />;
    };
}
