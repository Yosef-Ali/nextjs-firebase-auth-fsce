"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { BoardMember } from "@/app/types/board-member";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const columns: ColumnDef<BoardMember>[] = [
  {
    accessorKey: "image",
    header: "Photo",
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.image || ""} />
        <AvatarFallback>
          {row.original.name?.charAt(0).toUpperCase() || "BM"}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => (
      <Badge variant={row.original.featured ? "default" : "secondary"}>
        {row.original.featured ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "published" ? "default" : "secondary"}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "order",
    header: "Order",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
