"use client";

import { generateUploadButton } from "@uploadthing/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "sonner";

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
      <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden border">
        {value ? (
          <div className="relative aspect-square">
            <Image fill className="object-cover" alt="Upload" src={value} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res.length > 0) {
                  onChange(res[0].url);
                  toast.success("Image uploaded successfully");
                }
              }}
              onUploadError={(error: Error) => {
                console.error("Upload error details:", {
                  message: error.message,
                  stack: error.stack
                });
                
                if (error.message.includes("logged in")) {
                  toast.error("Please make sure you are logged in before uploading");
                } else if (error.message.includes("size")) {
                  toast.error("Image must be under 4MB in size");
                } else {
                  toast.error("Failed to upload image. Please try again");
                }
              }}
              onUploadBegin={() => {
                toast.info("Uploading image...");
              }}
              appearance={{
                button: {
                  background: "transparent",
                },
                container: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "2rem",
                },
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
