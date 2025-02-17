import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/use-auth';
import { authorization } from '@/app/lib/authorization';
import { UserRole } from '@/app/types/user';
import { convertToAppUser } from '@/app/utils/user-utils';

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
                const baseUser = convertToAppUser(user);
                const authUser = baseUser ? { ...baseUser, role: userData.role, status: userData.status } : null;
                
                if (!authUser || !authorization.hasRole(authUser, requiredRole)) {
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
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
                </div>
            );
        }
        if (!user || !userData) {
            return null;
        }
        return <WrappedComponent {...props} />;
    };
}
