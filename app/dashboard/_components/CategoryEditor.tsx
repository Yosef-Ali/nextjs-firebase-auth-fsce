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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['post', 'resource', 'award', 'recognition']),
  icon: z.string().optional(),
  featured: z.boolean().optional()
});

interface CategoryEditorProps {
  category?: Category;
  type: 'post' | 'resource' | 'award' | 'recognition';
  onSave: (savedCategory: Category) => void;
  onCancel: () => void;
}

export function CategoryEditor({ category, type, onSave, onCancel }: CategoryEditorProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      type: type,
      featured: category?.featured || false
    }
  });

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
        <form onSubmit={form.handleSubmit((data) => {
          onSave({
            ...data,
            id: category?.id || '',
            slug: category?.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
            createdAt: category?.createdAt || new Date(),
            updatedAt: new Date(),
          } as Category);
        })}>
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
              <>
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
                        <FormLabel>
                          Featured
                        </FormLabel>
                        <FormDescription>
                          Feature this {type} prominently on the website
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? 'Update' : 'Create'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default CategoryEditor;
