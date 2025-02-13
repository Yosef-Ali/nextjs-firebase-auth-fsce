'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Partner } from '@/app/types/partner';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export const columns: ColumnDef<Partner>[] = [
  {
    accessorKey: 'logo',
    header: 'Logo',
    cell: ({ row }) => (
      <div className="relative h-10 w-10">
        <Image
          src={row.original.logo}
          alt={row.original.name}
          fill
          className="object-contain"
        />
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'partnerType',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant={row.original.partnerType === 'strategic' ? 'default' : 'secondary'}>
        {row.original.partnerType}
      </Badge>
    ),
  },
  {
    accessorKey: 'website',
    header: 'Website',
    cell: ({ row }) => (
      <a 
        href={row.original.website} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {row.original.website}
      </a>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];