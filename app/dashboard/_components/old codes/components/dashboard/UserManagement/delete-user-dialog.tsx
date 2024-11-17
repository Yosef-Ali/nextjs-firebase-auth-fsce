import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { User } from "@/types";
import { deflate } from "zlib";

type DeleteUserDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  userData: User;
};

export default function DeleteUserDialog({ isOpen, onClose, userData }: DeleteUserDialogProps) {
  const deleteUser = useMutation(api.users.deleteUser);

  const handleDelete = async () => {
    await deleteUser({ id: userData._id });
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            account and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}