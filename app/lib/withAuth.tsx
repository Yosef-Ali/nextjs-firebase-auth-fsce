import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { UserRole } from '@/app/types/user';
import { AuthLoadingScreen } from '@/app/components/loading-screen/AuthLoadingScreen';
import { Authorization } from './authorization';
import { AuthErrorFallback } from '@/app/components/error-boundary/AuthErrorBoundary';

/**
 * Higher-order component for protecting routes based on authentication and role requirements
 * @param WrappedComponent - The component to be protected
 * @param requiredRole - The minimum role required to access the component
 */
export function withAuth(
    WrappedComponent: React.ComponentType,
    requiredRole: UserRole = UserRole.USER
) {
    return function ProtectedRoute(props: any) {
        const { 
            firebaseUser, 
            userData, 
            isLoading,
            authError,
            userError
        } = useAuth();
        
        const router = useRouter();
        const auth = Authorization.getInstance();

        useEffect(() => {
            if (!isLoading) {
                // Redirect to login if not authenticated
                if (!firebaseUser || !userData) {
                    router.replace('/login');
                    return;
                }

                // Redirect to unauthorized if lacking required role
                if (!auth.hasMinimumRole(userData.role, requiredRole)) {
                    router.replace('/unauthorized');
                    return;
                }
            }
        }, [firebaseUser, userData, isLoading, router, requiredRole]);

        // Handle loading state
        if (isLoading) {
            return <AuthLoadingScreen />;
        }

        // Handle errors
        if (authError || userError) {
            return <AuthErrorFallback error={authError || userError} />;
        }

        // Handle unauthenticated state
        if (!firebaseUser || !userData) {
            return null;
        }

        // Handle unauthorized state
        if (!auth.hasMinimumRole(userData.role, requiredRole)) {
            return null;
        }

        // Render protected component with user data
        return <WrappedComponent userData={userData} {...props} />;
    };
}
