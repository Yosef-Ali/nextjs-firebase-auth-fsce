'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './_components/columns';
import { useUsersListener } from '@/app/hooks/use-users-listener';
import { toast } from '@/hooks/use-toast';
import { UserRole, UserStatus } from '@/app/types/user';
import { UserEditor } from './_components/UserEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usersService } from '@/app/services/users';
import { useAuth } from '@/lib/hooks/useAuth';

export default function UsersPage() {
  const router = useRouter();
  const { userData, loading: authLoading } = useAuth();
  const { users, isLoading } = useUsersListener();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!authLoading && userData && userData.role !== UserRole.ADMIN && userData.role !== UserRole.SUPER_ADMIN) {
      router.replace('/unauthorized');
    }
  }, [userData, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!userData || (userData.role !== UserRole.ADMIN && userData.role !== UserRole.SUPER_ADMIN)) {
    return null;
  }

  // Calculate user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === UserStatus.ACTIVE).length;
  const adminUsers = users.filter(user => user.role === UserRole.ADMIN).length;
  const authorUsers = users.filter(user => user.role === UserRole.AUTHOR).length;

  const handleDelete = async (userId: string) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await usersService.deleteUser(userId);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Users</h1>
          <Button onClick={() => setIsEditorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
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
          <DataTable
            columns={columns}
            data={users}
            searchKey="email"
          />
        </Card>
      </div>

      {/* User Editor Dialog */}
      <UserEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        userId={selectedUserId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => userToDelete && handleDelete(userToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
