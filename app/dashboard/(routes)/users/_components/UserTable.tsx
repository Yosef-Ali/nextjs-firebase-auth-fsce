import { useState } from "react";
import { AppUser, UserRole, UserStatus } from "@/app/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, UserIcon, Loader2, Key } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { CellAction } from "@/components/ui/cell-action";

interface UserTableProps {
  users: AppUser[];
  isLoading: boolean;
  updatingUserId?: string | null;
  onDeleteUser: (uid: string) => Promise<void>;
  onSetRole: (userId: string, role: UserRole) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  onEdit: (user: AppUser) => void;
}

const UserTable = ({
  users,
  isLoading,
  updatingUserId,
  onDeleteUser,
  onSetRole,
  onResetPassword,
  onEdit,
}: UserTableProps) => {
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    if (actionInProgress) return;
    try {
      setActionInProgress(true);
      await action();
    } catch (error) {
      console.error("Action failed:", error);
      toast({
        title: "Error",
        description: "Operation failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRoleChange = async (user: AppUser, newRole: UserRole) => {
    if (user.role === newRole) return;

    await handleAction(async () => {
      try {
        await onSetRole(user.uid, newRole);
        toast({
          title: "Success",
          description: `User role updated to ${newRole}`,
        });
      } catch (error) {
        throw new Error(`Failed to update role: ${error}`);
      }
    });
  };

  const handlePasswordReset = async (user: AppUser) => {
    if (!user.email) {
      toast({
        title: "Error",
        description: "User email not found",
        variant: "destructive",
      });
      return;
    }

    await handleAction(async () => {
      try {
        await onResetPassword(user.email!);
        toast({
          title: "Success",
          description: "Password reset email sent",
        });
      } catch (error) {
        throw new Error(`Failed to send reset email: ${error}`);
      }
    });
  };

  const handleEdit = (user: AppUser) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "Invalid user data",
        variant: "destructive",
      });
      return;
    }
    onEdit(user);
  };

  const isUserUpdating = (uid: string) =>
    updatingUserId === uid || actionInProgress;

  const renderActions = (user: AppUser) => {
    const actions = [
      {
        label: "Edit",
        icon: <Edit className="w-4 h-4 mr-2" />,
        onClick: () => handleEdit(user),
      },
      {
        label: "Reset Password",
        icon: <Key className="w-4 h-4 mr-2" />,
        onClick: () => handlePasswordReset(user),
      },
      {
        label: "Delete",
        icon: <Trash2 className="w-4 h-4 mr-2" />,
        onClick: () => setUserToDelete(user),
        variant: "destructive" as const,
      },
    ];

    return (
      <CellAction actions={actions} isLoading={isUserUpdating(user.uid)} />
    );
  };

  const roleOptions = [
    { value: UserRole.USER, label: "User" },
    { value: UserRole.ADMIN, label: "Admin" },
  ];

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
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
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-[50px]" />
                  </TableCell>
                </TableRow>
              ))
              : users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt=""
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                          <UserIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {user.displayName || "No name"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === UserRole.ADMIN
                          ? "destructive"
                          : "default"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === UserStatus.ACTIVE
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {renderActions(user)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  handleAction(async () => {
                    await onDeleteUser(userToDelete.uid);
                    setUserToDelete(null);
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserTable;
