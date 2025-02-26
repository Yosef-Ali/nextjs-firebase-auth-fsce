import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Timestamp } from "firebase/firestore";
import { CategoryType } from "@/app/types/category";

export type CategoryColumn = {
  id: string;
  name: string;
  description: string;
  type: CategoryType;
  slug: string;
  count: number;
  createdAt: Timestamp;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "count",
    header: "Items",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date.toDate().toLocaleDateString();
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
