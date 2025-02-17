'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category, CategoryType } from '@/app/types/category';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { categoriesService } from '@/app/services/categories';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['post', 'resource', 'award', 'recognition'] as const satisfies readonly CategoryType[]),
  icon: z.string().optional(),
  featured: z.boolean().optional()
});

interface CategoryEditorProps {
  category?: Category;
  type: CategoryType;
  onSave: (savedCategory: Category) => void;
  onCancel: () => void;
}

export function CategoryEditor({ category, type, onSave, onCancel }: CategoryEditorProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      type: type,
      icon: category?.icon || '',
      featured: category?.featured || false
    }
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSaving(true);
      
      const categoryData = {
        ...data,
        id: category?.id || crypto.randomUUID(),
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: category?.createdAt || Date.now(),
        updatedAt: Date.now(),
      } as Category;

      if (category?.id) {
        await categoriesService.updateCategory(category.id, categoryData);
      } else {
        await categoriesService.createCategory(categoryData);
      }

      toast({
        title: "Success",
        description: `Category ${category ? 'updated' : 'created'} successfully`,
      });

      onSave(categoryData);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? 'Edit Category' : 'New Category'}</CardTitle>
        <CardDescription>
          {type === 'award' ? 'Create or edit an award category' :
            type === 'recognition' ? 'Create or edit a recognition category' :
              type === 'resource' ? 'Create or edit a resource category' :
                'Create or edit a post category'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(type === 'award' || type === 'recognition') && (
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 🏆 or trophy" />
                    </FormControl>
                    <FormDescription>
                      Enter an emoji or icon name for this {type}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      Show this category prominently in listings
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : (category ? 'Update' : 'Create')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default CategoryEditor;
