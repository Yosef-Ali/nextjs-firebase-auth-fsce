'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './_components/columns';
import { Skeleton } from '@/components/ui/skeleton';
import { User, UserRole, UserStatus } from '@/app/types/user';
import { useUsersListener } from '@/app/hooks/use-users-listener';

export default function UsersPage() {
  const { users, loading } = useUsersListener();

  // Calculate user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === UserStatus.ACTIVE).length;
  const adminUsers = users.filter(user => user.role === UserRole.ADMIN).length;
  const authorUsers = users.filter(user => user.role === UserRole.AUTHOR).length;

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Users Management</h1>
          <Button onClick={() => window.location.href = '/dashboard/users/invite'}>
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Administrators</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{authorUsers}</div>
            <p className="text-xs text-muted-foreground">Authors</p>
          </Card>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            searchKey="email"
            searchPlaceholder="Search users..."
          />
        )}
      </div>
    </div>
  );
}
