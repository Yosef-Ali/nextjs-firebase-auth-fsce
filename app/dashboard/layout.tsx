'use client';

import DashboardAside from './_components/DashboardAside';
import DashboardHeader from './_components/DashboardHeader';
import { useSidebar } from '@/app/context/sidebar-context';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <>
      <DashboardAside />
      <div className={cn(
        "flex flex-col flex-1",
        isCollapsed ? "ml-[70px]" : "ml-[240px]"
      )}>
        <DashboardHeader />
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <DashboardContent>{children}</DashboardContent>
      </div>
    </TooltipProvider>
  );
}