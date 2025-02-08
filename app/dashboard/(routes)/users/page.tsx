'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/app/types/user';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { inviteUser, updateUserRole, deleteUser, resetUserPassword } from '@/app/actions/users-actions';
import { useUsersListener } from '@/app/hooks/use-users-listener';

import UserTable from './_components/UserTable';
import InviteUserDialog from './_components/InviteUserDialog';
import DeleteConfirmDialog from './_components/DeleteConfirmDialog';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (email: string, role: UserRole) => Promise<void>;
}

const UsersPage = () => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user: currentUser, loading: authLoading } = useAuth();
  const { users, isLoading: usersLoading } = useUsersListener();

  useEffect(() => {
    setIsLoading(authLoading || usersLoading);
  }, [authLoading, usersLoading]);

  const handleInviteUser = async (email: string, role: UserRole) => {
    if (!currentUser?.email) return;

    try {
      const result = await inviteUser(currentUser.email, email, role);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'User invited successfully',
        });
        setShowInviteDialog(false);
      } else if (result.existingUser) {
        toast({
          title: 'Notice',
          description: `User already exists with role: ${result.existingUser.role}`,
          variant: 'default',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite user',
        variant: 'destructive',
      });
    }
  };

  const handleSetRole = async (userId: string, role: UserRole) => {
    try {
      const result = await updateUserRole(userId, role);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'User role updated successfully',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = (uid: string) => {
    setUserToDelete(uid);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteUser(userToDelete);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetUserPassword(email);
      toast({
        title: 'Success',
        description: 'Password reset link sent',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <UserTable
        users={users}
        isLoading={isLoading}
        onDeleteUser={handleDeleteUser}
        onSetRole={handleSetRole}
        onResetPassword={handleResetPassword}
      />

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSubmit={handleInviteUser}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UsersPage;
