'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { resourcesService } from '@/app/services/resources';
import ResourcesContent from './_components/resources-content';
import { Skeleton } from '@/components/ui/skeleton';
import { Resource } from '@/app/types/resource';
import { toast } from '@/hooks/use-toast';
import { ResourceEditor } from '@/app/dashboard/_components/ResourceEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | undefined>();

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const fetchedResources = await resourcesService.getAllResources();
      setResources(fetchedResources || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch resources. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreate = () => {
    setSelectedResource(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource);
    setIsEditorOpen(true);
  };

  const handleDelete = async (resource: Resource) => {
    try {
      await resourcesService.deleteResource(resource.id);
      toast({
        title: 'Success',
        description: 'Resource deleted successfully',
      });
      fetchResources();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedResource(undefined);
  };

  const handleSaved = () => {
    handleEditorClose();
    fetchResources();
  };

  // Calculate resource stats
  const totalResources = resources.length;
  const publicationResources = resources.filter(res => res.category === 'publication').length;
  const reportResources = resources.filter(res => res.category === 'report').length;
  const mediaResources = resources.filter(res => res.category === 'media').length;

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Resources</h1>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-2xl font-bold">{totalResources}</div>
            <p className="text-xs text-muted-foreground">Total Resources</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{publicationResources}</div>
            <p className="text-xs text-muted-foreground">Publications</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{reportResources}</div>
            <p className="text-xs text-muted-foreground">Reports</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{mediaResources}</div>
            <p className="text-xs text-muted-foreground">Media</p>
          </Card>
        </div>

        {/* Resources Table */}
        <Card>
          <ResourcesContent
            initialResources={resources}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Dialog 
          open={isEditorOpen} 
          onOpenChange={(open) => {
            if (!open) {
              handleEditorClose();
            }
            setIsEditorOpen(open);
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedResource ? 'Edit Resource' : 'Create New Resource'}
              </DialogTitle>
            </DialogHeader>
            <ResourceEditor
              resource={selectedResource}
              mode={selectedResource ? 'edit' : 'create'}
              onSuccess={handleSaved}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
