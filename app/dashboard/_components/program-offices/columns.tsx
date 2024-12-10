"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { ExternalLink } from "lucide-react";
import { ProgramOffice } from "@/types";

export type ProgramOfficeColumn = {
  id: string;
  type: string;
  region: string;
  location: string;
  address: string;
  contact: string;
  email: string;
  beneficiaries: string;
  programs: string[];
};

export const columns: ColumnDef<ProgramOffice, unknown>[] = [
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "beneficiaries",
    header: "Beneficiaries",
  },
  {
    accessorKey: "programs",
    header: "Programs",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {Array.isArray(row.original.programs) 
          ? row.original.programs.join(", ")
          : row.original.programs}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
