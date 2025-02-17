'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Category } from '@/app/types/category';

interface CategoriesContentProps {
  initialCategories: Category[];
}

export default function CategoriesContent({ initialCategories }: CategoriesContentProps) {
  const [categories] = useState<Category[]>(initialCategories);

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
      />
    </div>
  );
}
