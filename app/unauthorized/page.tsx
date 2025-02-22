'use client';

import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/lib/firebase/context';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { UserRole } from '@/app/types/user';

export default function UnauthorizedPage() {
  const { user, userData } = useAuthContext();
  const router = useRouter();

  const handleBack = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/sign-in');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <ShieldAlert className="h-24 w-24 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Unauthorized Access</h1>
        <div className="space-y-2">
          <p className="text-muted-foreground max-w-[400px]">
            You don&apos;t have permission to access this page.
          </p>
          {userData && (
            <p className="text-sm text-muted-foreground">
              Your current role: <span className="font-medium">{userData.role}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Please contact an administrator if you believe this is an error.
          </p>
        </div>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back to {user ? 'Dashboard' : 'Sign In'}
        </Button>
      </div>
    </div>
  );
}
