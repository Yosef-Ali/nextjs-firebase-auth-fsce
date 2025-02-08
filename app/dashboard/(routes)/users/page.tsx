'use client';

import { useState, useEffect, FC } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/app/types/user';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { usersService } from '@/app/services/client/users-service';
import { inviteUser, updateUserRole, deleteUser } from '@/app/actions/users-actions';
import { useUsersListener } from '@/app/hooks/use-users-listener';

import UserTable from './_components/UserTable';
import InviteUserDialog from './_components/InviteUserDialog';
import DeleteConfirmDialog from './_components/DeleteConfirmDialog';

const UsersPage: FC = () => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user: authUser, loading: authLoading } = useAuth();
  const { users, isLoading, error } = useUsersListener();

  // Show error toast if listener encounters an error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error]);

  const handleInviteUser = async (email: string, role: UserRole) => {
    try {
      const result = await inviteUser(authUser?.email || '', email.trim(), role);
      if (result.success) {
        toast({
          title: 'Success',
          description: `User invited successfully as ${role}`,
        });
        setShowInviteDialog(false);
        // No need to fetch - real-time listener will update automatically
      } else if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else if (result.existingUser) {
        toast({
          title: 'User Exists',
          description: `User already exists with role: ${result.existingUser.role}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while inviting the user',
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
          description: `User role updated to ${role}`,
        });
        // No need to fetch - real-time listener will update automatically
        return; // Exit early on success to avoid any error toast
      }

      // Only handle errors if the update itself failed
      const details = result.details || {};
      const errorParts = [];

      // Add main error message
      errorParts.push(result.error || 'Failed to update user role');

      // Add context information
      if (details.currentRole) {
        errorParts.push(`Current role: ${details.currentRole}`);
      }
      if (details.targetRole) {
        errorParts.push(`Requested role: ${details.targetRole}`);
      }
      if (details.error) {
        errorParts.push(`Error: ${details.error}`);
      }
      if (details.errorMessage) {
        errorParts.push(`Details: ${details.errorMessage}`);
      }
      if (details.status) {
        errorParts.push(`Status: ${details.status}`);
      }

      const errorMessage = errorParts.join('\n');

      // Log the full error details for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.error('Role update failed:\n' + [
          `Error: ${result.error || 'Unknown error'}`,
          `Details: ${JSON.stringify(details, null, 2)}`,
          `Full Message: ${errorMessage}`
        ].join('\n'));
      } else {
        console.error('Role update failed:', result.error);
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating user role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (uid: string) => {
    setUserToDelete(uid);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      const result = await deleteUser(userToDelete);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
      } else {
        console.error('Failed to delete user:', result.error);
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the user',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await usersService.resetUserPassword(email);
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
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
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
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default UsersPage;
