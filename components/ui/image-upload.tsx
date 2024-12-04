"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/providers/AuthProvider";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFirebaseStorageUrl = (url: string): boolean => {
    return url.includes('firebasestorage.googleapis.com');
  };

  const handleRemove = async (url: string) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to remove images",
          variant: "destructive"
        });
        return;
      }

      // Only attempt to delete from Firebase Storage if it's a Firebase URL
      if (isFirebaseStorageUrl(url)) {
        try {
          // Extract the file path from the URL
          const urlPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
          const fileRef = ref(storage, urlPath);
          
          // Delete the file from storage
          await deleteObject(fileRef);
          toast({
            title: "Success",
            description: "Image removed successfully"
          });
        } catch (error) {
          console.error('Error deleting from Firebase:', error);
          // Continue with removal even if Firebase deletion fails
        }
      }

      // Always remove from form state
      onRemove(url);
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image completely, but removed from form",
        variant: "destructive"
      });
      // Still remove from form even if storage delete fails
      onRemove(url);
    }
  };

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload images",
          variant: "destructive"
        });
        return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      setUploading(true);
      
      // Delete existing image if there is one and it's a Firebase Storage URL
      if (value[0] && isFirebaseStorageUrl(value[0])) {
        await handleRemove(value[0]);
      }

      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
      const fileRef = ref(storage, `partners/${fileName}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      onChange(downloadUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-lg overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button 
                type="button" 
                onClick={() => handleRemove(url)} 
                variant="destructive" 
                size="sm"
                disabled={disabled || uploading}
              >
                <Trash className="h-4 w-4" />
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
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={onUpload}
          disabled={disabled || uploading}
          className="cursor-pointer"
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      </div>
    </div>
  );
}
