'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/app/types/user';
import { usersService } from '@/app/services/users';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export default function InviteUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [isProcessing, setIsProcessing] = useState(false);

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
      const result = await usersService.inviteUser(user.email, email, selectedRole);
      
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
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send invitation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Invite User</h2>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Send Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/users')}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={isProcessing || !email}
            >
              {isProcessing ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}