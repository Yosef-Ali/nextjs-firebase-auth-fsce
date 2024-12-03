'use client';

import { useState, useEffect } from 'react';
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
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldOff, 
  Key,
  UserPlus 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Authorization } from '@/app/lib/authorization';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
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

  const handleSetAdmin = async (userId: string) => {
    try {
      await usersService.setAdminRole(userId);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: 'admin' } : u
      ));
      toast({
        title: 'Success',
        description: 'User role updated to admin',
      });
    } catch (error) {
      console.error('Error setting admin role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    try {
      await usersService.createOrUpdateUser(userId, { role: 'user' });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: 'user' } : u
      ));
      toast({
        title: 'Success',
        description: 'User role updated to user',
      });
    } catch (error) {
      console.error('Error removing admin role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await usersService.suspendUser(userId);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: 'suspended' } : u
      ));
      toast({
        title: 'User Suspended',
        description: 'User has been suspended',
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: 'Error',
        description: 'Failed to suspend user',
        variant: 'destructive',
      });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await usersService.activateUser(userId);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: 'active' } : u
      ));
      toast({
        title: 'User Activated',
        description: 'User has been activated',
      });
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate user',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await usersService.resetUserPassword(email);
      toast({
        title: 'Password Reset',
        description: 'Password reset link sent to user',
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: 'User Deleted',
        description: 'User has been permanently deleted',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleInviteAuthor = async () => {
    if (!user || !Authorization.isAdmin(user)) {
      toast({
        title: 'Unauthorized',
        description: 'Only admin can invite authors',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!user.email || !inviteEmail) {
        toast({
          title: 'Error',
          description: 'Email information is missing',
          variant: 'destructive',
        });
        return;
      }

      const { success, token } = await usersService.inviteAuthor(
        user.email,
        inviteEmail
      );

      if (success) {
        toast({
          title: 'Author Invited',
          description: `Invitation sent to ${inviteEmail}`,
        });
        
        // Optionally, refresh users list or add the new invited user
        setIsInviteDialogOpen(false);
        setInviteEmail('');
      } else {
        toast({
          title: 'Invitation Failed',
          description: 'Could not invite author. User might already be an author.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error inviting author:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite author',
        variant: 'destructive',
      });
    }
  };

  const handleSetAuthorRole = async (userEmail: string) => {
    if (!user || !Authorization.isAdmin(user) || !user.email) {
      toast({
        title: 'Unauthorized',
        description: 'Only admin can set author role',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await usersService.setAuthorRole(
        user.email,
        userEmail
      );

      if (success) {
        toast({
          title: 'Author Role Assigned',
          description: `${userEmail} is now an author`,
        });
        // Optionally refresh users list
        fetchUsers();
      } else {
        toast({
          title: 'Role Assignment Failed',
          description: 'Could not set author role',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error setting author role:', error);
      toast({
        title: 'Error',
        description: 'Failed to set author role',
        variant: 'destructive',
      });
    }
  };

  if (!user || !Authorization.isAdmin(user)) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Access Denied: Admin privileges required</p>
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
        {Authorization.isAdmin(user) && (
          <Button 
            onClick={() => setIsInviteDialogOpen(true)}
            variant="outline"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invite Author
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
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
                  variant={userData.role === 'admin' ? 'default' : 'secondary'}
                >
                  {userData.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={userData.status === 'suspended' ? 'destructive' : 'outline'}
                >
                  {userData.status || 'active'}
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
                    
                    {/* Role Management */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Manage Role
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {userData.role !== 'admin' && (
                          <DropdownMenuItem 
                            onClick={() => handleSetAdmin(userData.id)}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Set as Admin
                          </DropdownMenuItem>
                        )}
                        {userData.role === 'admin' && (
                          <DropdownMenuItem 
                            onClick={() => handleRemoveAdmin(userData.id)}
                          >
                            <ShieldOff className="mr-2 h-4 w-4" />
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                        {userData.role !== 'author' && (
                          <DropdownMenuItem 
                            onClick={() => handleSetAuthorRole(userData.email)}
                            className="text-green-600 focus:bg-green-50"
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" /> 
                            Make Author
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {/* User Status */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        {userData.status === 'suspended' ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                        Manage Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {userData.status !== 'suspended' && (
                          <DropdownMenuItem 
                            onClick={() => handleSuspendUser(userData.id)}
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        )}
                        {userData.status === 'suspended' && (
                          <DropdownMenuItem 
                            onClick={() => handleActivateUser(userData.id)}
                          >
                            <Unlock className="mr-2 h-4 w-4" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />

                    {/* Other Actions */}
                    <DropdownMenuItem 
                      onClick={() => handleResetPassword(userData.email)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Reset Password
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => {
                        setSelectedUser(userData);
                        // Trigger delete confirmation dialog
                      }}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user {selectedUser?.email}. 
              This action cannot be undone and will remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Author Invitation Dialog */}
      <Dialog 
        open={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Author</DialogTitle>
            <DialogDescription>
              Send an invitation to become an author in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                placeholder="author@example.com"
                className="col-span-3"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleInviteAuthor}
              disabled={!inviteEmail}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
