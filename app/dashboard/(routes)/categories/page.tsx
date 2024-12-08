'use client';

import { categoriesService } from '@/app/services/categories';
import CategoriesContent from './_components/categories-content';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Category } from '@/app/types/category';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoriesService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to fetch categories', error);
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

  return (
    <div className="h-full p-6">
      <CategoriesContent initialCategories={categories} />
    </div>
  );
}
