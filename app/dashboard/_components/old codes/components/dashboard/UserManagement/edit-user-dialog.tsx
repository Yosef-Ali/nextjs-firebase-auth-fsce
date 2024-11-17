import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole, UserStatus } from '@/types';

type EditUserDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  userData: User;
};

export default function EditUserDialog({ isOpen, onClose, userData }: EditUserDialogProps) {
  const [role, setRole] = useState<UserRole>((userData.role ?? "user") as UserRole);
  const [status, setStatus] = useState<UserStatus>(userData.active ?? "inactive");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useMutation(api.users.updateUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateUser({
        _id: userData._id,
        role,
        active: status,
      });
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="org:admin">Org Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as UserStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}