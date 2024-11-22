'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mediaService } from '@/app/services/media';
import { Media } from '@/app/types/media';
import MediaGrid from '@/app/dashboard/_components/MediaGrid';
import { MediaUploader } from '@/app/dashboard/_components/MediaUploader';
import MediaViewer from '@/app/dashboard/_components/MediaViewer';
import MediaEditor from '@/app/dashboard/_components/MediaEditor';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [searchQuery, selectedType, media]);

  const loadMedia = async () => {
    try {
      const { items } = await mediaService.getMedia();
      setMedia(items);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = [...media];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
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

  return (
    <div className="h-full flex flex-col space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Media Library</h2>
          <p className="text-sm text-muted-foreground">
            Manage your media files and assets
          </p>
        </div>
        <Button onClick={() => setIsUploaderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Media
        </Button>
      </div>

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
          <ScrollArea className="h-[calc(100vh-280px)]">
            <MediaGrid
              items={filteredMedia}
              onView={setSelectedMedia}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={isUploaderOpen} onOpenChange={setIsUploaderOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <MediaUploader
            onUploadComplete={handleUploadComplete}
            onCancel={() => setIsUploaderOpen(false)}
          />
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
