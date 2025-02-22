'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Category } from '@/app/types/category';

interface CategoriesContentProps {
  initialCategories: Category[];
}

export default function CategoriesContent({ initialCategories }: CategoriesContentProps) {
  return (
    <div>
      <DataTable
        columns={columns}
        data={initialCategories}
        searchKey="name"
      />
    </div>
  );
}
