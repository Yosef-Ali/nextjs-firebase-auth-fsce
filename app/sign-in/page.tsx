'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/hooks/use-auth';
import { useEffect, Suspense } from 'react';
import { SignInForm } from '@/components/auth/sign-in-form';
import { AuthLoading } from '@/components/auth/auth-loading';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/dashboard';

  useEffect(() => {
    if (user && !loading) {
      router.replace(callbackUrl);
    }
  }, [user, loading, router, callbackUrl]);

  if (loading) {
    return <AuthLoading />;
  }

  if (user) {
    return <AuthLoading message="Redirecting to dashboard..." />;
  }

  return (
    <div className="relative min-h-screen">
      <SignInForm />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <SignInContent />
    </Suspense>
  );
}
