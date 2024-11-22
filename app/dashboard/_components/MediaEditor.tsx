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
import { Textarea } from '@/components/ui/textarea';
import { Media } from '@/app/types/media';
import { mediaService } from '@/app/services/media';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface MediaEditorProps {
  media: Media;
  onSave: () => void;
  onCancel: () => void;
}

export function MediaEditor({ media, onSave, onCancel }: MediaEditorProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      alt: '',
      caption: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (media) {
      form.reset({
        name: media.name,
        description: media.description,
        alt: media.alt,
        caption: media.caption,
        tags: media.tags || [],
      });
    }
  }, [media, form]);

  const onSubmit = async (data: FormData) => {
    try {
      await mediaService.updateMedia(media.id, {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
      });
      toast({
        title: 'Media updated',
        description: 'Your media has been updated successfully.',
      });
      onSave();
    } catch (error) {
      console.error('Error updating media:', error);
      toast({
        title: 'Error',
        description: 'Failed to update media. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Media</CardTitle>
        <CardDescription>
          Update your media information below
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
                    <Input placeholder="Enter media name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed for your media.
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
                      placeholder="Enter media description (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of this media.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {media.type === 'image' && (
              <>
                <FormField
                  control={form.control}
                  name="alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Text</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter alt text for accessibility"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Alternative text for screen readers and SEO.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter image caption"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A caption to display below the image.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter tags, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to help organize your media (e.g., logo, banner, profile).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)}>
          Update Media
        </Button>
      </CardFooter>
    </Card>
  );
}

export default MediaEditor;
