'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/app/types/category';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader } from "@/components/ui/card";
import CategoriesTable from '@/app/dashboard/_components/CategoriesTable';
import CategoryEditor from '@/app/dashboard/_components/CategoryEditor';
import { categoriesService } from '@/app/services/categories';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/app/hooks/use-auth';
import { UserRole } from '@/app/types/user';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoriesContentProps {
  initialCategories: Category[];
}

export default function CategoriesContent({ initialCategories }: CategoriesContentProps) {
  const { user, userData, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManageCategories = userData?.role === UserRole.ADMIN || userData?.role === UserRole.SUPER_ADMIN;

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const fetchedCategories = await categoriesService.getCategoriesWithItemCount();
      const uniqueCategories = Array.from(new Set(fetchedCategories.map(category => category.id)))
        .map(id => fetchedCategories.find(category => category.id === id));
      const filteredCategories = uniqueCategories.filter((category): category is Category => category !== undefined);
      setCategories(filteredCategories);
    } catch (error) {
      setError('Failed to fetch categories. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to fetch categories. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = async (category: Category) => {
    if (!canManageCategories) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to edit categories',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSelectedCategory(category);
      setIsEditorOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!canManageCategories) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to delete categories',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await categoriesService.deleteCategory(category.id);
      await fetchCategories(); // Refresh categories to get updated item counts
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (category: Category) => {
    if (!canManageCategories) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to manage categories',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate category name
    const isDuplicate = categories.some(
      existingCategory =>
        existingCategory.name.toLowerCase() === category.name.toLowerCase() &&
        existingCategory.id !== category.id
    );

    if (isDuplicate) {
      toast({
        title: 'Error',
        description: 'A category with this name already exists',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const savedCategory = category.id
        ? await categoriesService.updateCategory(category.id, category)
        : await categoriesService.createCategory(category);

      await fetchCategories(); // Refresh categories to get updated item counts
      setIsEditorOpen(false);
      toast({
        title: 'Success',
        description: `Category ${category.id ? 'updated' : 'created'} successfully`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Error',
        description: `Failed to ${category.id ? 'update' : 'create'} category`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedCategory(undefined);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div>
      <Card className="bg-transparent border rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b rounded-t-lg">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Categories</h3>
          {canManageCategories && (
            <Button onClick={() => setIsEditorOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          )}
        </CardHeader>

        {error && (
          <div className="p-4 text-red-500 border-b">{error}</div>
        )}

        <CategoriesTable
          categories={categories.filter(cat => cat.type === 'post' && !cat.parentId)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          canManage={canManageCategories}
        />
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogTitle>
            {selectedCategory ? 'Edit Category' : 'New Category'}
          </DialogTitle>
          <DialogDescription>
            {selectedCategory ? 'Update category details' : 'Create a new category'}
          </DialogDescription>
          <CategoryEditor
            category={selectedCategory}
            type="post"
            onSave={handleSave}
            onCancel={handleEditorClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
