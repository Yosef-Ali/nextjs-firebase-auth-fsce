'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Download,
  Link as LinkIcon,
  Upload,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Maximum storage limit (in bytes)
const MAX_STORAGE_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB
const STORAGE_WARNING_THRESHOLD = 0.9 * MAX_STORAGE_BYTES; // 90% of max storage

interface MediaItem {
  url: string;
  name: string;
  path: string;
  size: number;
  createdAt: Date;
}

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const storagePaths = [
    'posts',
    'partners',
    'resources',
    'uploads'
  ];

  const fetchMediaItems = async () => {
    try {
      setIsLoading(true);
      const allItems: MediaItem[] = [];
      let totalSize = 0;

      // Fetch items from multiple paths
      for (const path of storagePaths) {
        const storageRef = ref(storage, path);
        try {
          const result = await listAll(storageRef);
          
          const items = await Promise.all(
            result.items.map(async (item) => {
              const url = await getDownloadURL(item);
              const metadata = await getMetadata(item);
              
              totalSize += metadata.size;
              
              return {
                url,
                name: item.name,
                path: item.fullPath,
                size: metadata.size,
                createdAt: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date(),
              };
            })
          );
          
          allItems.push(...items);
        } catch (error) {
          console.error(`Error fetching items from ${path}:`, error);
        }
      }
      
      // Sort items by creation date (oldest first)
      const sortedItems = allItems.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      setMediaItems(sortedItems);
      setTotalStorageUsed(totalSize);
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

    // Check storage limit before upload
    if (totalStorageUsed + file.size > MAX_STORAGE_BYTES) {
      toast({
        title: 'Storage Limit Exceeded',
        description: 'Please delete some existing files before uploading.',
        variant: 'destructive',
      });
      return;
    }

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

  const handleDelete = async (path: string, size: number) => {
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

  // Calculate storage usage percentage
  const storageUsagePercentage = (totalStorageUsed / MAX_STORAGE_BYTES) * 100;

  // Determine storage status
  const storageStatus = useMemo(() => {
    if (storageUsagePercentage >= 100) {
      return 'danger';
    } else if (storageUsagePercentage >= 90) {
      return 'warning';
    }
    return 'normal';
  }, [storageUsagePercentage]);

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
      {/* Storage Usage Progress */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-grow">
          <div className="text-sm text-muted-foreground mb-1">
            Storage: {`${(totalStorageUsed / (1024 * 1024)).toFixed(2)} MB / ${(MAX_STORAGE_BYTES / (1024 * 1024)).toFixed(2)} MB`}
          </div>
          <Progress 
            value={storageUsagePercentage} 
            className={`h-2 ${
              storageStatus === 'danger' 
                ? 'bg-destructive/20' 
                : storageStatus === 'warning' 
                ? 'bg-warning/20' 
                : 'bg-primary/20'
            }`}
          />
        </div>
        {storageStatus !== 'normal' && (
          <div className="flex items-center space-x-2 text-sm">
            <AlertTriangle 
              className={`h-5 w-5 ${
                storageStatus === 'danger' 
                  ? 'text-destructive' 
                  : 'text-warning'
              }`} 
            />
            <span className={
              storageStatus === 'danger' 
                ? 'text-destructive' 
                : 'text-warning'
            }>
              {storageStatus === 'danger' 
                ? 'Limit Reached' 
                : 'Almost Full'}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Media Library</h2>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
            disabled={storageStatus !== 'normal'}
          />
          <Button
            asChild
            disabled={isUploading || storageStatus !== 'normal'}
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
                <p className="text-xs text-muted-foreground mb-2">
                  {`${(item.size / 1024).toFixed(2)} KB`}
                </p>
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
                    onClick={() => handleDelete(item.path, item.size)}
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
