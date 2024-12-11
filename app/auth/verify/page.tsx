'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usersService } from '@/app/services/users';
import { UserStatus } from '@/app/types/user';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        if (searchParams) {
          const role = searchParams.get('role');
          // Verify the user's role and status
          const currentUser = await usersService.getCurrentUser();
          if (!currentUser) {
            toast({
              title: 'Error',
              description: 'User not found. Please try signing in again.',
              variant: 'destructive',
            });
            router.push('/sign-in');
            return;
          }

          // Update user's status to active if they were invited
          if (currentUser.status === UserStatus.INVITED) {
            await usersService.createOrUpdateUser(currentUser.uid, {
              status: UserStatus.ACTIVE,
            });
          }

          // Redirect based on role
          if (role === 'admin') {
            router.push('/dashboard/admin');
          } else if (role === 'author') {
            router.push('/dashboard/author');
          } else {
            router.push('/dashboard');
          }
        } else {
          toast({
            title: 'Error',
            description: 'Invalid request. Please try again.',
            variant: 'destructive',
          });
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        toast({
          title: 'Error',
          description: 'Failed to verify user. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyUser();
  }, [searchParams, router]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Verifying your account...</h1>
        <p className="text-gray-600 mb-4">Please wait while we verify your account.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Verification Complete</h1>
      <p className="text-gray-600 mb-4">You can now access your dashboard.</p>
      <Button onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </Button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
