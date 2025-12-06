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
  const [urlInput, setUrlInput] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFirebaseStorageUrl = (url: string): boolean => {
    return url.includes('firebasestorage.googleapis.com');
  };

  const handleRemove = async (url: string) => {
    try {
      if (isFirebaseStorageUrl(url)) {
        console.log('Attempting to remove Firebase image:', url);
        try {
          const fileRef = ref(storage, url);
          await deleteObject(fileRef);
          console.log('Successfully deleted from Firebase:', url);
          toast({
            title: "Success",
            description: "Image removed successfully"
          });
        } catch (error) {
          console.error('Firebase deletion error:', {
            error,
            url,
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      onRemove(url);
    } catch (error) {
      console.error('Error in handleRemove:', {
        error,
        url,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      toast({
        title: "Error",
        description: "Failed to remove image completely, but removed from form",
        variant: "destructive"
      });
      onRemove(url);
    }
  };

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event?.target?.files?.[0]) {
      return;
    }

    try {
      // Check if Firebase Storage is initialized
      if (!storage) {
        console.error('Firebase Storage is not initialized');
        throw new Error('Storage service is not available');
      }

      const file = event.target.files[0];

      // Log the upload attempt
      console.log('Starting upload process:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        userAuth: !!user,
        userId: user?.uid || 'NO_USER_ID',
        storageInitialized: !!storage
      });

      // Rest of validation
      if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5MB');
      }

      if (!user?.uid) {
        console.error('No authenticated user for upload');
        toast({
          title: "Authentication Required",
          description: "Please log in to upload images",
          variant: "destructive"
        });
        throw new Error('Authentication required for upload');
      }

      setUploading(true);

      // Clean filename and create path
      const sanitizedName = file.name.replace(/[^\w.-]/g, '-');
      const fileName = `partners/${user.uid}-${Date.now()}-${sanitizedName}`;

      console.log('Creating storage reference for:', fileName);
      const fileRef = ref(storage, fileName);

      // Upload with explicit content type and error handling
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.uid,
          originalName: file.name
        }
      };

      console.log('Starting upload with metadata:', metadata);
      let uploadResult;
      try {
        uploadResult = await uploadBytes(fileRef, file, metadata);
        console.log('Upload successful:', uploadResult);
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        throw uploadError;
      }

      console.log('Getting download URL');
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      console.log('Download URL received:', downloadUrl);

      if (!downloadUrl || typeof downloadUrl !== 'string') {
        throw new Error('Invalid download URL received from storage');
      }

      onChange(downloadUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });

    } catch (error: unknown) {
      console.error('Upload error:', {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined
      });

      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleImageError = async (url: string) => {
    console.error('Image load error:', url);
    
    // Check if the URL is from Firebase Storage
    if (isFirebaseStorageUrl(url)) {
      try {
        // Try to verify if the file still exists
        const fileRef = ref(storage, url);
        await getDownloadURL(fileRef);
      } catch (error) {
        // If we get an error, the file probably doesn't exist anymore
        console.log('Firebase file verification failed:', error);
        toast({
          title: "Image Unavailable",
          description: "This image is no longer available and will be removed",
          variant: "destructive"
        });
        onRemove(url);
        return;
      }
    }
    
    // For non-Firebase URLs or if the file exists but still fails to load
    toast({
      title: "Image Load Error",
      description: "Failed to load image. Please check the image URL",
      variant: "destructive"
    });
  };

  if (!isMounted) {
    return null;
  }

  const handleUrlSubmit = () => {
    if (urlInput && urlInput.trim()) {
      const trimmedUrl = urlInput.trim();
      // Basic URL validation
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        onChange(trimmedUrl);
        setUrlInput("");
        toast({
          title: "Success",
          description: "Image URL added successfully"
        });
      } else {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL starting with http:// or https://",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px]">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => handleRemove(url)}
                variant="destructive"
                size="icon"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover rounded-lg"
              alt="Image"
              src={url}
              onError={() => handleImageError(url)}
              sizes="200px"
              priority={false}
              loading="lazy"
            />
          </div>
        ))}
      </div>
      
      {/* File Upload Option */}
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

      {/* URL Input Option */}
      <div className="border-t pt-4 mt-4">
        <p className="text-sm text-muted-foreground mb-2">Or paste image URL from media gallery:</p>
        <div className="flex items-center gap-2">
          <Input
            type="url"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            disabled={disabled || !urlInput.trim()}
            variant="outline"
          >
            Add URL
          </Button>
        </div>
      </div>
    </div>
  );
};
