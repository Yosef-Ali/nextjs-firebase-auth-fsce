'use client';

import { useEffect } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function AuthRedirectHandler() {
  const { toast } = useToast();

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        toast({
          title: "Successfully signed in!",
          description: `Welcome ${result.user.email}`,
        });
      }
    }).catch((error) => {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  return null;
}
