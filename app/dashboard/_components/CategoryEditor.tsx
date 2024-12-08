'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category } from '@/app/types/category';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['post', 'resource']),
  parentId: z.string().optional()
});

interface CategoryEditorProps {
  category?: Category;
  type: 'post' | 'resource';
  parentCategories?: Category[];
  onSave: (savedCategory: Category) => void;
  onCancel: () => void;
}

export function CategoryEditor({ category, type, parentCategories = [], onSave, onCancel }: CategoryEditorProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      type: type,
      parentId: category?.parentId || ''
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? 'Edit Category' : 'New Category'}</CardTitle>
        <CardDescription>
          {category ? 'Update category details' : 'Create a new category'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
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
                    <Textarea placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={form.handleSubmit(onSave)}>
          {category ? 'Update' : 'Create'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CategoryEditor;
