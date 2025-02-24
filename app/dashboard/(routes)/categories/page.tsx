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
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategoryEditor } from './_components/category-editor';

interface Category {
  id: string;
  name: string;
  description: string;
  type: 'post' | 'resource' | 'event';
  slug: string;
  count: number;
  createdAt: Date;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
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
        const categories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Category[];
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
      <div className="space-y-3 p-8">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <>
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <CategoryEditor onClose={() => setIsEditorOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="space-y-4 p-8">
        <div className="flex items-center justify-between">
          <Heading
            title={`Categories (${categories.length})`}
            description="Manage your categories"
          />
          <Button onClick={() => setIsEditorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
        <DataTable columns={columns} data={categories} searchKey="name" />
      </div>
    </>
  );
}
