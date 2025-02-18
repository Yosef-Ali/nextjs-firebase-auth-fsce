'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { categoryService } from '@/app/services/categories';
import CategoriesContent from './_components/categories-content';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@/app/types/category';
import { toast } from '@/hooks/use-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCategories = await categoryService.getCategories();
        // Add itemCount calculation logic here if needed
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  // Calculate category stats
  const totalCategories = categories.length;
  const postCategories = categories.filter(cat => cat.type === 'post').length;
  const resourceCategories = categories.filter(cat => cat.type === 'resource').length;
  const featuredCategories = categories.filter(cat => cat.featured).length;

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button onClick={() => setIsEditorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">Total Categories</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{postCategories}</div>
            <p className="text-xs text-muted-foreground">Post Categories</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{resourceCategories}</div>
            <p className="text-xs text-muted-foreground">Resource Categories</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{featuredCategories}</div>
            <p className="text-xs text-muted-foreground">Featured Categories</p>
          </Card>
        </div>

        {/* Categories Table */}
        <Card>
          <CategoriesContent initialCategories={categories} />
        </Card>
      </div>
    </div>
  );
}
