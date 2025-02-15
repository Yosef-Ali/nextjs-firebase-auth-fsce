'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { Skeleton } from "@/components/ui/skeleton";
import {
    MoreHorizontal,
    Shield,
    Trash2,
    Key,
} from 'lucide-react';
import { useUsersListener } from '@/app/hooks/use-users-listener';
import { toast } from '@/hooks/use-toast';
import { AppUser, UserRole, UserStatus } from '@/app/types/user';
import { usersService } from '@/app/services/client/users-service';

export function UsersTable() {
    const { users, isLoading } = useUsersListener();
    const [actionInProgress, setActionInProgress] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleSetRole = async (userId: string, role: UserRole) => {
        if (actionInProgress) return;
        try {
            setActionInProgress(true);
            await usersService.updateUserRole(userId, role);
            toast({
                title: 'Success',
                description: 'User role updated successfully',
            });
        } catch (error) {
            console.error('Error updating user role:', error);
            toast({
                title: 'Error',
                description: 'Failed to update user role',
                variant: 'destructive',
            });
        } finally {
            setActionInProgress(false);
            setOpenDropdown(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (actionInProgress) return;
        try {
            setActionInProgress(true);
            await usersService.deleteUser(userId);
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete user',
                variant: 'destructive',
            });
        } finally {
            setActionInProgress(false);
            setOpenDropdown(null);
        }
    };

    const handleResetPassword = async (email: string) => {
        if (actionInProgress || !email) return;
        try {
            setActionInProgress(true);
            await usersService.resetUserPassword(email);
            toast({
                title: 'Success',
                description: 'Password reset email sent',
            });
        } catch (error) {
            console.error('Error resetting password:', error);
            toast({
                title: 'Error',
                description: 'Failed to send password reset email',
                variant: 'destructive',
            });
        } finally {
            setActionInProgress(false);
            setOpenDropdown(null);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-transparent">
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.uid} className="bg-transparent">
                            <TableCell>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={user.photoURL || ''} />
                                        <AvatarFallback>
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.displayName || 'Unnamed User'}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {user.role.toLowerCase()}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={user.status === UserStatus.ACTIVE ? "default" : "secondary"}
                                    className="capitalize"
                                >
                                    {user.status.toLowerCase()}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu open={openDropdown === user.uid} onOpenChange={(open) => setOpenDropdown(open ? user.uid : null)}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Shield className="mr-2 h-4 w-4" />
                                                Change Role
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                {Object.values(UserRole)
                                                    .filter(role => role !== UserRole.GUEST)
                                                    .map((role) => (
                                                        <DropdownMenuItem
                                                            key={role}
                                                            onClick={() => handleSetRole(user.uid, role)}
                                                            disabled={actionInProgress}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                                                        </DropdownMenuItem>
                                                    ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleResetPassword(user.email || '')}
                                            disabled={actionInProgress || !user.email}
                                        >
                                            <Key className="mr-2 h-4 w-4" />
                                            Reset Password
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteUser(user.uid)}
                                            disabled={actionInProgress}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}