'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Resource } from '@/app/types/resource';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table-row-actions';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const columns = (
  onEdit: (resource: Resource) => void,
  onDelete: (resource: Resource) => void,
): ColumnDef<Resource>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
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
        <Badge variant="secondary" className="capitalize">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'downloads',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Downloads" />
    ),
  },
  {
    accessorKey: 'published',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const published = row.getValue('published') as boolean;
      return (
        <Badge variant={published ? 'default' : 'secondary'}>
          {published ? 'Published' : 'Draft'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const resource = row.original;
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);

      return (
        <div>
          <DataTableRowActions
            row={row}
            actions={[
              {
                label: 'Edit',
                onClick: () => onEdit(resource),
              },
              {
                label: 'Delete',
                onClick: () => setShowDeleteDialog(true),
              },
            ]}
          />

          <Dialog 
            open={showDeleteDialog} 
            onOpenChange={setShowDeleteDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Resource</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this resource? This action cannot be undone.
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
                    setShowDeleteDialog(false);
                    onDelete(resource);
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];
