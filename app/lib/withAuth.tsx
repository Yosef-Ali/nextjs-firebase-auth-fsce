'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { UserStatus } from '@/app/types/user';
import { LoadingScreen } from '@/components/loading-screen';

export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
) {
    return function ProtectedRoute(props: P) {
        const { user, userData, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading) {
                if (!user) {
                    router.replace('/sign-in');
                    return;
                }

                if (userData?.status !== UserStatus.ACTIVE) {
                    router.replace('/pending-approval');
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
