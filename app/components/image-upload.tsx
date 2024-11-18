"use client";

import { generateUploadButton } from "@uploadthing/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const UploadButton = generateUploadButton<OurFileRouter>();

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
}

export function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value,
}: ImageUploadProps) {
  return (
    <div className="mb-4 flex items-center gap-4">
      <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
        {value ? (
          <div className="relative aspect-square">
            <Image fill className="object-cover" alt="Upload" src={value} />
          </div>
        ) : (
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                onChange(res[0].url);
              }
            }}
            onUploadError={(error) => {
              console.error(error);
            }}
          />
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
          <Trash className="h-4 w-4" />
          Remove
        </Button>
      )}
    </div>
  );
}
