'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { ApiList } from '@/components/ui/api-list';
import { columns } from './columns';
import { ProgramOffice } from '@/app/types/program-office';

interface ProgramOfficesClientProps {
  data: ProgramOffice[];
}

export const ProgramOfficesClient: React.FC<ProgramOfficesClientProps> = ({
  data
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Program Offices (${data.length})`}
          description="Manage program offices and locations"
        />
        <Button onClick={() => router.push(`/dashboard/program-offices/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="location" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Program Offices" />
      <Separator />
      <ApiList entityName="program-offices" entityIdName="programOfficeId" />
    </>
  );
};