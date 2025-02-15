'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { UserRole, UserStatus } from '@/app/types/user';
import { toast } from '@/hooks/use-toast';

export default function UnauthorizedPage() {
  const { user, userData, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      });
      router.replace('/sign-in');
      return;
    }

    if (!loading) {
      if (!user) {
        router.replace('/sign-in');
      } else if (userData?.status !== UserStatus.ACTIVE) {
        router.replace('/pending-approval');
      } else if (userData?.role === UserRole.ADMIN || userData?.role === UserRole.AUTHOR) {
        // If user actually has access, redirect them away from this page
        router.replace('/dashboard');
      }
    }
  }, [user, userData, loading, router, error]);

  if (loading) {
    return <LoadingScreen />;
  }

  // If we're still loading user data, show loading state
  if (!userData && user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">
            Sorry, you don't have permission to access the dashboard. Only administrators and authors can access this area.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {userData?.role || 'No role assigned'}
          </p>
          <div className="flex flex-col w-full gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Home
            </Button>
            {user && (
              <p className="text-sm text-gray-500 mt-2">
                If you believe this is a mistake, please contact an administrator.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
