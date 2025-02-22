'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ProgramOffice } from '@/app/types/program-office';
import { CellAction } from './cell-action';

export const columns: ColumnDef<ProgramOffice>[] = [
  {
    accessorKey: 'region',
    header: 'Region',
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'contact',
    header: 'Contact',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'beneficiaries',
    header: 'Beneficiaries',
  },
  {
    accessorKey: 'programs',
    header: 'Programs',
    cell: ({ row }) => {
      const programs = row.original.programs;
      return <span>{programs.join(', ')}</span>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  },
];