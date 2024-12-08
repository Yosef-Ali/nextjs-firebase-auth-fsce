'use client';

import { useState } from 'react';
import { Category } from '@/app/types/category';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  VisuallyHidden 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoriesTable from '@/app/dashboard/_components/CategoriesTable';
import CategoryEditor from '@/app/dashboard/_components/CategoryEditor';

interface CategoriesContentProps {
  initialCategories: Category[];
}

function CategoriesContent({ initialCategories }: CategoriesContentProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [activeTab, setActiveTab] = useState<'post' | 'resource'>('post');

  const postCategories = initialCategories.filter(cat => cat.type === 'post');
  const resourceCategories = initialCategories.filter(cat => cat.type === 'resource');

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(undefined);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedCategory(undefined);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage your post and resource categories
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <Tabs defaultValue="post" className="w-full" onValueChange={(v: string) => setActiveTab(v as 'post' | 'resource')}>
        <TabsList>
          <TabsTrigger value="post">Post Categories</TabsTrigger>
          <TabsTrigger value="resource">Resource Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="post" className="mt-4">
          <CategoriesTable
            initialCategories={postCategories}
            type="post"
            onEdit={handleEdit}
          />
        </TabsContent>
        <TabsContent value="resource" className="mt-4">
          <CategoriesTable
            initialCategories={resourceCategories}
            type="resource"
            onEdit={handleEdit}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            <VisuallyHidden>
              {selectedCategory ? 'Edit Category' : 'Create New Category'}
            </VisuallyHidden>
          </DialogTitle>
          <CategoryEditor
            category={selectedCategory}
            type={activeTab}
            parentCategories={
              activeTab === 'post' ? postCategories : resourceCategories
            }
            onSave={handleEditorClose}
            onCancel={handleEditorClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoriesContent;
