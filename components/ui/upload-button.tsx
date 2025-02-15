'use client';

import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { cn } from "@/lib/utils";

export const UploadButton = generateUploadButton<OurFileRouter>();

interface CustomUploadButtonProps {
  endpoint: keyof OurFileRouter;
  onUploadBegin?: () => void;
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

export function CustomUploadButton({
  endpoint,
  onUploadBegin,
  onClientUploadComplete,
  onUploadError,
  className,
}: CustomUploadButtonProps) {
  return (
    <UploadButton
      endpoint={endpoint}
      onUploadBegin={onUploadBegin}
      onClientUploadComplete={onClientUploadComplete}
      onUploadError={onUploadError}
      appearance={{
        button: `${cn(
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'px-4 py-2 rounded-md',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}`,
      }}
    />
  );
}