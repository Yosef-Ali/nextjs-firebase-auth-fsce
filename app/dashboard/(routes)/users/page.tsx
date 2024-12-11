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
import { Authorization } from '@/lib/authorization';
import { AppUser, UserRole, User } from '@/app/types/user';  // Add User to the import
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
  ShieldCheck,
  ShieldOff,
  Key,
  UserPlus,
  ChevronDown,
  UserIcon,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";
import { withRoleProtection } from '@/app/lib/with-role-protection';

// Add this conversion function at the top level
const convertToAppUser = (user: User): AppUser => {
  // Safely handle metadata timestamps with fallbacks
  const creationTime = user.metadata?.createdAt
    ? new Date(user.metadata.createdAt).toString()
    : new Date().toString();

  const lastSignInTime = user.metadata?.lastLogin
    ? new Date(user.metadata.lastLogin).toString()
    : new Date().toString();

  return {
    ...user,
    emailVerified: false, // Default value
    isAnonymous: false, // Default value
    metadata: {
      creationTime,
      lastSignInTime,
      // Add any other metadata fields needed
    },
    phoneNumber: null,
    photoURL: user.photoURL,
    providerData: [],
    providerId: 'custom',
    refreshToken: '',
    tenantId: null,
    uid: user.uid,
    delete: async () => { throw new Error('Not implemented') },
    getIdToken: async () => '',
    getIdTokenResult: async () => ({ token: '', claims: {}, expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null }),
    reload: async () => { },
    toJSON: () => ({ ...user }),
  } as AppUser;
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

  const authorization = Authorization.getInstance();

  const fetchUsers = useCallback(async () => {
    if (!authUser?.role || authUser.role !== UserRole.ADMIN) {
      return;
    }

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
  }, [authUser?.role]);

  useEffect(() => {
    if (!authLoading && authUser) {
      if (authUser.role === UserRole.ADMIN) {
        fetchUsers();
      }
    }
  }, [authLoading, authUser, fetchUsers]);

  useEffect(() => {
    console.log('Auth User:', authUser);
    console.log('User Data:', userData);
    console.log('Loading:', authLoading);
  }, [authUser, userData, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
          'dev.yosefali@gmail.com',
          email.trim(),
          userRoleToString(selectedRole)
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
      if (!authUser || !authorization.isAdmin(authUser)) {
        toast({
          title: 'Access Denied',
          description: 'Only administrators can manage user roles',
          variant: 'destructive',
        });
        return;
      }

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
    handleResetPassword: async (email: string) => {
      if (!authUser || !authorization.isAdmin(authUser)) {
        toast({
          title: 'Access Denied',
          description: 'Only administrators can reset passwords',
          variant: 'destructive',
        });
        return;
      }

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

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      const isCurrentUser = currentUser?.email === userToDelete;

      const success = await deleteUserService.deleteUserCompletely(userToDelete);

      if (success) {
        if (isCurrentUser) {
          toast({
            title: 'Success',
            description: 'Your account has been completely deleted. You will be logged out.',
          });
          await auth.signOut();
        } else {
          toast({
            title: 'Success',
            description: 'User data has been deleted. Note: The user will need to log in once to complete account deletion.',
          });
        }
        fetchUsers();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete user. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleCloseDialog = () => {
    setShowInviteDialog(false);
    setEmail('');
    setSelectedRole(UserRole.AUTHOR);
    setIsInviting(false);
  };

  // Helper function to convert UserRole enum to string
  const userRoleToString = (role: UserRole): 'user' | 'author' | 'admin' => {
    switch (role) {
      case UserRole.ADMIN:
        return 'admin';
      case UserRole.AUTHOR:
        return 'author';
      default:
        return 'user';
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite User
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((userData) => (
                <TableRow key={userData.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={userData.photoURL || '/default-avatar.png'}
                          alt={userData.displayName || 'User Avatar'}
                        />
                        <AvatarFallback>
                          {userData.displayName
                            ? userData.displayName.charAt(0).toUpperCase()
                            : userData.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{userData.displayName || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{userData.email ?? 'Email not available'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        userData.role === UserRole.ADMIN
                          ? 'default'
                          : userData.role === UserRole.AUTHOR
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {userData.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        userData.role === UserRole.ADMIN
                          ? 'default'
                          : userData.role === UserRole.AUTHOR
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>

                        {authorization.isAdmin(authUser) && (
                          <>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Manage Role
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {userData.role !== UserRole.AUTHOR && (
                                  <DropdownMenuItem onClick={() => operations.handleSetRole(userData.uid, UserRole.AUTHOR)}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Make Author
                                  </DropdownMenuItem>
                                )}
                                {userData.role !== UserRole.ADMIN && (
                                  <DropdownMenuItem onClick={() => operations.handleSetRole(userData.uid, UserRole.ADMIN)}>

                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => operations.handleResetPassword(userData.email ?? '')}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => operations.handleDeleteUser(userData.email ?? '')}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete User</DialogTitle>
              <div className="text-sm text-muted-foreground">
                <div>Are you sure you want to delete {userToDelete}? This action cannot be undone.</div>
                {userToDelete === auth.currentUser?.email && (
                  <div className="mt-2 text-red-500">
                    Warning: You are about to delete your own account. You will be logged out.
                  </div>
                )}
              </div>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Enter the email address and role for the new user.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isInviting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: UserRole) => {
                    console.log('Role selected:', value);
                    setSelectedRole(value);
                  }}
                  disabled={isInviting}
                >
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
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isInviting}
              >
                Cancel
              </Button>
              <Button
                onClick={operations.handleInviteUser}
                disabled={!email || isInviting}
              >
                {isInviting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  'Invite User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Make sure to specify UserRole.ADMIN as a string
export default withRoleProtection(UsersPage, UserRole.ADMIN);
