"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { User, UserRole, UserStatus } from "@/app/types/user";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const formatDate = (value: any): string => {
  if (!value) return "N/A";
  
  try {
    let date: Date;
    
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      // Handle milliseconds timestamp
      date = new Date(value);
    } else if (typeof value === 'string') {
      // Handle ISO string or other date string formats
      date = new Date(value);
    } else if (value.toDate && typeof value.toDate === 'function') {
      // Handle Firestore Timestamp
      date = value.toDate();
    } else {
      return "Invalid date";
    }
    
    // Validate the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "displayName",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName} 
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium">{user.displayName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      return (
        <Badge variant={role === UserRole.ADMIN ? 'default' : 'secondary'}>
          {role?.toLowerCase() || 'user'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as UserStatus;
      return (
        <Badge 
          variant={status === UserStatus.ACTIVE ? 'success' : 'destructive'}
        >
          {status?.toLowerCase() || 'inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      return formatDate(row.getValue("createdAt"));
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.original.metadata?.lastLogin;
      if (!lastLogin) return "Never";
      return formatDate(lastLogin);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
