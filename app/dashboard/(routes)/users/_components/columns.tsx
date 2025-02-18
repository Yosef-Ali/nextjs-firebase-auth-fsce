'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User, UserRole, UserStatus } from '@/app/types/user';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTableRowActions } from '@/components/ui/data-table-row-actions';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.displayName || 'No name'}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge variant={role === UserRole.ADMIN ? 'destructive' : 'default'}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === UserStatus.ACTIVE ? 'default' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => {
      const rawDate = row.original.createdAt as Timestamp | number | string | undefined;
      let date: Date | null = null;

      if (rawDate instanceof Timestamp) {
        date = rawDate.toDate();
      } else if (typeof rawDate === 'number') {
        date = new Date(rawDate);
      } else if (typeof rawDate === 'string') {
        date = new Date(rawDate);
      }

      if (!date || isNaN(date.getTime())) {
        return <div className="text-sm text-muted-foreground">N/A</div>;
      }

      return (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(date, { addSuffix: true })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DataTableRowActions
          row={row}
          actions={[
            {
              label: 'Edit',
              onClick: () => {
                // Dispatch edit event directly instead of navigating
                const event = new CustomEvent('edit-user', { detail: user.id });
                document.dispatchEvent(event);
              },
            },
            {
              label: 'Delete User',
              onClick: () => {
                document.dispatchEvent(
                  new CustomEvent('delete-user', { detail: user.id })
                );
              },
            },
          ]}
        />
      );
    },
  },
];
