'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/app/hooks/use-auth';
import { UserRole } from '@/app/types/user';
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
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
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
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const canEdit = userData?.role === UserRole.ADMIN || userData?.role === UserRole.SUPER_ADMIN;

  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="flex items-start space-x-3 rounded-md border p-4">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-3 w-[160px]" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[120px]" />
        </CardFooter>
      </Card>
    );
  }

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!canEdit) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to perform this action",
        variant: "destructive"
      });
      return;
    }

    onSave({
      ...data,
      id: category?.id || '',
      createdAt: category?.createdAt || new Date(),
      updatedAt: new Date(),
      itemCount: category?.itemCount || 0,
      count: category?.count || 0,
      parentId: category?.parentId || undefined,  // Changed from null to undefined
      slug: category?.slug || data.name.toLowerCase().replace(/\s+/g, '-')
    });
  };

  if (!canEdit) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">You don't have permission to edit categories.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
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
                    <Textarea
                      placeholder="Category description (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      Show this category in featured sections
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? 'Update' : 'Create'} Category
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default CategoryEditor;
