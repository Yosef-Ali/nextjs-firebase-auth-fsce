'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/app/types/user';
import { Spinner } from '@/components/ui/spinner';
import { LoadingScreen } from '@/components/loading-screen/LoadingScreen';

export function withRoleProtection(Component: React.ComponentType<any>, requiredRoles: UserRole[]) {
    return function ProtectedRoute(props: any) {
        const { userData, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading && (!userData || !userData.role || !requiredRoles.includes(userData.role))) {
                router.replace('/unauthorized');
            }
        }, [userData, loading, router]);

        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner className="h-32 w-32" />
                </div>
            );
        }

        if (!userData || !userData.role || !requiredRoles.includes(userData.role)) {
            return null; // Router will redirect
        }

        return <Component {...props} />;
    };
}
