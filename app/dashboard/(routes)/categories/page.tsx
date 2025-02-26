'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { columns } from './_components/columns';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategoryType } from "@/app/types/category";
import { CategoryEditor } from './_components/category-editor';
import { Timestamp } from 'firebase/firestore';

interface CategoryColumn {
  id: string;
  name: string;
  description: string;
  type: CategoryType;
  slug: string;
  count: number;
  createdAt: Timestamp;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    const categoriesQuery = query(
      collection(db, 'categories'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const categories = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description || "",
            type: data.type,
            slug: data.slug,
            count: data.itemCount || 0,
            createdAt: data.createdAt,
          }
        }) as CategoryColumn[];
        setCategories(categories);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 space-y-3">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Calculate category stats
  const totalCategories = categories.length;
  const totalItems = categories.reduce((total, category) => total + (category.count || 0), 0);
  const uniqueTypes = new Set(categories.map(category => category.type)).size;
  const activeCategories = categories.filter(category => category.count > 0).length;

  return (
    <div className="container py-10 mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button onClick={() => setIsEditorOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
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
            <div className="text-2xl font-bold">{uniqueTypes}</div>
            <p className="text-xs text-muted-foreground">Category Types</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{activeCategories}</div>
            <p className="text-xs text-muted-foreground">Active Categories</p>
          </Card>
        </div>

        {/* Categories Table */}
        <Card className="p-4">
          <DataTable
            columns={columns}
            data={categories.map(category => ({
              id: category.id,
              name: category.name,
              description: category.description,
              type: category.type,
              slug: category.slug,
              count: category.count || 0,
              createdAt: category.createdAt,
            }))}
            searchKey="name"
          />
        </Card>

        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <CategoryEditor onClose={() => setIsEditorOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
