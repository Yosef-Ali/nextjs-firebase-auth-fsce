"use client";

import { CustomUploadButton } from '@/components/ui/upload-button';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
  className?: string;
}

export function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value,
  className
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className={`mb-4 flex items-center gap-4 ${className}`}>
      <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden border">
        {value ? (
          <div className="relative aspect-square">
            <Image fill className="object-cover" alt="Upload" src={value} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <CustomUploadButton
              endpoint="imageUploader"
              onUploadBegin={() => {
                setIsUploading(true);
              }}
              onClientUploadComplete={(res) => {
                setIsUploading(false);
                if (res?.[0]) {
                  onChange(res[0].fileUrl);
                  toast({
                    title: "Success",
                    description: "Image uploaded successfully"
                  });
                }
              }}
              onUploadError={(error: Error) => {
                setIsUploading(false);
                toast({
                  title: "Error",
                  description: error.message || "Failed to upload image",
                  variant: "destructive"
                });
              }}
            />
          </div>
        )}
      </div>
      {value && (
        <Button
          type="button"
          disabled={disabled}
          variant="destructive"
          size="sm"
          onClick={onRemove}
        >
          <Trash className="h-4 w-4 mr-2" />
          Remove
        </Button>
      )}
    </div>
  );
}
