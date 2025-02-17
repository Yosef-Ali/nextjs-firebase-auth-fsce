'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { categoriesService } from '@/app/services/categories';
import CategoriesContent from './_components/categories-content';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, CategoryType } from '@/app/types/category';
import { toast } from '@/hooks/use-toast';
import { CategoryEditor } from '@/app/dashboard/_components/CategoryEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedType, setSelectedType] = useState<CategoryType>('post');

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const fetchedCategories = await categoriesService.getCategories(); // Changed from getCategoriesWithItemCount
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = (type: CategoryType) => {
    setSelectedType(type);
    setSelectedCategory(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setSelectedType(category.type);
    setIsEditorOpen(true);
  };

  const handleDelete = async (category: Category) => {
    try {
      await categoriesService.deleteCategory(category.id);
      await fetchCategories();
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (categoryData: Partial<Category>) => {
    try {
      if (selectedCategory) {
        await categoriesService.updateCategory(selectedCategory.id, categoryData);
      } else {
        // Ensure all required fields are present for new category
        const newCategoryData = {
          name: categoryData.name!,
          description: categoryData.description || '',
          type: selectedType,
          slug: 'slug' in categoryData ? categoryData.slug : categoriesService.createSlug(categoryData.name!),
          featured: categoryData.featured ?? false, // Use nullish coalescing to ensure boolean
          icon: 'icon' in categoryData ? categoryData.icon : null,
        };
        await categoriesService.createCategory(newCategoryData);
      }
      await fetchCategories();
      setIsEditorOpen(false);
      toast({
        title: 'Success',
        description: `Category ${selectedCategory ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: `Failed to ${selectedCategory ? 'update' : 'create'} category`,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  const totalCategories = categories.length;
  const postCategories = categories.filter(cat => cat.type === 'post').length;
  const resourceCategories = categories.filter(cat => cat.type === 'resource').length;
  const featuredCategories = categories.filter(cat => cat.featured).length;

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button onClick={() => handleCreate('post')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

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

        <CategoriesContent
          initialCategories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
          <CategoryEditor
            category={selectedCategory}
            type={selectedType}
            onSave={handleSave}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
