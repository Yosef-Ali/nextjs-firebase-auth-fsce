"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableContent } from "./data-table-content";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
}: DataTableProps<TData>) {
  return (
    <DataTableContent
      columns={columns}
      data={data}
      searchKey={searchKey}
      searchPlaceholder={searchPlaceholder}
    />
  );
}
