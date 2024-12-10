'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  User as UserIcon,
  Settings,
  LogOut,
  Home,
  Users,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { useCallback } from 'react';
import Link from 'next/link';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const DashboardOverviewHeader = () => {
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === 'admin';

  const quickActions: QuickAction[] = [
    { icon: <FileText className="h-4 w-4" />, label: 'New Post', href: '/dashboard/posts/new' },
    { icon: <Users className="h-4 w-4" />, label: 'Manage Users', href: '/dashboard/users' },
    { icon: <ImageIcon className="h-4 w-4" />, label: 'Media Library', href: '/dashboard/media-library' },
  ];

  const notifications = [
    { id: 1, text: 'New user registration', time: '5m ago', type: 'user' },
    { id: 2, text: 'Storage usage at 75%', time: '1h ago', type: 'system' },
    { id: 3, text: 'Weekly backup completed', time: '1d ago', type: 'system' },
  ];

  const getNotificationColor = useCallback((type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-500';
      case 'system':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  }, []);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.displayName || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your {isAdmin ? 'system' : 'account'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Recent Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start py-2">
                  <span className={getNotificationColor(notification.type)}>{notification.text}</span>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.displayName}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                {action.icon}
                <span>{action.label}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverviewHeader;
