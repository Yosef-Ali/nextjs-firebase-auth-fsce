'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Category } from '@/app/types/category';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table-row-actions';

export const columns: ColumnDef<Category>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={type === 'post' ? 'default' : 'secondary'}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'itemCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
  },
  {
    accessorKey: 'featured',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Featured" />
    ),
    cell: ({ row }) => {
      const featured = row.getValue('featured') as boolean;
      return (
        <Badge variant={featured ? 'default' : 'secondary'}>
          {featured ? 'Yes' : 'No'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const category = row.original;
      return (
        <DataTableRowActions
          row={row}
          actions={[
            {
              label: 'Edit',
              onClick: () => {
                // Handle edit action
              },
            },
            {
              label: 'Delete',
              onClick: () => {
                // Handle delete action
              },
            },
          ]}
        />
      );
    },
  },
];