"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function DashboardPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  return null; // No JSX needed as the component only handles redirection
}