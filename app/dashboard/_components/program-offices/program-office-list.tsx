"use client";

import { DataTable } from "@/components/ui/data-table";
import { useProgramOffices } from '@/app/context/program-offices';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { columns } from './columns';

export function ProgramOfficeList() {
  const { offices, loading } = useProgramOffices();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={offices}
      searchKey="location"
    />
  );
}
