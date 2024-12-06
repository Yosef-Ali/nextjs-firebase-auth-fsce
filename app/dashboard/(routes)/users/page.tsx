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

  const handleDeleteUser = async (userId: string) => {
    if (!user || !Authorization.isAdmin(user)) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can delete users',
        variant: 'destructive',
      });
      return;
    }

    try {
      await usersService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: 'Success',
        description: 'User has been deleted',
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
                          onClick={() => handleDeleteUser(userData.id)}
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
