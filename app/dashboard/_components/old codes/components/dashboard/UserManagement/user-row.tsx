import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ActionButton from "./action-button";
import { User } from "@/types";

type UserRowProps = {
  user: User;
};

const UserRow = ({ user }: UserRowProps) => (
  <TableRow className="hover:bg-muted">
    <TableCell>
      <div className="flex items-center gap-4">
        <Avatar className="hidden h-9 w-9 sm:flex">
          <AvatarImage alt="Avatar" src={user.imageUrl} />
          <AvatarFallback>{user.name ? user.name.slice(0, 2).toUpperCase() : ''}</AvatarFallback>
        </Avatar>
        <div className="font-medium">{user.name}</div>
      </div>
    </TableCell>
    <TableCell className="hidden md:table-cell">
      {user.role || "User"}
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <Badge
        variant="outline"
        className={user.active === "active"
          ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
        }
      >
        {user.active === "active" ? 'Active' : 'Inactive'}
      </Badge>
    </TableCell>
    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
    <TableCell>
      <ActionButton userData={user} />
    </TableCell>
  </TableRow>
);

export default UserRow;