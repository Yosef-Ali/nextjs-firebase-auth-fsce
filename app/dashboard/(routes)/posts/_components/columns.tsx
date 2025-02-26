'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Post } from '@/app/types/post';
import { Category } from '@/app/types/category';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table-row-actions';

export const columns = (
  onEdit: (post: Post) => void,
  onDelete: (post: Post) => void,
): ColumnDef<Post>[] => [
    // ... other columns
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Category"
        />
      ),
      cell: ({ row }) => {
        const category = row.getValue('category');
        const categoryName = typeof category === 'string'
          ? category
          : (typeof category === 'object' ? (category as Category)?.name : category) || 'Uncategorized';

        return (
          <Badge variant="secondary" className="capitalize">
            {String(categoryName)}
          </Badge>
        );
      },
      sortingFn: (rowA, rowB) => {
        const categoryA = typeof rowA.original.category === 'string'
          ? rowA.original.category
          : rowA.original.category?.name || '';

        const categoryB = typeof rowB.original.category === 'string'
          ? rowB.original.category
          : rowB.original.category?.name || '';

        return categoryA.localeCompare(categoryB);
      },
    },
    // ... other columns
  ];
