'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardAside from './_components/DashboardAside';
import DashboardHeader from './_components/DashboardHeader';
import { SidebarProvider, useSidebar } from '@/app/context/sidebar-context';
import { SearchProvider } from '@/app/context/search-context';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/app/types/user';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userData && userData.role !== UserRole.ADMIN && userData.role !== UserRole.AUTHOR) {
      router.replace('/unauthorized');
    }
  }, [userData, loading, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>;
  }

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
  return (
    <AuthProvider>
      <ProtectedRoute>
        <TooltipProvider>
          <SidebarProvider>
            <SearchProvider>
              <DashboardContent>{children}</DashboardContent>
            </SearchProvider>
          </SidebarProvider>
        </TooltipProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}