'use client';

import { useState, useEffect, useCallback, FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usersService } from '@/app/services/users';
import { deleteUserService } from '@/app/services/deleteUser';
import { useAuth } from '@/lib/hooks/useAuth';
import { AppUser, UserRole, User } from '@/app/types/user';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Lock,
  Unlock,
  UserPlus,
  Mail,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";

// Add this conversion function at the top level
const convertToAppUser = (user: User): AppUser => {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    role: user.role || UserRole.USER,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    invitedBy: user.invitedBy,
    invitationToken: user.invitationToken,
    emailVerified: user.emailVerified || false,
    isAnonymous: user.isAnonymous || false,
    providerData: user.providerData || [],
    metadata: user.metadata || {
      lastLogin: Date.now(),
      createdAt: Date.now()
    },
    lastLogin: user.lastLogin || Date.now(),
  };
};

interface PageProps {
  // Add any specific props if needed
}

const UsersPage: FC<PageProps> = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.AUTHOR);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [existingUser, setExistingUser] = useState<{ email: string; role: UserRole } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { user: authUser, loading: authLoading, userData } = useAuth() as { user: AppUser | null; loading: boolean; userData: any };

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await usersService.getAllUsers();
      // Convert User[] to AppUser[]
      const appUsers = fetchedUsers.map(convertToAppUser);
      setUsers(appUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && authUser) {
      fetchUsers();
    }
  }, [authLoading, authUser, fetchUsers]);

  const handleCloseDialog = () => {
    setShowInviteDialog(false);
    setEmail('');
    setSelectedRole(UserRole.AUTHOR);
    setExistingUser(null);
  };

  const operations = {
    handleInviteUser: async () => {
      if (!email || !selectedRole) {
        toast({
          title: 'Error',
          description: 'Please provide both email and role',
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsInviting(true);
        console.log('Inviting user with email:', email, 'and role:', selectedRole);

        const result = await usersService.inviteUser(
          authUser?.email || '',
          email.trim(),
          selectedRole
        );

        if (result.success) {
          toast({
            title: 'Success',
            description: `User invited successfully as ${selectedRole}`,
          });
          handleCloseDialog();
          fetchUsers();
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
      } finally {
        setIsInviting(false);
      }
    },
    handleSetRole: async (userId: string, role: UserRole) => {
      try {
        // Get the user's email first
        const targetUser = users.find(u => u.uid === userId);
        if (!targetUser) {
          toast({
            title: 'Error',
            description: 'User not found',
            variant: 'destructive',
          });
          return;
        }

        // Update the role using the correct method signature
        try {
          await usersService.updateUserRole(userId, role);
          toast({
            title: 'Success',
            description: `User role updated to ${role}`,
          });
          // Refresh the users list
          fetchUsers();
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to update user role',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error updating role:', error);
        toast({
          title: 'Error',
          description: 'Failed to update user role',
          variant: 'destructive',
        });
      }
    },
    handleDeleteUser: async (email: string) => {
      setUserToDelete(email);
      setDeleteDialogOpen(true);
    },
    handleConfirmDelete: async () => {
      if (!userToDelete) return;

      try {
        await deleteUserService.deleteUser(userToDelete);
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive',
        });
      } finally {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    },
    handleResetPassword: async (email: string) => {
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : (
              users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.displayName || 'No name'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === UserRole.ADMIN ? 'destructive' : 'default'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Change Role</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => operations.handleSetRole(user.uid, UserRole.USER)}>
                              <UserIcon className="mr-2 h-4 w-4" />
                              <span>User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => operations.handleSetRole(user.uid, UserRole.AUTHOR)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Author</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => operations.handleSetRole(user.uid, UserRole.ADMIN)}>
                              <Lock className="mr-2 h-4 w-4" />
                              <span>Admin</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuItem onClick={() => operations.handleResetPassword(user.email)}>
                          <Unlock className="mr-2 h-4 w-4" />
                          <span>Reset Password</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => operations.handleDeleteUser(user.email)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete User</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new user to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter user's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.USER}>User</SelectItem>
                  <SelectItem value={UserRole.AUTHOR}>Author</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={operations.handleInviteUser} disabled={isInviting}>
              {isInviting ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={operations.handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UsersPage;
