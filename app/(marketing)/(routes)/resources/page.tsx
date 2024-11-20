'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resourcesService } from '@/app/services/resources';
import { Resource } from '@/app/types/post';
import { toast } from '@/hooks/use-toast';
import { ResourceGrid } from '@/app/(marketing)/_components/resources/resource-grid';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async (category?: string) => {
    try {
      setIsLoading(true);
      const allResources = await resourcesService.getAllResources(category);
      setResources(allResources);
    } catch (error) {
      console.error('Error getting resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resources',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    loadResources(value === 'all' ? undefined : value);
  };

  const handleDownload = async (resource: Resource) => {
    try {
      await resourcesService.incrementDownloadCount(resource.id);
      window.open(resource.fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to download resource',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-24 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Resources</h1>
          <p className="text-muted-foreground max-w-2xl">
            Access our comprehensive collection of publications, reports, and media resources
            to learn more about child protection and our work.
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="report">Reports</TabsTrigger>
          <TabsTrigger value="publication">Publications</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <ResourceGrid resources={resources} onDownload={handleDownload} />
          )}
        </TabsContent>
        <TabsContent value="report" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <ResourceGrid resources={resources} onDownload={handleDownload} />
          )}
        </TabsContent>
        <TabsContent value="publication" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <ResourceGrid resources={resources} onDownload={handleDownload} />
          )}
        </TabsContent>
        <TabsContent value="media" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <ResourceGrid resources={resources} onDownload={handleDownload} />
          )}
        </TabsContent>
      </Tabs>
   </div>
  )
}
