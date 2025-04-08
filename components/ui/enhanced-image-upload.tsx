"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash, Upload } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";

interface EnhancedImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
  label?: string;
  maxSizeMB?: number;
}

export function EnhancedImageUpload({
  disabled,
  onChange,
  onRemove,
  value,
  label = "Upload Image",
  maxSizeMB = 4
}: EnhancedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes

  // Reset image error when value changes
  useEffect(() => {
    setImageError(false);
  }, [value]);

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > maxSize) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB`);
      return;
    }

    if (!user?.uid) {
      toast.error("You must be logged in to upload images");
      return;
    }

    try {
      setUploading(true);
      toast.info("Uploading image...");

      // Create a unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const safeFileName = file.name.replace(/[^\w.-]/g, '-');
      const fileName = `uploads/${user.uid}-${timestamp}-${randomString}-${safeFileName}`;
      
      console.log('Creating storage reference for:', fileName);
      const storageRef = ref(storage, fileName);

      // Upload with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.uid,
          originalName: file.name
        }
      };

      // Upload the file
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log('Upload successful:', uploadResult);

      // Get the download URL
      const url = await getDownloadURL(uploadResult.ref);
      console.log('Download URL:', url);
      
      // Update the parent component
      onChange(url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error 
        ? `Upload failed: ${error.message}` 
        : "Failed to upload image. Please try again");
    } finally {
      setUploading(false);
      // Clear the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleImageError = () => {
    console.log('Image failed to load:', value);
    setImageError(true);
  };

  return (
    <div className="space-y-4">
      {value && !imageError ? (
        <div className="relative aspect-square w-full max-w-[300px] rounded-md overflow-hidden border">
          <Image
            fill
            src={value}
            alt="Uploaded image"
            className="object-cover"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <Button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-10"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full max-w-[300px] h-[200px] rounded-md border-2 border-dashed p-4">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-xs text-muted-foreground mb-4">Max size: {maxSizeMB}MB</p>
          <Input
            type="file"
            accept="image/*"
            onChange={onUpload}
            disabled={disabled || uploading}
            className="max-w-[200px]"
          />
          {uploading && <p className="text-xs text-muted-foreground mt-2">Uploading...</p>}
          {imageError && value && (
            <p className="text-xs text-red-500 mt-2">
              Failed to load the previous image. Please upload a new one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
