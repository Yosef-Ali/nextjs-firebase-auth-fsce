'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { AuthLoading } from '@/components/auth/auth-loading';

export default function SignUpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <AuthLoading />;
  }

  if (user) {
    return <AuthLoading message="Redirecting to dashboard..." />;
  }

  return <SignUpForm />;
}
