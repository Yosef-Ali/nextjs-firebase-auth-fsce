'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Media } from '@/app/types/media';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Pencil, Trash, Download, Eye, Image as ImageIcon } from 'lucide-react';
import { mediaService } from '@/app/services/media';
import { toast } from '@/hooks/use-toast';

interface MediaGridProps {
  items: Media[];
  selectable?: boolean;
  selectedItems?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onEdit?: (media: Media) => void;
  onView?: (media: Media) => void;
}

function MediaGrid({
  items,
  selectable = false,
  selectedItems = [],
  onSelect,
  onEdit,
  onView,
}: MediaGridProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [loadError, setLoadError] = useState<{ [key: string]: boolean }>({});

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (media: Media) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await mediaService.deleteMedia(media.id);
      toast({
        title: 'Media deleted',
        description: `${media.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete media. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setMediaToDelete(null);
    }
  };

  const handleDownload = (media: Media) => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMediaElement = (media: Media) => {
    const isSvg = media.url.toLowerCase().endsWith('.svg');
    const className = cn(
      "transition-transform duration-500 group-hover:scale-105",
      loadError[media.id] ? "hidden" : "block"
    );

    if (isSvg) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-white p-4">
          <img
            src={media.url}
            alt={media.alt || media.name}
            className={cn(className, "max-w-full max-h-full object-contain")}
            crossOrigin="anonymous"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              // Try without crossOrigin if first attempt fails
              if (img.crossOrigin) {
                img.removeAttribute('crossOrigin');
                img.src = `${media.url}?${new Date().getTime()}`;
              } else {
                setLoadError(prev => ({ ...prev, [media.id]: true }));
                console.error(`Failed to load image: ${media.url}`);
              }
            }}
            onClick={() => !selectable && onView?.(media)}
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <Image
          src={media.url}
          alt={media.alt || media.name}
          fill
          className={cn(className, "object-cover")}
          onError={() => {
            setLoadError(prev => ({ ...prev, [media.id]: true }));
            console.error(`Failed to load image: ${media.url}`);
          }}
          onClick={() => !selectable && onView?.(media)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((media) => (
          <Card key={media.id} className="group overflow-hidden">
            <CardContent className="p-0 relative aspect-square">
              {selectable && (
                <div className="absolute top-2 left-2 z-20">
                  <Checkbox
                    checked={selectedItems.includes(media.id)}
                    onCheckedChange={(checked) => onSelect?.(media.id, checked as boolean)}
                  />
                </div>
              )}
              {media.type === 'image' ? (
                <>
                  {getMediaElement(media)}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium truncate">
                        {media.name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {formatFileSize(media.size)}
                      </p>
                    </div>
                  </div>
                  {loadError[media.id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Badge variant="secondary" className="text-lg">
                    {media.type.toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardContent>
            {!selectable && (
              <CardFooter className="p-2 flex justify-between items-center border-t">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={media.name}>
                    {media.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(media.size)}
                  </p>
                </div>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <AlertDialog open={!!mediaToDelete} onOpenChange={() => setMediaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{mediaToDelete?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => mediaToDelete && handleDelete(mediaToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default MediaGrid;
