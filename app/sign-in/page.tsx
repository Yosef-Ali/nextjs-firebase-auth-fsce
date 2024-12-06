'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { SignInForm } from '@/app/_components/SignInForm';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useAuth } from '@/app/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/app/lib/firebase/user-service';

function SignInContent() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  React.useEffect(() => {
    async function checkUserStatus() {
      if (!loading && user) {
        const userData = await getUserData(user);
        
        if (!userData) {
          router.push('/pending-approval');
          return;
        }

        switch (userData.status) {
          case 'pending':
            router.push('/pending-approval');
            break;
          case 'suspended':
            router.push('/unauthorized');
            break;
          case 'active':
            if (userData.role === 'admin' || userData.role === 'author') {
              router.push(callbackUrl || '/dashboard/posts');
            } else {
              router.push('/unauthorized');
            }
            break;
          default:
            router.push('/pending-approval');
        }
      }
    }
    checkUserStatus();
  }, [user, loading, router, callbackUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-[#1e3a8a] opacity-80" />
        <div className="absolute inset-0">
          <Image
            src="/images/fsce-achieves-91-percent-target.jpeg"
            alt="FSCE Achievement"
            layout="fill"
            objectFit="cover"
            quality={100}
            priority
          />
        </div>
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
              Welcome to FSCE Admin Portal. Please sign in to continue.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">FSCE Authentication</h1>
            <p className="text-sm text-muted-foreground">Sign in to access your dashboard</p>
            <p className="text-sm text-red-500 italic">* For authorized users only</p>
          </div>
          <SignInForm callbackUrl={callbackUrl || undefined} />
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return <SignInContent />;
}
