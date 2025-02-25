'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { resourcesService } from '@/app/services/resources';
import { Resource } from '@/app/types/post';
import { toast } from '@/hooks/use-toast';
import { ResourceGrid } from '@/app/(marketing)/_components/resources/resource-grid';
import { ProgramSearch } from '@/components/program-search';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // Track downloads in progress to prevent duplicate clicks
  const [downloadingResource, setDownloadingResource] = useState<string | null>(null);

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
    // Prevent multiple clicks while processing
    if (downloadingResource === resource.id) return;

    try {
      setDownloadingResource(resource.id);

      // Make sure we wait for the increment to complete
      await resourcesService.incrementDownloadCount(resource.id);

      // Create an anchor element and trigger the download
      const link = document.createElement('a');
      link.href = resource.fileUrl;
      link.setAttribute('download', resource.title || 'resource');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Download started',
      });
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to download resource',
        variant: 'destructive',
      });
    } finally {
      setDownloadingResource(null);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filterResources = () => {
    return resources.filter((resource) =>
    (searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    );
  };

  return (
    <div className="container mx-auto py-24 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Resources</h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Explore our comprehensive collection of reports, research papers, and impact stories that showcase our work and insights.
          </p>

          {/* Search Box */}
          <ProgramSearch
            onSearch={handleSearch}
            placeholder="Search resources..."
            className="mt-10"
          />
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
            <ResourceGrid resources={filterResources()} onDownload={handleDownload} />
          )}
        </TabsContent>
        <TabsContent value="report" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <ResourceGrid resources={filterResources()} onDownload={handleDownload} />
          )}
        </TabsContent>
        <TabsContent value="publication" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <ResourceGrid resources={filterResources()} onDownload={handleDownload} />
          )}
        </TabsContent>
        <TabsContent value="media" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : (
            <ResourceGrid resources={filterResources()} onDownload={handleDownload} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
