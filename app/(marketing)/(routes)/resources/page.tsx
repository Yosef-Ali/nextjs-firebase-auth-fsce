'use client';

import { Metadata } from 'next';
import { Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { resourcesService } from '@/app/services/resources';
import { ResourceCard } from './_components/resource-card';
import { ResourceStats } from './_components/resource-stats';
import { ResourcesGrid } from './_components/resources-grid';
import { ResourceUploader } from '@/components/resource-uploader';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const metadata: Metadata = {
  title: 'Resources | FSCE',
  description: 'Access publications, reports, toolkits, and research materials from FSCE.',
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const [showUploader, setShowUploader] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('publications');

  const loadResources = async () => {
    try {
      const [allResources, stats] = await Promise.all([
        resourcesService.getPublishedResources(),
        resourcesService.getResourceStatistics(),
      ]);
      setResources(allResources);
      setStats(stats);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resources',
        variant: 'destructive',
      });
    }
  };

  useState(() => {
    loadResources();
  }, []);

  // Split resources by type
  const publications = resources.filter(resource => resource.type === 'publication');
  const reports = resources.filter(resource => resource.type === 'report');
  const toolkits = resources.filter(resource => resource.type === 'toolkit');
  const research = resources.filter(resource => resource.type === 'research');

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Resources</h1>
          <p className="text-muted-foreground max-w-2xl">
            Access our comprehensive collection of publications, reports, toolkits, and research materials
            to learn more about child protection and our work.
          </p>
        </div>
        {user && (
          <div className="flex gap-4">
            <Button
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
            <Button
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </div>
        )}
      </div>

      {showUploader && (
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Add New Resource</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploader(false)}
            >
              Cancel
            </Button>
          </div>
          <ResourceUploader
            onChange={async (data) => {
              try {
                await resourcesService.createResource({
                  title: data.title,
                  description: data.description,
                  type: activeTab === 'publications' ? 'publication' : activeTab.slice(0, -1) as ResourceType,
                  fileUrl: data.url,
                  published: true,
                  publishedDate: Date.now(),
                  slug: resourcesService.createSlug(data.title),
                  downloadCount: 0,
                });
                await loadResources();
                setShowUploader(false);
                toast({
                  title: 'Success',
                  description: 'Resource added successfully',
                });
              } catch (error) {
                console.error('Error creating resource:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to create resource',
                  variant: 'destructive',
                });
              }
            }}
            onRemove={() => setShowUploader(false)}
            value=""
          />
        </div>
      )}

      <ResourceStats stats={stats} />

      <Tabs defaultValue="publications" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="toolkits">Toolkits</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>
        
        <TabsContent value="publications">
          <Suspense fallback={<div>Loading publications...</div>}>
            <ResourcesGrid>
              {publications.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </ResourcesGrid>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="reports">
          <Suspense fallback={<div>Loading reports...</div>}>
            <ResourcesGrid>
              {reports.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </ResourcesGrid>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="toolkits">
          <Suspense fallback={<div>Loading toolkits...</div>}>
            <ResourcesGrid>
              {toolkits.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </ResourcesGrid>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="research">
          <Suspense fallback={<div>Loading research...</div>}>
            <ResourcesGrid>
              {research.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </ResourcesGrid>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
