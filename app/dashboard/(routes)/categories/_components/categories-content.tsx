'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Category } from '@/app/types/category';

interface CategoriesContentProps {
  initialCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoriesContent({ 
  initialCategories,
  onEdit,
  onDelete
}: CategoriesContentProps) {
  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={initialCategories}
        searchKey="name"
        meta={{
          onEdit,
          onDelete
        }}
      />
    </div>
  );
}
