'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Category } from '@/app/types/category';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CategoryColumnProps {
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export const columns: ColumnDef<Category, CategoryColumnProps>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    )
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.type.charAt(0).toUpperCase() + row.original.type.slice(1)}
      </Badge>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.original.description || '-'
  },
  {
    accessorKey: 'itemCount',
    header: 'Items',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.itemCount || 0}
      </Badge>
    )
  },
  {
    accessorKey: 'featured',
    header: 'Featured',
    cell: ({ row }) => (
      <Badge variant={row.original.featured ? 'default' : 'secondary'}>
        {row.original.featured ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
      const category = row.original;
      
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  const onEdit = table.options.meta?.onEdit;
                  if (onEdit) onEdit(category);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the category "{category.name}"? 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const onDelete = table.options.meta?.onDelete;
                    if (onDelete) {
                      onDelete(category);
                      setShowDeleteDialog(false);
                    }
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
