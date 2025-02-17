"use client";

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
    }
  },
  {
    accessorKey: "email",
    header: "Email",
    enableHiding: true,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      return (
        <Badge variant={role === UserRole.ADMIN ? "destructive" : "default"}>
          {(role || UserRole.USER).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as UserStatus;
      return (
        <Badge variant={status === UserStatus.ACTIVE ? "default" : "secondary"}>
          {(status || UserStatus.PENDING).toLowerCase()}
        </Badge>
      );
    },
  },
  {
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
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
