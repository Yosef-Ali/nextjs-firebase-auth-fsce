'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/app/context/AuthContext';
import { SidebarProvider } from '@/app/context/sidebar-context';
import { SearchProvider } from '@/app/context/search-context';
import { ProgramOfficesProvider } from '@/app/context/program-offices';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProgramOfficesProvider>
            <SidebarProvider>
              <SearchProvider>
                {children}
                <Toaster />
              </SearchProvider>
            </SidebarProvider>
          </ProgramOfficesProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
