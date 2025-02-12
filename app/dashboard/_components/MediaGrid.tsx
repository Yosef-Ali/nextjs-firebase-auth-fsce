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
  const [imageUrl, setImageUrl] = useState<string>(media.url);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);
    setErrorDetails('');

    // Add a cache-busting parameter to the URL
    const cacheBuster = `?t=${Date.now()}`;
    const urlWithCacheBuster = `${media.url}${cacheBuster}`;
    setImageUrl(urlWithCacheBuster);

    const loadImage = async () => {
      try {
        // Create a new image object
        const img = new Image();

        // Add crossOrigin attribute
        img.crossOrigin = 'anonymous';

        // Create a promise to handle image loading
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Image load timed out'));
          }, 10000);

          img.onload = () => {
            clearTimeout(timeoutId);
            if (isMounted) {
              setIsLoading(false);
              setHasError(false);
              console.log('Image loaded successfully:', media.url);
            }
            resolve(null);
          };

          img.onerror = (error) => {
            clearTimeout(timeoutId);
            console.error('Image load error:', error);
            reject(new Error('Image failed to load'));
          };

          // Start loading the image
          img.src = urlWithCacheBuster;
        });

      } catch (error) {
        if (isMounted) {
          console.error('Image load error:', error);
          setHasError(true);
          setIsLoading(false);
          setErrorDetails(error instanceof Error ? error.message : 'Unknown error');

          // Try loading without crossOrigin as fallback
          const retryImg = new Image();
          retryImg.src = urlWithCacheBuster;
          retryImg.onload = () => {
            if (isMounted) {
              setIsLoading(false);
              setHasError(false);
            }
          };
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [media.url]);

  if (hasError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4">
        <div className="text-center space-y-2">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Failed to load image</p>
          {errorDetails && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorDetails}
              </AlertDescription>
            </Alert>
          )}
          <button
            onClick={() => {
              setIsLoading(true);
              setHasError(false);
              setErrorDetails('');
              const newCacheBuster = `?t=${Date.now()}`;
              setImageUrl(`${media.url}${newCacheBuster}`);
            }}
            className="text-xs text-primary hover:text-primary/80 underline mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      )}

      <img
        src={imageUrl}
        alt={media.alt || media.name}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onClick={() => !selectable && onClick?.()}
        onLoad={() => {
          console.log('Image loaded in DOM:', imageUrl);
          setIsLoading(false);
        }}
        onError={(e) => {
          console.error('Image error in DOM:', e);
          setHasError(true);
          setIsLoading(false);
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium truncate">
            {media.name}
          </p>
        </div>
      </div>
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
              <ImageItem
                media={media}
                onClick={() => onView?.(media)}
                selectable={selectable}
              />
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
  );
}

export default MediaGrid;
