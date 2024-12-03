'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import {
  LayoutDashboard,
  BookOpenIcon,
  ImageIcon,
  Settings,
  TagIcon,
  Users,
  BarChart,
  FileText,
  ChevronLeft,
  Archive,
  Users2,
  FolderTree,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/app/context/sidebar-context';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
} from '@/components/ui/tooltip';

const DashboardAside = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/dashboard/posts',
      label: 'Posts',
      icon: BookOpenIcon,
    },
    {
      href: '/dashboard/about',
      label: 'About',
      icon: FileText,
    },
    {
      href: '/dashboard/categories',
      label: 'Categories',
      icon: TagIcon,
    },
    {
      href: '/dashboard/pages',
      label: 'Pages',
      icon: FileText,
    },
    {
      href: '/dashboard/resources',
      label: 'Resources',
      icon: Archive,
    },
    {
      href: '/dashboard/media-library',
      label: 'Media Library',
      icon: Image,
    },
    {
      href: '/dashboard/board-members',
      label: 'Board Members',
      icon: Users2,
    },
    {
      href: '/dashboard/analytics',
      label: 'Analytics',
      icon: BarChart,
    },
    {
      href: '/dashboard/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const link = (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active 
            ? 'bg-primary/10 text-primary' 
            : 'text-gray-600 hover:bg-gray-100',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className={cn(
          'h-5 w-5',
          active ? 'text-primary' : 'text-gray-400'
        )} />
        {!isCollapsed && item.label}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.href} delayDuration={0}>
          <TooltipTrigger asChild>
            {link}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-normal">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <aside className="relative">
      <div className={cn(
        "flex flex-col h-full border-r bg-white transition-all duration-300 fixed inset-y-0 z-20",
        isCollapsed ? "w-[80px]" : "w-72"
      )}>
        <div className="flex h-16 items-center px-4 border-b">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold bg-primary/10 text-primary px-3 py-1 rounded">B</span>
              <span className="ml-2 font-semibold">Blog</span>
            </Link>
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map(renderMenuItem)}
          </nav>

          <div className="mt-auto pt-4">
            {!isCollapsed && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Administrator
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating collapse button */}
      <div className="fixed bottom-[170px] z-30" style={{ 
        left: isCollapsed ? 'calc(60px + 2px)' : 'calc(256px + 14px)'
      }}>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "h-8 w-8 rounded-full shadow-md border border-gray-200 bg-white",
                "hover:bg-gray-100 hover:shadow-lg transition-all duration-200"
              )}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )} />
              <span className="sr-only">
                {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
};

export default DashboardAside;
