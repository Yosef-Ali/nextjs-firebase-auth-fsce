"use client";

import { useState } from "react";
import { generateUploadButton } from "@uploadthing/react";
import { FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const UploadButton = generateUploadButton<OurFileRouter>();

interface ResourceUploaderProps {
  value: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  onRemove: () => void;
}

export function ResourceUploader({
  value,
  disabled,
  onChange,
  onRemove,
}: ResourceUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUploadComplete = async (res: any) => {
    try {
      if (!res || res.length === 0) {
        throw new Error("No file uploaded");
      }

      const fileUrl = res[0].url;
      onChange(fileUrl);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-4">
      {value && (
        <div className="flex items-center gap-2 overflow-hidden rounded-md border p-2">
          <FileIcon className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs truncate">{value}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!value && (
        <UploadButton
          endpoint="resourceUploader"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onUploadBegin={() => setUploading(true)}
          appearance={{
            button: {
              pointerEvents: disabled || uploading ? 'none' : 'auto',
              opacity: disabled || uploading ? 0.5 : 1,
            },
          }}
        />
      )}
    </div>
  );
}
