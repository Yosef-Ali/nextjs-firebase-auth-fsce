'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Category } from '@/app/types/category';
import { categoriesService } from '@/app/services/categories';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  type: z.enum(['post', 'resource']),
  parentId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryEditorProps {
  category?: Category;
  type: 'post' | 'resource';
  parentCategories?: Category[];
  onSave: () => void;
  onCancel: () => void;
}

export function CategoryEditor({ 
  category,
  type,
  parentCategories = [],
  onSave,
  onCancel 
}: CategoryEditorProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: type,
      parentId: '',
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
        type: category.type,
        parentId: category.parentId,
      });
    }
  }, [category, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (category) {
        await categoriesService.updateCategory(category.id, {
          ...data,
          slug: categoriesService.createSlug(data.name),
        });
        toast({
          title: 'Category updated',
          description: 'Your category has been updated successfully.',
        });
      } else {
        await categoriesService.createCategory({
          ...data,
          slug: categoriesService.createSlug(data.name),
        });
        toast({
          title: 'Category created',
          description: 'Your new category has been created successfully.',
        });
      }
      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? 'Edit Category' : 'New Category'}</CardTitle>
        <CardDescription>
          {category 
            ? 'Update your category information below'
            : 'Create a new category to organize your content'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed for your category.
                  </FormDescription>
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
                    <Textarea 
                      placeholder="Enter category description (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of what this category represents.
                  </FormDescription>
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
                    disabled={!!category}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose whether this category is for posts or resources.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {parentCategories.length > 0 && (
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {parentCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optionally select a parent category to create a hierarchy.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)}>
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CategoryEditor;
