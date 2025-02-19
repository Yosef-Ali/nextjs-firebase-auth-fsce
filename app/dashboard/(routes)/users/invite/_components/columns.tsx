"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserRole } from "@/app/types/user";
import { Badge } from "@/components/ui/badge";

export interface InviteUserData {
  email: string;
  role: UserRole;
}

export const columns: ColumnDef<InviteUserData>[] = [
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      return (
        <Badge variant={role === UserRole.ADMIN ? "destructive" : "default"}>
          {role.toLowerCase()}
        </Badge>
      );
    },
  }
];
