import type { Metadata } from "next";
import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './lib/firebase/auth-context';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FSCE - Foundation for Social Care and Empowerment',
  description: 'FSCE is an Ethiopian resident charity organization working on child protection and empowerment.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
