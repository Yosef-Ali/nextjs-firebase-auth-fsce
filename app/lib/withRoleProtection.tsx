'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { authorization, UserRole } from '@/lib/authorization';
import { UserStatus } from '@/app/types/user';
import { LoadingScreen } from '@/components/loading-screen';
import { toast } from '@/hooks/use-toast';

export function withRoleProtection<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    requiredRole: UserRole = UserRole.USER
) {
    return function ProtectedRoute(props: P) {
        const { user, userData, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading) {
                if (!user) {
                    router.push('/sign-in');
                    return;
                }
                if (!userData) {
                    router.push('/sign-in');
                    return;
                }
                if (userData.status !== UserStatus.ACTIVE) {
                    router.push('/pending-approval');
                    return;
                }

                // Check if user has required role using authorization service
                const hasAccess = authorization.canAccess(
                    authorization.createContext(user),
                    requiredRole
                );
                if (!hasAccess) {
                    toast({
                        title: "Access Denied",
                        description: "You don't have permission to access this page",
                        variant: "destructive"
                    });
                    router.push('/unauthorized');
                    return;
                }
            }
        }, [user, userData, loading, router]);

        if (loading) {
            return <LoadingScreen />;
        }

        if (!user || !userData) {
            return null;
        }

        // Only render the component if user is authenticated and has required role
        return authorization.canAccess(
            authorization.createContext(user),
            requiredRole
        ) ? (
            <WrappedComponent {...props} />
        ) : null;
    };
}
