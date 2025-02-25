"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Office } from "@/app/types/office";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const columns = (
  onEdit: (office: Office) => void,
  onDelete: (office: Office) => void
): ColumnDef<Office>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Office Name" />
    ),
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
  },
  {
    accessorKey: "contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
  },
  {
    accessorKey: "impactCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Impact" />
    ),
    cell: ({ row }) => {
      const impactCount = row.getValue("impactCount") as number;
      return (
        <Badge variant="secondary" className="capitalize">
          {impactCount.toLocaleString()}+ beneficiaries
        </Badge>
      );
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
    {
      id: "actions",
      cell: ({ row }) => {
        const office = row.original;
        return <ActionCell row={row} office={office} onEdit={onEdit} onDelete={onDelete} />;
      },
    },
  ];
  
  interface ActionCellProps {
    row: any;
    office: Office;
    onEdit: (office: Office) => void;
    onDelete: (office: Office) => void;
  }
  
  const ActionCell = ({ row, office, onEdit, onDelete }: ActionCellProps) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
    return (
      <div>
        <DataTableRowActions
          row={row}
          actions={[
            {
              label: "Edit",
              onClick: () => onEdit(office),
            },
            {
              label: "Delete",
              onClick: () => setShowDeleteDialog(true),
            },
          ]}
        />
  
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Office</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this office? This action
                cannot be undone.
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
                  onDelete(office);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
;
