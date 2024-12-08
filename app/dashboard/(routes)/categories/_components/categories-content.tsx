'use client';

import { useState } from 'react';
import { Category } from '@/app/types/category';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CategoriesTable from '@/app/dashboard/_components/CategoriesTable';
import CategoryEditor from '@/app/dashboard/_components/CategoryEditor';
import { categoriesService } from '@/app/services/categories';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/app/hooks/useAuth';

interface CategoriesContentProps {
  initialCategories: Category[];
}

export default function CategoriesContent({ initialCategories }: CategoriesContentProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async (category: Category) => {
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
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete categories',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await categoriesService.deleteCategory(category.id);
      setCategories(categories.filter(c => c.id !== category.id));
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
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save categories',
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

      setCategories((prevCategories: Category[]) => {
        if (category.id) {
          return prevCategories.map((c) => (c.id === category.id ? savedCategory : c));
        }
        return [...prevCategories, savedCategory];
      });

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setIsEditorOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <CategoriesTable
        categories={categories.filter(cat => cat.type === 'post' && !cat.parentId)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

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
            onCancel={() => handleEditorClose()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
