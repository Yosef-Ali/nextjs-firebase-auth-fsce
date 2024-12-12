'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { forceUpdateAdminRole } from '@/lib/firebase/admin-utils';
import { toast } from '@/components/ui/use-toast';

export default function UnauthorizedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-in');
    }
  }, [user, loading, router]);

  const handleForceAdmin = async () => {
    if (!user || !user.email) {
      console.error('No user or email found:', user);
      toast({
        title: 'Error',
        description: 'User information not found. Please sign in again.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Attempting to update admin role for:', user.email);
    try {
      const success = await forceUpdateAdminRole(user.uid, user.email);
      console.log('Update result:', success);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Admin role updated. Please sign out and sign back in.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update admin role.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating admin role:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Unauthorized Access
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          You do not have permission to access this resource.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
          {user.email && ['dev.yosef@gmail.com'].includes(user.email) && (
            <Button onClick={handleForceAdmin} variant="outline">
              Update Admin Role
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
