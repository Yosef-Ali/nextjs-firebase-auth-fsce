'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { categoriesService } from '@/app/services/categories';
import CategoriesContent from './_components/categories-content';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@/app/types/category';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryEditor from '@/app/dashboard/_components/CategoryEditor';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const fetchedCategories = await categoriesService.getCategoriesWithItemCount();
        setCategories(fetchedCategories || []);
      } catch (error) {
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

  useEffect(() => {
    const handleEditCategory = (event: CustomEvent<Category>) => {
      setSelectedCategory(event.detail);
      setIsEditorOpen(true);
    };

    window.addEventListener('edit-category' as any, handleEditCategory as any);

    return () => {
      window.removeEventListener('edit-category' as any, handleEditCategory as any);
    };
  }, []);

  const handleSaveCategory = async (category: Category) => {
    try {
      if (selectedCategory) {
        await categoriesService.updateCategory(selectedCategory.id, category);
        toast({
          title: 'Success',
          description: 'Category updated successfully.',
        });
      } else {
        await categoriesService.createCategory(category);
        toast({
          title: 'Success',
          description: 'Category created successfully.',
        });
      }

      // Refresh categories
      const updatedCategories = await categoriesService.getCategoriesWithItemCount();
      setCategories(updatedCategories || []);
      setIsEditorOpen(false);
      setSelectedCategory(undefined);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save category. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
    <>
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Categories</h1>
            <Button onClick={() => {
              setSelectedCategory(undefined);
              setIsEditorOpen(true);
            }}>
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

      {/* Category Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <CategoryEditor
            category={selectedCategory}
            type={selectedCategory?.type || 'post'}
            onSave={handleSaveCategory}
            onCancel={() => {
              setIsEditorOpen(false);
              setSelectedCategory(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
