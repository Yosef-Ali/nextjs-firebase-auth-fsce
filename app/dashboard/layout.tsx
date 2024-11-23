'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardAside from './_components/DashboardAside';
import DashboardHeader from './_components/DashboardHeader';
import { SidebarProvider, useSidebar } from '@/app/context/sidebar-context';
import { SearchProvider } from '@/app/context/search-context';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="relative h-full min-h-screen">
      <DashboardAside />
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "md:pl-[80px]" : "md:pl-72"
      )}>
        <DashboardHeader />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');  // Redirect to home page
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <SearchProvider>
          <DashboardContent>
            {children}
          </DashboardContent>
        </SearchProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}