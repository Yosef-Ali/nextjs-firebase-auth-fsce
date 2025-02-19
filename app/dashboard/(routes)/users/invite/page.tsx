'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { UserRole } from '@/app/types/user';
import { usersService } from '@/app/services/users';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";

interface InviteUser {
  email: string;
  role: UserRole;
}

export default function InviteUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [isProcessing, setIsProcessing] = useState(false);

  const data: InviteUser[] = [
    {
      email: email,
      role: selectedRole
    }
  ];

  const handleInviteUser = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'You must be logged in to invite users',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Check online status
      if (!navigator.onLine) {
        toast({
          title: 'Offline',
          description: 'You are currently offline. Please check your internet connection and try again.',
          variant: 'destructive',
        });
        return;
      }

      const result = await Promise.race([
        usersService.inviteUser(user.email, email, selectedRole),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Invitation sent successfully',
        });
        router.push('/dashboard/users');
      } else if (result.existingUser) {
        toast({
          title: 'User Exists',
          description: `User already exists with role: ${result.existingUser.role}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      const errorMessage = error instanceof Error && error.message.includes('timeout')
        ? 'Connection timeout. Please check your internet connection and try again.'
        : 'Failed to send invitation. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Invite User</h2>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Send Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            columns={columns}
            data={data}
            searchKey="email"
          />
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              User Role
            </label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
              disabled={isProcessing}
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

          <div className="flex justify-end pt-4 space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/users')}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={isProcessing || !email}>
                  {isProcessing ? 'Sending Invitation...' : 'Send Invitation'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Invitation</DialogTitle>
                  <p>Are you sure you want to send an invitation to {email} with {selectedRole} role?</p>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleInviteUser}>
                      Confirm
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
