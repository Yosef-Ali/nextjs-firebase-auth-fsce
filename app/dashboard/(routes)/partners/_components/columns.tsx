"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Partner } from "@/types";
import { Badge } from "@/components/ui/badge";

const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

export const columns: ColumnDef<Partner>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const partner = row.original;
      return (
        <div className="flex items-center gap-2">
          {partner.logo && (
            <img 
              src={partner.logo} 
              alt={partner.name} 
              className="h-10 w-10 object-contain rounded-md"
            />
          )}
          <div>
            <div className="font-medium">{partner.name}</div>
            <div className="text-sm text-muted-foreground">{partner.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "partnerType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("partnerType") as string;
      return (
        <Badge variant={type === 'PREMIUM' ? 'default' : 'secondary'}>
          {type.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const website = row.getValue("website") as string;
      if (!website || !isValidUrl(website)) return null;
      
      try {
        const url = new URL(website);
        return (
          <a 
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {url.hostname}
          </a>
        );
      } catch {
        return website;
      }
    },
  },
  {
    accessorKey: "order",
    header: "Display Order",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
