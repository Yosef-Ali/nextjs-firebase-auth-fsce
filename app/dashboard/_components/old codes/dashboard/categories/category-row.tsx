import { TableCell, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Category } from "@/types";

type CategoryRowProps = {
  category: Category;
};

export function CategoryRow({ category }: CategoryRowProps) {
  const deleteCategory = useMutation(api.categories.remove);
  const updateCategory = useMutation(api.categories.update);

  const handleDelete = () => deleteCategory({ id: category._id });
  const handleEdit = () => {
  };

  return (
    <TableRow className="hover:bg-muted">
      <TableCell>
        <div className="font-medium">{category.title}</div>
        <div className="hidden text-sm text-muted-foreground md:inline">
          {category.description}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">{new Date(category._creationTime).toLocaleDateString()}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Actions" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}