'use client';

import { FC, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { AppUser, UserRole } from '@/app/types/user';

interface UserTableProps {
  users: AppUser[];
  isLoading: boolean;
  onDeleteUser: (uid: string) => void;
  onSetRole: (userId: string, role: UserRole) => void;
  onResetPassword: (email: string) => void;
}

const UserTable: FC<UserTableProps> = ({
  users,
  isLoading,
  onDeleteUser,
  onSetRole,
  onResetPassword
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    if (actionInProgress) return;

    try {
      setActionInProgress(true);
      await action();
    } finally {
      setActionInProgress(false);
      setOpenDropdown(null);
    }
  };

  return (
    <div className="border rounded-md">
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
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
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
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu open={openDropdown === user.uid} onOpenChange={(open) => {
                    setOpenDropdown(open ? user.uid : null);
                  }}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-8 h-8 p-0"
                        disabled={actionInProgress}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Shield className="w-4 h-4 mr-2" />
                          <span>Change Role</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={() => handleAction(async () => {
                              await onSetRole(user.uid, UserRole.USER);
                            })}
                          >
                            <UserIcon className="w-4 h-4 mr-2" />
                            <span>User</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction(async () => {
                              await onSetRole(user.uid, UserRole.AUTHOR);
                            })}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            <span>Author</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction(async () => {
                              await onSetRole(user.uid, UserRole.ADMIN);
                            })}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            <span>Admin</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuItem
                        onClick={() => user.email && handleAction(async () => {
                          await onResetPassword(user.email!);
                        })}
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        <span>Reset Password</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAction(async () => {
                          await onDeleteUser(user.uid);
                        })}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
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
  );
};

export default UserTable;