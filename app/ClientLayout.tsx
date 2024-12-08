'use client';

import { AuthProvider } from './lib/firebase/auth-context';
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from './lib/firebase/firebase-config';
import { useToast } from '@/hooks/use-toast';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  useEffect(() => {
    // Check for redirect result
    getRedirectResult(auth).then((result) => {
      if (result) {
        toast({
          title: "Success",
          description: "Successfully signed in with Google",
          variant: "default",
        });
      }
    }).catch((error) => {
      console.error('Redirect error:', error);
      if (error.code !== 'auth/redirect-cancelled-by-user') {
        toast({
          title: "Error",
          description: "Failed to complete sign in",
          variant: "destructive",
        });
      }
    });
  }, []);

  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
