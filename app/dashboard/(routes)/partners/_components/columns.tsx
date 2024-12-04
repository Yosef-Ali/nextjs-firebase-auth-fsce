"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { Partner } from "@/types";

export const columns: ColumnDef<Partner, unknown>[] = [
  {
    accessorKey: "order",
    header: "Order",
  },
  {
    accessorKey: "logoUrl",
    header: "Logo",
    cell: ({ row }) => {
      const name = row.original.name;
      const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "";

      return (
        <div className="relative h-12 w-12">
          {row.original.logoUrl ? (
            <Image
              src={row.original.logoUrl || ""}
              alt={name || ""}
              className="object-contain"
              fill
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-600">
              {initials}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "partnerType",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.partnerType}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => (
      row.original.website ? (
        <a 
          href={row.original.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          Visit <ExternalLink className="h-4 w-4" />
        </a>
      ) : null
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.original.description}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
] as ColumnDef<Partner, unknown>[];
