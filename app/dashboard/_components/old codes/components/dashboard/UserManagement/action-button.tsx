import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, XIcon } from 'lucide-react';
import { User } from '@/types';
import EditUserDialog from './edit-user-dialog';
import DeleteUserDialog from './delete-user-dialog';

type ActionButtonProps = {
  userData: User;
};

const ActionButton = ({ userData }: ActionButtonProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="User actions" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)}>
            <XIcon className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData}
      />

      <DeleteUserDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        userData={userData} />
    </>
  );
};

export default ActionButton;