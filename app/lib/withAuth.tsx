import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/use-auth';
import { authorization } from '@/app/lib/authorization';
import { UserRole } from '@/app/types/user';
import { LoadingScreen } from '@/components/loading-screen/LoadingScreen';

export function withAuth(
    WrappedComponent: React.ComponentType,
    requiredRole: UserRole = UserRole.USER
) {
    return function ProtectedRoute(props: any) {
        const { user, userData, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading) {
                if (!user || !userData) {
                    router.replace('/sign-in');
                    return;
                }

                const authUser = { ...user, role: userData.role, status: userData.status };

                if (!authorization.hasRole(authUser, requiredRole)) {
                    router.replace('/unauthorized');
                    return;
                }

                if (!authorization.isActiveUser(authUser)) {
                    router.replace('/account-pending');
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

        return <WrappedComponent {...props} />;
    };
}