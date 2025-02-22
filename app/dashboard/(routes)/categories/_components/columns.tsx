'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Category } from '@/app/types/category';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CategoryColumnProps {
  onDelete?: (category: Category) => void;
}

export const columns = ({ onDelete }: CategoryColumnProps): ColumnDef<Category>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="px-4">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-4">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <div className="px-4">
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-4 py-2 font-medium">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <div className="px-4">
        <DataTableColumnHeader column={column} title="Description" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-4 py-2 text-muted-foreground">
        {row.getValue('description') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <div className="px-4">
        <DataTableColumnHeader column={column} title="Type" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-4 py-2">
        <Badge variant="outline" className="capitalize">
          {row.getValue('type')}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'itemCount',
    header: ({ column }) => (
      <div className="px-4">
        <DataTableColumnHeader column={column} title="Items" />
      </div>
    ),
    cell: ({ row }) => {
      const count = row.getValue('itemCount') as number;
      return (
        <div className="px-4 py-2">
          <Badge variant="secondary">
            {count || 0} {count === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const category = row.original;
      
      return (
        <div className="px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  const event = new CustomEvent('edit-category', { detail: category });
                  window.dispatchEvent(event);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(category)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
