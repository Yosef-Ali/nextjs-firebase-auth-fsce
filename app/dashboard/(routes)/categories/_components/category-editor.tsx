'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { collection, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { updateCategory } from '@/app/actions/categories'; // Import the server action
import { CategoryType } from '@/app/types/category';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['post', 'resource', 'event', 'award', 'recognition']),
  slug: z.string().min(1, 'Slug is required')
});

type CategoryFormData = z.infer<typeof formSchema>;

import { Timestamp } from 'firebase/firestore';

interface CategoryEditorProps {
  category?: {
    id: string;
    name: string;
    description: string;
    type: CategoryType;
    slug: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  };
  onClose?: () => void;
}

export function CategoryEditor({ category, onClose }: CategoryEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      type: category?.type || 'post',
      slug: category?.slug || ''
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSaving(true);
      const categoryData = {
        ...data,
        count: 0
      };

      if (category?.id) {
        // Use the server action for updating
        const result = await updateCategory(category.id, categoryData);

        if (result.success) {
          toast({
            title: 'Success',
            description: 'Category updated successfully',
          });
        } else {
          throw new Error(result.error || 'Failed to update category');
        }
      } else {
        const categoriesRef = collection(db, 'categories');
        await addDoc(categoriesRef, categoryData);
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
      }
      onClose?.();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Category name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Category description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="award">Award</SelectItem>
                  <SelectItem value="recognition">Recognition</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="category-slug" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {category ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
