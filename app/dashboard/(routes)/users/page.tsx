'use client';
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

  return (
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
    </div>
  );
}
