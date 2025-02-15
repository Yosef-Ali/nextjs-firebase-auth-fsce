'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/lib/context/auth-context';
import DashboardAside from './_components/DashboardAside';
import DashboardHeader from './_components/DashboardHeader';
import { SidebarProvider, useSidebar } from '@/app/context/sidebar-context';
import { SearchProvider } from '@/app/context/search-context';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/app/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { UserStatus } from '@/app/types/user';
import { authorization, UserRole } from '@/lib/authorization';
import { LoadingScreen } from '@/components/loading-screen';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      if (!userData) {
        router.push('/sign-in');
        return;
      }

      if (userData.status !== UserStatus.ACTIVE) {
        router.push('/pending-approval');
        return;
      }

      // Ensure user has minimum required role for dashboard access
      const hasAccess = authorization.canAccess(
        authorization.createContext(user),
        UserRole.AUTHOR
      );
      if (!hasAccess) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="relative h-full min-h-screen">
      <DashboardAside />
      <div className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "pl-[80px]" : "pl-[270px]"
      )}>
        <DashboardHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <SearchProvider>
          <TooltipProvider>
            <DashboardContent>
              {children}
            </DashboardContent>
          </TooltipProvider>
        </SearchProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default DashboardLayout;
