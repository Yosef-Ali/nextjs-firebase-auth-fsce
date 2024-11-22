'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { mediaService } from '@/app/services/media';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { Upload, X } from 'lucide-react';

interface MediaUploaderProps {
  onUploadComplete?: () => void;
  onCancel?: () => void;
}

export function MediaUploader({ onUploadComplete, onCancel }: MediaUploaderProps) {
  const { user } = useUser();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 16 * 1024 * 1024, // 16MB
    onDropRejected: (rejectedFiles) => {
      toast({
        title: 'Upload Error',
        description: 'File must be an image or PDF under 16MB',
        variant: 'destructive',
      });
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload files',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      for (const file of files) {
        await mediaService.uploadMedia(file, {
          type: file.type.startsWith('image/') ? 'image' : 'document',
          name: file.name,
          description: '',
          tags: [],
          alt: '',
          caption: '',
          uploadedBy: user.id,
          uploadedByEmail: user.email || '',
        });
        setProgress((prev) => prev + (100 / files.length));
      }
      toast({ title: 'Success', description: 'Files uploaded successfully' });
      setFiles([]);
      onUploadComplete?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
            ${uploading ? 'pointer-events-none opacity-50' : 'hover:border-primary'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Images and PDFs only (max 16MB)
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {uploading && <Progress value={progress} className="mt-4" />}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardFooter>
    </Card>
  );
}
