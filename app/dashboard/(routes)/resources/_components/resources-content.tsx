'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Resource } from '@/app/types/resource';

interface ResourcesContentProps {
  initialResources: Resource[];
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

export default function ResourcesContent({ 
  initialResources, 
  onEdit, 
  onDelete 
}: ResourcesContentProps) {
  const [resources] = useState<Resource[]>(initialResources);

  // Create columns array directly
  const tableColumns = columns(onEdit, onDelete);

  return (
    <div className="p-6">
      <DataTable
        columns={tableColumns}
        data={resources}
        searchKey="title" // Make sure this matches an accessorKey in your columns definition
      />
    </div>
  );
}
