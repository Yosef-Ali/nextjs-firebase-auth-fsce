'use client';

import { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/hooks/useAuth';
import { 
  Download,
  Link as LinkIcon,
  Upload,
  Loader2,
  Trash2
} from 'lucide-react';
import { storage } from '@/app/firebase';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import Image from 'next/image';

interface MediaItem {
  url: string;
  name: string;
  path: string;
}

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMediaItems = async () => {
    try {
      setIsLoading(true);
      
      // Define storage paths to search
      const storagePaths = [
        'posts',
        'partners',
        'resources',
        'uploads'
      ];

      const allItems: MediaItem[] = [];

      // Fetch items from multiple paths
      for (const path of storagePaths) {
        const storageRef = ref(storage, path);
        try {
          const result = await listAll(storageRef);
          
          const items = await Promise.all(
            result.items.map(async (item) => {
              const url = await getDownloadURL(item);
              return {
                url,
                name: item.name,
                path: item.fullPath,
              };
            })
          );
          
          allItems.push(...items);
        } catch (error) {
          console.error(`Error fetching items from ${path}:`, error);
        }
      }
      
      // Sort items by name
      allItems.sort((a, b) => a.name.localeCompare(b.name));
      
      setMediaItems(allItems);
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch media items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `uploads/${file.name}`);
      await uploadBytes(storageRef, file);
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
      fetchMediaItems();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
      fetchMediaItems();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Success',
        description: 'Link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="w-full aspect-square animate-pulse bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Media Library</h2>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <Button
            asChild
            disabled={isUploading}
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <Card key={item.url} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium truncate mb-2">{item.name}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(item.url, item.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(item.url)}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(item.path)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
