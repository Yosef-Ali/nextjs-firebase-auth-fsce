'use client';

import { useState, useEffect } from 'react';
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
import { useAuth } from '@/app/hooks/use-auth';
import { Resource } from '@/app/types/resource';
import { resourcesService } from '@/app/services/resources';
import { toast } from 'sonner';
import { authorization } from '@/lib/authorization';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['pdf', 'docx', 'xlsx', 'pptx', 'mp3', 'mp4', 'jpg', 'png'], {
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
  const { user, userData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Verify user has permission to manage resources
  useEffect(() => {
    if (userData && !authorization.isAdmin(userData)) {
      toast.error('You do not have permission to manage resources');
      router.push('/dashboard/resources');
    }
  }, [userData, router]);

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource?.title || '',
      description: resource?.description || '',
      type: resource?.type || 'pdf',
      fileUrl: resource?.fileUrl || '',
      published: resource?.published ?? true,
    },
  });

  const onSubmit = async (data: ResourceFormData) => {
    if (!user || !userData) {
      toast.error('You must be logged in to save resources');
      return;
    }

    // Double-check permissions before saving
    if (!authorization.isAdmin(userData)) {
      toast.error('You do not have permission to manage resources');
      return;
    }

    try {
      setIsSaving(true);
      const resourceData = {
        ...data,
        downloadCount: resource?.downloadCount || 0,
        updatedAt: Date.now(),
        createdAt: resource?.createdAt || Date.now(),
        publishedDate: data.published ? Date.now() : null,
        authorId: user.uid,
        authorEmail: user.email || '',
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: 'media' as const,
      };

      if (mode === 'edit' && resource) {
        await resourcesService.updateResource(resource.id, resourceData);
        toast.success('Resource updated successfully');
      } else {
        await resourcesService.createResource(resourceData);
        toast.success('Resource created successfully');
      }
      router.push('/dashboard/resources');
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setIsSaving(false);
    }
  };

  // Return null if user doesn't have permission
  if (!userData || !authorization.isAdmin(userData)) {
    return null;
  }

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
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                    <SelectItem value="pptx">PPTX</SelectItem>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
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
                      // Auto-select type based on file extension
                      const extension = name.split('.').pop()?.toLowerCase();
                      if (extension) {
                        form.setValue('type', extension as any);
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
