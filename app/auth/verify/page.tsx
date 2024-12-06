'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usersService } from '@/app/services/users';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const role = searchParams.get('role');

  useEffect(() => {
    const verifyUser = async () => {
      try {
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
        if (currentUser.status === 'invited') {
          await usersService.createOrUpdateUser(currentUser.id, {
            status: 'active',
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
  }, [role, router]);

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
