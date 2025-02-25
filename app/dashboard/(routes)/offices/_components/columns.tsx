"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProgramOffice } from "@/app/types/program-office";
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
  onEdit: (office: ProgramOffice) => void,
  onDelete: (office: ProgramOffice) => void
): ColumnDef<ProgramOffice>[] => [
    {
      accessorKey: "region",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Region" />
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
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "beneficiaries",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Beneficiaries" />
      ),
    },
    {
      accessorKey: "programs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Programs" />
      ),
      cell: ({ row }) => {
        const programs = row.getValue("programs") as string[];
        return (
          <div className="space-x-1">
            {programs.slice(0, 2).map((program, i) => (
              <Badge key={i} variant="secondary">
                {program}
              </Badge>
            ))}
            {programs.length > 2 && (
              <Badge variant="outline">+{programs.length - 2}</Badge>
            )}
          </div>
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
  office: ProgramOffice;
  onEdit: (office: ProgramOffice) => void;
  onDelete: (office: ProgramOffice) => void;
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
};
