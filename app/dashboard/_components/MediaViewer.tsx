'use client';

import { useState, useEffect } from 'react';
import { Media } from '@/app/types/media';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, ImageIcon, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface MediaViewerProps {
  media: Media;
  onClose: () => void;
  onEdit: (media: Media) => void;
}

export function MediaViewer({ media, onClose, onEdit }: MediaViewerProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    let mounted = true;
    setIsImageLoading(true);
    setLoadError(false);

    const loadImage = async () => {
      try {
        const img = document.createElement('img');

        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            if (mounted) {
              reject(new Error('Image load timeout'));
            }
          }, 15000); // 15 second timeout

          img.onload = () => {
            clearTimeout(timeoutId);
            if (mounted) {
              resolve(null);
            }
          };

          img.onerror = () => {
            clearTimeout(timeoutId);
            if (mounted) {
              reject(new Error('Image load failed'));
            }
          };

          img.src = media.url;
        });

        if (mounted) {
          setIsImageLoading(false);
          console.log('Image loaded successfully:', media.url);
        }
      } catch (error) {
        if (mounted) {
          console.error('Image load error:', error);
          setLoadError(true);
          setIsImageLoading(false);

          if (retryCount < maxRetries) {
            console.log(`Retrying image load (${retryCount + 1}/${maxRetries})...`);
            setRetryCount(prev => prev + 1);
          } else {
            toast({
              title: "Error",
              description: "Failed to load image after multiple attempts",
              variant: "destructive",
            });
          }
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [media.url, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    setLoadError(false);
    setIsImageLoading(true);
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = media.url;
      link.download = media.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardContent className="p-0 relative aspect-video">
            {media.type === 'image' ? (
              <div className="relative w-full h-full bg-muted">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      {retryCount > 0 && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Retrying... ({retryCount}/{maxRetries})
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {loadError ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">Failed to load image</p>
                      {retryCount < maxRetries && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRetry}
                          className="mt-2"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={media.alt || media.name}
                    className={cn(
                      "w-full h-full object-contain transition-opacity duration-300",
                      isImageLoading ? "opacity-0" : "opacity-100"
                    )}
                    onError={() => setLoadError(true)}
                  />
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Badge variant="secondary" className="text-lg">
                  {media.type.toUpperCase()}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="flex-shrink-0 h-48 mt-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Details</h3>
            <Separator className="my-2" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{media.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Size</dt>
                <dd className="font-medium">{formatFileSize(media.size)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{media.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Uploaded</dt>
                <dd className="font-medium">
                  {media.createdAt ? format(new Date(media.createdAt), 'PP') : 'Unknown'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Uploaded By</dt>
                <dd className="font-medium">{media.uploadedByEmail || 'Unknown'}</dd>
              </div>
            </dl>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(media)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default MediaViewer;
