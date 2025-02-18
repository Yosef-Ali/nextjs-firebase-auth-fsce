'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { ApiList } from '@/components/ui/api-list';
import { columns } from './_components/columns';
import { ParentClient } from '@/app/types/parent';
import { parentsService } from '@/app/services/parents';

export default function ParentsPage() {
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState<ParentClient[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await parentsService.getParents();
        setParents(data);
      } catch (error) {
        console.error('Failed to fetch parents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={`Parents (${parents.length})`}
            description="Manage parent accounts and information"
          />
          <Button onClick={() => window.location.href = '/dashboard/parents/new'}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={parents}
          searchKey="name"
          loading={loading}
        />
        <Heading title="API" description="API calls for Parents" />
        <Separator />
        <ApiList entityName="parents" entityIdName="parentId" />
      </div>
    </div>
  );
}