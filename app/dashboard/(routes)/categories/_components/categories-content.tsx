'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import type { CategoryColumn } from './columns';

interface CategoriesContentProps {
  initialCategories: CategoryColumn[];
}

export default function CategoriesContent({ initialCategories }: CategoriesContentProps) {
  const [categories] = useState<CategoryColumn[]>(initialCategories);

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
