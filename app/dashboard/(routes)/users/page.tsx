'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './_components/columns';
import { Skeleton } from '@/components/ui/skeleton';
import { User, UserRole, UserStatus } from '@/app/types/user';
import { useUsersListener } from '@/app/hooks/use-users-listener';
import { UserEditor } from './_components/UserEditor';

export default function UsersPage() {
  const router = useRouter();
  const { users, isLoading } = useUsersListener();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Calculate user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === UserStatus.ACTIVE).length;
  const adminUsers = users.filter(user => user.role === UserRole.ADMIN).length;
  const authorUsers = users.filter(user => user.role === UserRole.AUTHOR).length;

  useEffect(() => {
    const handleEditUser = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setSelectedUserId(customEvent.detail);
      setIsEditorOpen(true);
    };

    document.addEventListener('edit-user', handleEditUser);
    return () => {
      document.removeEventListener('edit-user', handleEditUser);
    };
  }, []);

  const handleInviteClick = () => {
    router.push('/dashboard/users/invite');
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedUserId(null);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Users Management</h1>
          <Button onClick={handleInviteClick}>
            <Plus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="p-6">
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-2xl font-bold">{adminUsers}</div>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="text-2xl font-bold">{authorUsers}</div>
              <p className="text-xs text-muted-foreground">Authors</p>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="p-6">
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <DataTable
                columns={columns}
                data={users}
                searchKey="email"
              />
            )}
          </div>
        </Card>

        {/* Edit Dialog */}
        {selectedUser && (
          <UserEditor
            user={selectedUser}
            isOpen={isEditorOpen}
            onClose={handleEditorClose}
          />
        )}
      </div>
    </div>
  );
}
