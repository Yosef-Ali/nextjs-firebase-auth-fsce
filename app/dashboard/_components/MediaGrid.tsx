'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Media } from '@/app/types/media';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Pencil, Trash, Download, Eye } from 'lucide-react';
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

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((media) => (
          <Card key={media.id} className="overflow-hidden">
            <CardContent className="p-0 relative aspect-square">
              {selectable && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedItems.includes(media.id)}
                    onCheckedChange={(checked) => onSelect?.(media.id, checked as boolean)}
                  />
                </div>
              )}
              {media.type === 'image' ? (
                <Image
                  src={media.thumbnailUrl || media.url}
                  alt={media.alt || media.name}
                  fill
                  className="object-cover"
                  onClick={() => onView?.(media)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Badge variant="secondary" className="text-lg">
                    {media.type.toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-2 flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={media.name}>
                  {media.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(media.size)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onView?.(media)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(media)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload(media)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setMediaToDelete(media)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
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
