"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { ProgramOffice } from "@/app/types/program-office";

interface OfficesContentProps {
  initialOffices: ProgramOffice[];
  onEdit: (office: ProgramOffice) => void;
  onDelete: (office: ProgramOffice) => void;
}

export default function OfficesContent({
  initialOffices,
  onEdit,
  onDelete,
}: OfficesContentProps) {
  const [offices, setOffices] = useState<ProgramOffice[]>(initialOffices);

  useEffect(() => {
    setOffices(initialOffices);
  }, [initialOffices]);

  const tableColumns = columns(onEdit, onDelete);

  return (
    <div className="p-6">
      <DataTable columns={tableColumns} data={offices} searchKey="location" />
    </div>
  );
}
