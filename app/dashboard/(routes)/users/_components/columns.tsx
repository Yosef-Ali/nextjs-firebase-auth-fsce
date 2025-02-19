'use client';

<<<<<<< HEAD
import { ColumnDef } from '@tanstack/react-table';
import { User, UserRole, UserStatus } from '@/app/types/user';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTableRowActions } from '@/components/ui/data-table-row-actions';
import { formatDistanceToNow } from 'date-fns';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'User',
=======
import { ColumnDef } from "@tanstack/react-table";
import { User, UserRole, UserStatus } from "@/app/types/user";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "displayName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
<<<<<<< HEAD
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
=======
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511
          <div>
            <div className="font-medium">{user.displayName || 'No name'}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "email",
    header: "Email",
    enableHiding: true,
  },
  {
<<<<<<< HEAD
    accessorKey: 'role',
    header: 'Role',
=======
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511
    cell: ({ row }) => {
      const role = row.original.role;
      return (
<<<<<<< HEAD
        <Badge variant={role === UserRole.ADMIN ? 'destructive' : 'default'}>
          {role}
=======
        <Badge variant={role === UserRole.ADMIN ? "destructive" : "default"}>
          {(role || UserRole.USER).toLowerCase()}
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511
        </Badge>
      );
    },
  },
  {
<<<<<<< HEAD
    accessorKey: 'status',
    header: 'Status',
=======
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511
    cell: ({ row }) => {
      const status = row.original.status;
      return (
<<<<<<< HEAD
        <Badge variant={status === UserStatus.ACTIVE ? 'default' : 'secondary'}>
          {status}
=======
        <Badge variant={status === UserStatus.ACTIVE ? "default" : "secondary"}>
          {(status || UserStatus.PENDING).toLowerCase()}
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511
        </Badge>
      );
    },
  },
  {
<<<<<<< HEAD
    accessorKey: 'createdAt',
    header: 'Joined',
    cell: ({ row }) => {
      const rawDate = row.original.createdAt;
      let date: Date | null = null;

      // Handle Firebase Timestamp
      if (typeof rawDate === 'object' && rawDate !== null && 'toDate' in rawDate) {
        date = rawDate.toDate();
      }
      // Handle numeric timestamps
      else if (typeof rawDate === 'number') {
        date = new Date(rawDate);
      }
      // Handle ISO strings
      else if (typeof rawDate === 'string') {
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
=======
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt");
      console.log("CreatedAt value:", createdAt, "Type:", typeof createdAt);

      if (!createdAt) return "Unknown";

      try {
        let date: Date;

        if (typeof createdAt === 'number') {
          // Validate timestamp
          if (createdAt < 0 || !Number.isFinite(createdAt)) {
            console.warn("Invalid timestamp:", createdAt);
            return "Invalid date";
          }
          date = new Date(createdAt);
        } else if (typeof createdAt === 'string') {
          // Try parsing string formats
          const parsedTime = Date.parse(createdAt);
          if (isNaN(parsedTime)) {
            console.warn("Invalid date string:", createdAt);
            return "Invalid date";
          }
          date = new Date(createdAt);
        } else {
          console.warn("Unexpected createdAt type:", typeof createdAt);
          return "Invalid date";
        }

        // Validate resulting date
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          console.warn("Invalid date object:", date);
          return "Invalid date";
        }

        return format(date, "MMM d, yyyy");
      } catch (error) {
        console.error("Error formatting date:", error, "Value:", createdAt);
        return "Invalid date";
      }
>>>>>>> 0ac669c9da1dc61df8e252f524d3c0989853c511
    },
  },
];
