'use client';

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { useAuthContext } from "@/app/lib/firebase/context";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@uploadthing/react";
import { UploadFileResponse } from "uploadthing/client";

interface ImageUploadProps {
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onChange,
  onRemove,
  value
}) => {
  const { user } = useAuthContext();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);

    acceptedFiles.forEach(file => {
      const formData = new FormData();
      formData.append('file', file);
      // Handle file upload logic
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>
      <div {...getRootProps({
        className: 'border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition'
      })}>
        <input {...getInputProps()} />
        <div className="flex items-center gap-2">
          <FileIcon className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop files here, or click to select files
          </p>
        </div>
        {isUploading && (
          <div className="mt-4 text-sm text-muted-foreground">
            Uploading...
          </div>
        )}
      </div>
      <div className="mt-4">
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res: UploadFileResponse[] | undefined) => {
            if (res?.[0]?.url) {
              onChange(res[0].url);
            }
            setIsUploading(false);
          }}
          onUploadError={(error: Error) => {
            console.error('Upload error:', error);
            setIsUploading(false);
          }}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
