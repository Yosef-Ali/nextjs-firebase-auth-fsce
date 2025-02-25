"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Office } from "@/app/types/office";

interface OfficesContentProps {
  initialOffices: Office[];
  onEdit: (office: Office) => void;
  onDelete: (office: Office) => void;
}

export default function OfficesContent({
  initialOffices,
  onEdit,
  onDelete,
}: OfficesContentProps) {
  const [offices] = useState<Office[]>(initialOffices);

  // Create columns array directly
  const tableColumns = columns(onEdit, onDelete);

  return (
    <div className="p-6">
      <DataTable columns={tableColumns} data={offices} searchKey="name" />
    </div>
  );
}
