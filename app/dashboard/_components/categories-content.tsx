"use client"

import { Category } from "@/app/types/category"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import { format } from "date-fns"

interface CategoriesContentProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export default function CategoriesContent({
  categories = [], // Provide default empty array
  onEdit,
  onDelete,
}: CategoriesContentProps) {
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.type.charAt(0).toUpperCase() + row.original.type.slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
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
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => format(new Date(row.original.updatedAt), "PPp"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={categories}
      searchKey="name"
    />
  )
}