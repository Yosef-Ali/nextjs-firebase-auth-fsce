import { categoriesService } from '@/app/services/categories';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Dynamically import the client component
const CategoriesContent = dynamic(() => import('./_components/categories-content'), {
  loading: () => <Skeleton className="w-full h-[200px]" />,
});

async function CategoriesPage() {
  const categories = await categoriesService.getCategories();

  return (
    <div className="h-full p-6">
      <CategoriesContent initialCategories={categories} />
    </div>
  );
}

export default CategoriesPage;
