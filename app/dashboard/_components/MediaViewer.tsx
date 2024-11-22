'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Media } from '@/app/types/media';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface MediaViewerProps {
  media: Media;
  onClose: () => void;
  onEdit: (media: Media) => void;
}

export function MediaViewer({ media, onClose, onEdit }: MediaViewerProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMedia = () => {
    switch (media.type) {
      case 'image':
        return (
          <div className="relative aspect-square">
            <Image
              src={media.url}
              alt={media.alt || media.name}
              fill
              className={`
                object-contain
                transition-opacity duration-300
                ${isImageLoading ? 'opacity-0' : 'opacity-100'}
              `}
              onLoadingComplete={() => setIsImageLoading(false)}
            />
          </div>
        );
      case 'video':
        return (
          <video
            src={media.url}
            controls
            className="w-full"
            style={{ maxHeight: '500px' }}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio
            src={media.url}
            controls
            className="w-full mt-4"
          >
            Your browser does not support the audio tag.
          </audio>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
            <Badge variant="secondary" className="text-lg">
              {media.type.toUpperCase()}
            </Badge>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">{media.name}</CardTitle>
          <CardDescription>
            {media.type.charAt(0).toUpperCase() + media.type.slice(1)} • {formatFileSize(media.size)}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {renderMedia()}

          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-4">
              {media.description && (
                <>
                  <div>
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {media.description}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {media.type === 'image' && media.alt && (
                <>
                  <div>
                    <h4 className="text-sm font-medium">Alt Text</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {media.alt}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {media.type === 'image' && media.caption && (
                <>
                  <div>
                    <h4 className="text-sm font-medium">Caption</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {media.caption}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {media.tags && media.tags.length > 0 && (
                <>
                  <div>
                    <h4 className="text-sm font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {media.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium">Uploaded</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(media.createdAt), 'PPpp')}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">Last Modified</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(media.updatedAt), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => onEdit(media)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}

export default MediaViewer;
