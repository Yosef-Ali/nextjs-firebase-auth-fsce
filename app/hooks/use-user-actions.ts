'use client';

import { useState } from 'react';
import { UserRole, User } from '@/app/types/user';
import { usersService } from '@/app/services/users';
import { useToast } from '@/hooks/use-toast';

// Hook for managing user role updates
export function useUserRoleManager() {
    const [updating, setUpdating] = useState(false);
    const { toast } = useToast();

    const updateRole = async (userId: string, role: UserRole) => {
        setUpdating(true);
        try {
            await usersService.updateUserRole(userId, role);
            toast({
                title: "Success",
                description: `User role updated to ${role}`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user role",
                variant: "destructive",
            });
            throw error;
        } finally {
            setUpdating(false);
        }
    };

    return { updateRole, updating };
}

// Hook for managing user invitations
export function useUserInvitation() {
    const [inviting, setInviting] = useState(false);
    const { toast } = useToast();

    const inviteUser = async (adminEmail: string, targetEmail: string, role: UserRole) => {
        setInviting(true);
        try {
            const result = await usersService.inviteUser(adminEmail, targetEmail, role);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "User invited successfully",
                });
            } else if (result.existingUser) {
                toast({
                    title: "Notice",
                    description: `User already exists with role ${result.existingUser.role}`,
                });
            }
            return result;
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to invite user",
                variant: "destructive",
            });
            throw error;
        } finally {
            setInviting(false);
        }
    };

    return { inviteUser, inviting };
}

// Hook for managing user deletion
export function useUserDeletion() {
    const [deleting, setDeleting] = useState(false);
    const { toast } = useToast();

    const deleteUser = async (userId: string) => {
        setDeleting(true);
        try {
            await usersService.deleteUser(userId);
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
            throw error;
        } finally {
            setDeleting(false);
        }
    };

    return { deleteUser, deleting };
}

// Hook for managing password resets
export function usePasswordReset() {
    const [resetting, setResetting] = useState(false);
    const { toast } = useToast();

    const resetPassword = async (email: string) => {
        setResetting(true);
        try {
            await usersService.resetUserPassword(email);
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
            throw error;
        } finally {
            setResetting(false);
        }
    };

    return { resetPassword, resetting };
}