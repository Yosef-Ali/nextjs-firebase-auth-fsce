'use client';
<<<<<<< HEAD

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
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usersService } from '@/app/services/users';

export default function UsersPage() {
  const router = useRouter();
  const { users, isLoading } = useUsersListener();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
=======
import { useCallback, useEffect, useState } from "react";
import { userCoreService } from "@/app/services/users/core";
import { AppUser, UserRole } from "@/app/types/user";
import { toast } from "@/hooks/use-toast";
import UserTable from "./_components/UserTable";
import { UserEditDialog } from "./_components/UserEditDialog";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userCoreService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (uid: string) => {
    try {
      setUpdatingUser(uid);
      await userCoreService.deleteUser(uid);
      setUsers(users.filter(user => user.uid !== uid));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      await fetchUsers();
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleSetRole = async (userId: string, role: UserRole) => {
    try {
      setUpdatingUser(userId);
      await userCoreService.updateUserRole(userId, role);
      setUsers(users.map(user =>
        user.uid === userId
          ? { ...user, role }
          : user
      ));
      toast({
        title: "Success",
        description: `User role updated to ${role}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await userCoreService.resetPassword(email);
      toast({
        title: "Success",
        description: "Password reset email sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: AppUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (userId: string, userData: Partial<AppUser>) => {
    try {
      setUpdatingUser(userId);
      await userCoreService.updateUser(userId, userData);
      await fetchUsers();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred while updating the user";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Re-fetch users to ensure UI is in sync with backend
      await fetchUsers();
    } finally {
      setUpdatingUser(null);
    }
  };

  useEffect(() => {
    const handleEditUser = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setSelectedUserId(customEvent.detail);
      setIsEditorOpen(true);
    };

    const handleDeleteUser = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setUserToDelete(customEvent.detail);
      setIsDeleteDialogOpen(true);
    };

    document.addEventListener('edit-user', handleEditUser);
    document.addEventListener('delete-user', handleDeleteUser);

    return () => {
      document.removeEventListener('edit-user', handleEditUser);
      document.removeEventListener('delete-user', handleDeleteUser);
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await usersService.deleteUser(userToDelete);
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleInviteClick = () => {
    router.push('/dashboard/users/invite');
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedUserId(null);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const userToDeleteDetails = users.find(u => u.id === userToDelete);

  return (
<<<<<<< HEAD
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {userToDeleteDetails?.displayName || userToDeleteDetails?.email}? This action cannot be undone.
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
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
=======
    <div className="space-y-4">
      <UserTable
        users={users}
        isLoading={isLoading}
        updatingUserId={updatingUser}
        onDeleteUser={handleDeleteUser}
        onSetRole={handleSetRole}
        onResetPassword={handleResetPassword}
        onEdit={handleEditUser}
      />
      
      <UserEditDialog
        user={selectedUser}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleUpdateUser}
      />
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511
    </div>
  );
}
