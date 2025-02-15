'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mediaService } from '@/app/services/media';
import { Media } from '@/app/types/media';
import MediaGrid from '@/app/dashboard/_components/MediaGrid';
import { MediaUploader } from '@/app/dashboard/_components/MediaUploader';
import MediaViewer from '@/app/dashboard/_components/MediaViewer';
import MediaEditor from '@/app/dashboard/_components/MediaEditor';
import { toast } from '@/hooks/use-toast';
import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';

function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [searchQuery, selectedType, media]);

  const loadMedia = async () => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Loading media...');
      const { items } = await mediaService.getMedia();
      console.log(`Found ${items.length} items`);
      setMedia(items);
    } catch (error) {
      console.error('Error loading media:', error);
      setError(error instanceof Error ? error.message : 'Failed to load media');
      toast({
        title: "Error",
        description: "Failed to load media. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = [...media];

    // Client-side filtering by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Client-side search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Client-side sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    setFilteredMedia(filtered);
  };

  const handleUploadComplete = () => {
    setIsUploaderOpen(false);
    loadMedia();
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    setSelectedMedia(null);
    loadMedia();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground">Loading media...</p>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto space-y-8">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Media Library
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage and organize media files. Upload, categorize, and track various types of media assets.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-transparent border rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b rounded-t-lg">
          <h3 className="text-lg font-semibold leading-none tracking-tight">Media</h3>
          <Button onClick={() => setIsUploaderOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        </CardHeader>

        <div className="p-4 space-y-4">
          {error && (
            <div className="p-4 text-red-500 border-b">
              <p className="font-medium">Error loading media:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType} className="mt-4">
              <ScrollArea className="h-[calc(100vh-380px)]">
                <MediaGrid items={filteredMedia} onView={setSelectedMedia} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      <Dialog open={isUploaderOpen} onOpenChange={setIsUploaderOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>Add new media files to your library</DialogDescription>
          </DialogHeader>
          <MediaUploader onComplete={handleUploadComplete} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedMedia !== null}
        onOpenChange={(open) => !open && setSelectedMedia(null)}
      >
        <DialogContent className="sm:max-w-[800px]">
          {selectedMedia && !isEditing ? (
            <MediaViewer
              media={selectedMedia}
              onClose={() => setSelectedMedia(null)}
              onEdit={() => setIsEditing(true)}
            />
          ) : selectedMedia && isEditing ? (
            <MediaEditor
              media={selectedMedia}
              onSave={handleEditComplete}
              onCancel={() => setIsEditing(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withRoleProtection(MediaLibraryPage, UserRole.ADMIN);
