"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Partner } from "@/types";

export const columns: ColumnDef<Partner>[] = [
  {
    accessorKey: "order",
    header: "Order",
  },
  {
    accessorKey: "logoUrl",
    header: "Logo",
    cell: ({ row }) => {
      const name = row.original.name || "";
      const logo = row.original.logoUrl;
      const initials = name
        .split(" ")
        .map((n) => n?.[0] || "")
        .join("")
        .toUpperCase();

      return (
        <div className="relative flex items-center justify-center w-12 h-12 overflow-hidden bg-gray-100 rounded-md">
          {logo ? (
            <Image
              src={logo}
              alt={name}
              fill
              className="object-contain"
              sizes="48px"
              onError={(e) => {
                // If image fails to load, show initials instead
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-lg font-bold text-gray-500">${initials}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-lg font-bold text-gray-500">
              {initials}
            </span>
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
      <Badge
        variant={
          row.original.partnerType === "partner" ? "default" : "secondary"
        }
      >
        {row.original.partnerType}
      </Badge>
    ),
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const website = row.original.website;
      return website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {website}
        </a>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
