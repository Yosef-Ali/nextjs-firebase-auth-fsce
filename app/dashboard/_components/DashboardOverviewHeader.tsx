'use client';

import { useAuthContext } from '@/lib/firebase/context';
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
  const { userData, user } = useAuthContext();
  const isAdmin = userData?.role === 'admin';

  const quickActions: QuickAction[] = [
    { icon: <FileText className="h-4 w-4" />, label: 'New Post', href: '/dashboard/posts/new' },
    ...(isAdmin ? [{ icon: <Users className="h-4 w-4" />, label: 'Manage Users', href: '/dashboard/users' }] : []),
  ];

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Welcome, {userData?.displayName || 'User'}</h2>
          <p className="text-muted-foreground">Manage your content and settings</p>
        </div>
        <div className="flex items-center gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button variant="outline" size="sm">
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DashboardOverviewHeader;
