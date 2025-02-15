'use client';

import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';
import { useAuth } from '@/app/hooks/use-auth';
import { useRouter } from 'next/navigation';
import CategoriesContent from './_components/categories-content';
import { Category } from '@/app/types/category';
import { categoriesService } from '@/app/services/categories';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function CategoriesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (userData?.role !== UserRole.ADMIN && userData?.role !== UserRole.SUPER_ADMIN))) {
      router.replace('/unauthorized');
      return;
    }

    const loadCategories = async () => {
      try {
        const data = await categoriesService.getCategoriesWithItemCount();
        setCategories(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadCategories();
    }
  }, [user, userData, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>

        <div className="border rounded-md">
          <div className="flex items-center h-12 px-4 border-b bg-muted/30">
            <Skeleton className="h-4 w-[100px]" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b last:border-0">
              <Skeleton className="h-4 w-[200px] mr-8" />
              <Skeleton className="h-4 w-[50px] mr-8" />
              <Skeleton className="h-4 w-[80px] mr-8" />
              <Skeleton className="w-8 h-8 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto space-y-8">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Category Management
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage content categories and subcategories. Organize and structure your content effectively through category management.
          </CardDescription>
        </CardHeader>
      </Card>
      <CategoriesContent initialCategories={categories} />
    </div>
  );
}

export default withRoleProtection(CategoriesPage, UserRole.ADMIN);
