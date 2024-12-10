"use client";

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useProgramOffices } from '@/app/context/program-offices';
import { ProgramOfficeList } from '@/app/dashboard/_components/program-offices/program-office-list';

export default function ProgramOfficesPage() {
  const router = useRouter();
  const { offices } = useProgramOffices();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={`Program Offices (${offices.length})`}
            description="Manage program offices"
          />
          <Button onClick={() => router.push(`/dashboard/program-offices/new`)}>
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
        <Separator />
        <ProgramOfficeList />
      </div>
    </div>
  );
}
