'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { SignInForm } from '@/app/_components/SignInForm';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

function SignInContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  React.useEffect(() => {
    if (user && !loading) {
      router.replace(callbackUrl || '/dashboard');
    }
  }, [user, loading, router, callbackUrl]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // If we have a user, don't render the form while redirecting
  if (user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/Logo.svg"
            alt="FSCE Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          FSCE Admin
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Welcome to FSCE Admin Portal. Please sign in to continue.&rdquo;
            </p>
            <footer className="text-sm">FSCE Admin</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              FSCE Authentication
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your dashboard
            </p>
            <p className="text-sm text-red-500 italic">* For authorized users only</p>
          </div>
          <SignInForm callbackUrl={callbackUrl || undefined} />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return <SignInContent />;
}
