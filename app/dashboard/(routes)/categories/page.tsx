import { Suspense } from 'react';
import { categoriesService } from '@/app/services/categories';
import CategoriesContent from './_components/categories-content';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function CategoriesPage() {
  const categories = await categoriesService.getCategories();

  return (
    <div className="h-full p-6">
      <Suspense fallback={<Skeleton className="w-full h-[200px]" />}>
        <CategoriesContent initialCategories={categories} />
      </Suspense>
    </div>
  );
}

export default CategoriesPage;
