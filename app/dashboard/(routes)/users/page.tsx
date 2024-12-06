'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '@/app/hooks/useAuth';
import { User } from '@/app/types/user';
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
import { Authorization } from '@/app/lib/authorization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'author' | 'admin'>('author');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [existingUser, setExistingUser] = useState<{ email: string; role: string } | null>(null);
  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // First, update user roles based on admin emails
      await usersService.updateUserRoleBasedOnAdminEmails();
      
      const fetchedUsers = await usersService.getAllUsers();
      setUsers(fetchedUsers);
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
  };

  useEffect(() => {
    // Only allow admin to view all users
    if (Authorization.isAdmin(user)) {
      fetchUsers();
    }
  }, [user]);

  const handleSetRole = async (userId: string, role: 'admin' | 'author') => {
    if (!user || !Authorization.isAdmin(user)) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can manage user roles',
        variant: 'destructive',
      });
      return;
    }

    try {
      await usersService.createOrUpdateUser(userId, { role });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role } : u
      ));
      toast({
        title: 'Success',
        description: `User role updated to ${role}`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!user || !Authorization.isAdmin(user)) {
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
  };

  const handleDeleteUser = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Show confirmation dialog
      if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
        return;
      }

      const success = await usersService.deleteUser(email);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'User has been completely deleted from the system',
        });
        // Refresh the users list
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
    }
  };

  const handleCloseDialog = () => {
    setShowInviteDialog(false);
    setEmail('');
    setSelectedRole('author');
    setIsInviting(false);
  };

  const handleInviteUser = async () => {
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
      } else {
        toast({
          title: 'Error',
          description: 'Failed to invite user',
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
  };

  // Only show the management interface to admins
  if (!user || !Authorization.isAdmin(user)) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-lg">Access Denied: Only administrators can manage users</p>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((userData) => (
            <TableRow key={userData.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage 
                    src={userData.photoURL || '/default-avatar.png'} 
                    alt={userData.displayName || 'User Avatar'} 
                  />
                  <AvatarFallback>
                    {userData.displayName 
                      ? userData.displayName.charAt(0).toUpperCase() 
                      : userData.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{userData.displayName || 'N/A'}</TableCell>
              <TableCell>{userData.email}</TableCell>
              <TableCell>
                <Badge 
                  variant={
                    userData.role === 'admin' 
                      ? 'default' 
                      : userData.role === 'author' 
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {userData.role}
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
                    <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                    
                    {Authorization.isAdmin(user) && (
                      <>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Manage Role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {userData.role !== 'author' && (
                              <DropdownMenuItem 
                                onClick={() => handleSetRole(userData.id, 'author')}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" /> 
                                Make Author
                              </DropdownMenuItem>
                            )}
                            {userData.role !== 'admin' && (
                              <DropdownMenuItem 
                                onClick={() => handleSetRole(userData.id, 'admin')}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem 
                          onClick={() => handleResetPassword(userData.email)}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteUser(userData.email)}
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
          ))}
        </TableBody>
      </Table>

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
                onValueChange={(value: 'user' | 'author' | 'admin') => {
                  console.log('Role selected:', value);
                  setSelectedRole(value);
                }}
                disabled={isInviting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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
              onClick={handleInviteUser}
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
  );
}
