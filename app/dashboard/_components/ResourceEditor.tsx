'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileUploadCard from './FileUploadCard';
import { useAuth } from '@/app/hooks/useAuth';
import { Resource } from '@/app/types/resource';
import { resourcesService } from '@/app/services/resources';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['publication', 'report', 'toolkit', 'research'], {
    required_error: 'Please select a resource type',
  }),
  fileUrl: z.string().url('Please upload a file').min(1, 'File is required'),
  published: z.boolean().default(true),
});

type ResourceFormData = z.infer<typeof formSchema>;

interface ResourceEditorProps {
  resource?: Resource;
  mode?: 'create' | 'edit';
}

export function ResourceEditor({ resource, mode = 'create' }: ResourceEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource?.title || '',
      description: resource?.description || '',
      type: resource?.type || 'publication',
      fileUrl: resource?.fileUrl || '',
      published: resource?.published ?? true,
    },
  });

  const onSubmit = async (data: ResourceFormData) => {
    if (!user) return;

    try {
      setIsSaving(true);
      const resourceData = {
        ...data,
        slug: resource?.slug || resourcesService.createSlug(data.title),
        downloadCount: resource?.downloadCount || 0,
        updatedAt: Date.now(),
        createdAt: resource?.createdAt || Date.now(),
        publishedDate: data.published ? Date.now() : null,
      };

      if (resource) {
        await resourcesService.updateResource(resource.id, resourceData);
        toast({
          title: "Success",
          description: "Resource updated successfully",
        });
      } else {
        await resourcesService.createResource(resourceData);
        toast({
          title: "Success",
          description: "Resource created successfully",
        });
      }
      router.push('/dashboard/resources');
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: "Error",
        description: "Failed to save resource",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter resource title" {...field} />
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
                    placeholder="Enter resource description"
                    className="h-32"
                    {...field}
                  />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="publication">Publication</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="toolkit">Toolkit</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fileUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File</FormLabel>
                <FormControl>
                  <FileUploadCard
                    initialFile={field.value}
                    onFileUpload={(url, name) => {
                      field.onChange(url);
                      // Auto-fill title if empty
                      if (!form.getValues('title')) {
                        form.setValue('title', name.split('.')[0]);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Published</FormLabel>
                  <FormDescription>
                    Make this resource available to users
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/resources')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <span>Saving...</span>
            ) : mode === 'create' ? (
              'Create Resource'
            ) : (
              'Update Resource'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
