'use client';

import { useState } from 'react';
import { Category } from '@/app/types/category';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoriesTable from '@/app/dashboard/_components/CategoriesTable';
import CategoryEditor from '@/app/dashboard/_components/CategoryEditor';
import { categoriesService } from '@/app/services/categories';
import { toast } from '@/hooks/use-toast';

interface CategoriesContentProps {
  initialCategories: Category[];
}

export default function CategoriesContent({ initialCategories }: CategoriesContentProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [activeTab, setActiveTab] = useState<'post' | 'resource'>('post');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postCategories = categories.filter(cat => cat.type === 'post');
  const resourceCategories = categories.filter(cat => cat.type === 'resource');

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
    try {
      setIsLoading(true);
      setError(null);
      await categoriesService.deleteCategory(category.id);
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== category.id)
      );
      toast({
        title: 'Category deleted',
        description: `${category.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
      setError(error instanceof Error ? error.message : 'Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedCategory(undefined);
  };

  const handleSave = (savedCategory: Category) => {
    setCategories(prevCategories => {
      if (selectedCategory) {
        // Update existing category
        return prevCategories.map(cat => 
          cat.id === savedCategory.id ? savedCategory : cat
        );
      } else {
        // Add new category
        return [...prevCategories, savedCategory];
      }
    });
    handleEditorClose();
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage your content categories
          </p>
        </div>
        <Button onClick={() => setIsEditorOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <Tabs defaultValue="post" onValueChange={(v) => setActiveTab(v as 'post' | 'resource')}>
        <TabsList aria-label="Category types">
          <TabsTrigger value="post">Posts</TabsTrigger>
          <TabsTrigger value="resource">Resources</TabsTrigger>
        </TabsList>
        <TabsContent value="post" role="tabpanel" aria-label="Post categories">
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          <CategoriesTable
            categories={postCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="resource" role="tabpanel" aria-label="Resource categories">
          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}
          <CategoriesTable
            categories={resourceCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogTitle>
            {selectedCategory ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {selectedCategory 
              ? 'Make changes to your category here. Click save when you\'re done.' 
              : 'Add a new category to organize your content.'}
          </DialogDescription>
          <CategoryEditor
            category={selectedCategory}
            type={activeTab}
            parentCategories={activeTab === 'post' ? postCategories : resourceCategories}
            onSave={handleSave}
            onCancel={() => handleEditorClose()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
