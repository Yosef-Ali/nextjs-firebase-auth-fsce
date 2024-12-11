'use client';

import type { Metadata } from "next";
import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/app/providers/AuthProvider';
import { Toaster } from "@/components/ui/toaster"
import AuthRedirectHandler from '@/components/auth/AuthRedirectHandler';
import { useEffect } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <AuthRedirectHandler />
        </AuthProvider>
      </body>
    </html>
  )
}
