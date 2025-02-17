'use client';

import { useState, useEffect } from 'react';
import { Media } from '@/app/types/media';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MediaGridProps {
  items: Media[];
  selectable?: boolean;
  selectedItems?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onView?: (media: Media) => void;
}

function ImageItem({ media, onClick, selectable }: { media: Media; onClick?: () => void; selectable: boolean }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Debug log when component mounts
  useEffect(() => {
    console.log('ImageItem mounted with media:', media);
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log('Starting load effect with URL:', media.url);

    const loadImage = async () => {
      if (!media.url) {
        console.log('No URL provided');
        setHasError(true);
        setErrorDetails('No image URL provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Setting up new image load for:', media.url);

        const img = new Image();
        
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            console.log('Image load timed out');
            reject(new Error('Image load timed out'));
          }, 10000);

          img.onload = () => {
            console.log('Image loaded successfully:', media.url);
            clearTimeout(timeoutId);
            resolve(null);
          };

          img.onerror = (event) => {
            console.log('Image load failed:', event);
            clearTimeout(timeoutId);
            reject(new Error('Image load failed'));
          };

          img.src = media.url;
        });

        if (isMounted) {
          setIsLoading(false);
          setHasError(false);
        }
      } catch (error) {
        console.log('Load error:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          setErrorDetails(error instanceof Error ? error.message : 'Failed to load image');

          if (retryCount < MAX_RETRIES) {
            const delay = 1000 * (retryCount + 1);
            console.log(`Will retry in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => setRetryCount(prev => prev + 1), delay);
          }
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      console.log('Cleanup: component unmounting');
    };
  }, [media.url, retryCount]);

  if (hasError) {
    console.log('Rendering error state');
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted">
        <div className="space-y-2 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Failed to load image</p>
          {errorDetails && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {errorDetails}
              </AlertDescription>
            </Alert>
          )}
          {retryCount < MAX_RETRIES && (
            <button
              onClick={() => setRetryCount(0)}
              className="mt-2 text-xs underline text-primary hover:text-primary/80"
            >
              Retry ({retryCount + 1}/{MAX_RETRIES})
            </button>
          )}
        </div>
      </div>
    );
  }

  console.log('Rendering image with loading:', isLoading);
  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              Loading{retryCount > 0 ? ` (Attempt ${retryCount + 1}/${MAX_RETRIES})` : '...'}
            </p>
          </div>
        </div>
      )}

      <img
        src={media.url}
        alt={media.alt || media.name}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onClick={() => !selectable && onClick?.()}
        onLoad={() => {
          console.log('Image element loaded:', media.url);
          setIsLoading(false);
        }}
        onError={(e) => {
          console.log('Image element error:', e);
          setHasError(true);
          setIsLoading(false);
          setErrorDetails('Failed to load image');
        }}
      />
    </div>
  );
}

function MediaGrid({
  items,
  selectable = false,
  selectedItems = [],
  onSelect,
  onView,
}: MediaGridProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!items?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((media) => (
        <Card key={media.id} className="overflow-hidden group">
          <CardContent className="relative p-0 aspect-square">
            {selectable && (
              <div className="absolute z-20 top-2 left-2">
                <Checkbox
                  checked={selectedItems.includes(media.id)}
                  onCheckedChange={(checked) => onSelect?.(media.id, checked as boolean)}
                />
              </div>
            )}
            {media.type === 'image' ? (
              <ImageItem
                media={media}
                onClick={() => onView?.(media)}
                selectable={selectable}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-muted">
                <Badge variant="secondary" className="text-lg">
                  {media.type.toUpperCase()}
                </Badge>
              </div>
            )}
          </CardContent>
          {!selectable && (
            <CardFooter className="flex items-center justify-between p-2 border-t">
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
  );
}

export default MediaGrid;
