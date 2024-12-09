'use client';

import type { Metadata } from "next";
import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './lib/firebase/auth-context';
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from './lib/firebase/firebase-config';
import { useToast } from '@/hooks/use-toast';

const inter = Inter({ subsets: ['latin'] })

// Remove metadata export as this is a client component.
// export const metadata: Metadata = {
//   title: 'FSCE - Foundation for Social Care and Empowerment',
//   description: 'FSCE is an Ethiopian resident charity organization working on child protection and empowerment.',
// }

export default function RootLayout({
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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
