"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AppUser, UserRole, UserStatus } from "@/app/types/user";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Trash2, Key } from "lucide-react";
import { usersService } from "@/app/services/client/users-service";
import { toast } from "@/hooks/use-toast";

export const columns: ColumnDef<AppUser>[] = [
  {
    accessorKey: "photoURL",
    header: "",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
          <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "displayName",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge
          variant={role === UserRole.SUPER_ADMIN ? "destructive" : role === UserRole.ADMIN ? "default" : "secondary"}
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={status === UserStatus.ACTIVE ? "default" : status === UserStatus.PENDING ? "secondary" : "destructive"}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const handleRoleChange = async (newRole: UserRole) => {
        try {
          await usersService.updateUserRole(user.uid, newRole);
          toast({
            title: "Success",
            description: "User role updated successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update user role",
            variant: "destructive",
          });
        }
      };

      const handleStatusChange = async (newStatus: UserStatus) => {
        try {
          await usersService.updateUserStatus(user.uid, newStatus);
          toast({
            title: "Success",
            description: "User status updated successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update user status",
            variant: "destructive",
          });
        }
      };

      const handleDelete = async () => {
        try {
          await usersService.deleteUser(user.uid);
          toast({
            title: "Success",
            description: "User deleted successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete user",
            variant: "destructive",
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Shield className="mr-2 h-4 w-4" />
                <span>Role</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleRoleChange(UserRole.USER)}>
                  User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange(UserRole.AUTHOR)}>
                  Author
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange(UserRole.ADMIN)}>
                  Admin
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Key className="mr-2 h-4 w-4" />
                <span>Status</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleStatusChange(UserStatus.ACTIVE)}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(UserStatus.PENDING)}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(UserStatus.BLOCKED)}>
                  Blocked
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];