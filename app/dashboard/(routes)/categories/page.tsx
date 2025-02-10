'use client';

import { categoriesService } from '@/app/services/categories';
import CategoriesContent from './_components/categories-content';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Category } from '@/app/types/category';
import { toast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCategories = await categoriesService.getCategoriesWithItemCount();
        if (!fetchedCategories) {
          throw new Error('Failed to fetch categories');
        }
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Failed to fetch categories');
        toast({
          title: 'Error',
          description: 'Failed to fetch categories. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full p-6">
        <Skeleton className="w-full h-[200px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <CategoriesContent initialCategories={categories} />
    </div>
  );
}
