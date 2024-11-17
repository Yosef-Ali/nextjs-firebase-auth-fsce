import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Upload, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CldUploadButton, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useImageStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { PostStatusSelect } from "./form/post-status-select";

// Cloudinary configuration
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  throw new Error('Missing Cloudinary configuration');
}

interface ImageUploaderCardProps {
  maxImages?: number;
  initialImages?: string[];
  onImagesChange?: (images: string[]) => void;
}

export const ImageUploaderCard = ({
  maxImages = 3,
  initialImages = [],
  onImagesChange,
}: ImageUploaderCardProps) => {
  const { images, addImage, removeImage, setImages } = useImageStore();
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages);
  const router = useRouter();

  // Initialize images from props
  useEffect(() => {
    if (initialImages?.length) {
      setImages(initialImages);
      setUploadedImages(initialImages);
    }
    return () => {
      setImages([]);
      setUploadedImages([]);
    };
  }, [initialImages, setImages]);

  // Notify parent of image changes
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(uploadedImages);
    }
  }, [uploadedImages, onImagesChange]);

  const handleUpload = useCallback(
    (results: CloudinaryUploadWidgetResults) => {
      setIsUploading(false);

      if (!results.info) {
        console.error("Upload failed: No results info");
        setError('Upload failed. Please try again.');
        return;
      }

      if (results.event === "success" && results.info) {
        const info = results.info as CloudinaryUploadWidgetInfo;
        let newImages = [...uploadedImages];

        // Add the new image to the array if we haven't reached max
        if (newImages.length < maxImages) {
          newImages.push(info.secure_url);
          setUploadedImages(newImages);
          setImages(newImages);

          if (onImagesChange) {
            onImagesChange(newImages);
          }
        } else {
          setError(`You can only upload up to ${maxImages} images.`);
        }

        setError(null);
      } else {
        console.error("Image upload failed:", results.event);
        setError('Upload failed. Please try again.');
      }
    },
    [uploadedImages, maxImages, onImagesChange, setImages]
  );

  const handleRemoveImage = (indexToRemove: number) => {
    try {
      let updatedImages = [...uploadedImages];
      updatedImages.splice(indexToRemove, 1);

      setUploadedImages(updatedImages);
      setImages(updatedImages);

      if (onImagesChange) {
        onImagesChange(updatedImages);
      }

      setError(null);
    } catch (error) {
      setError('Failed to remove image.');
    }
  };

  // Cloudinary configuration
  const cloudinaryConfig = {
    cloudName: CLOUD_NAME,
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Images</CardTitle>
        <CardDescription>Upload up to {maxImages} images</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {/* Image grid */}
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: maxImages }).map((_, index) => (
              <div key={index} className="relative group">
                {uploadedImages[index] ? (
                  <>
                    <Image
                      alt={`Image ${index + 1}`}
                      className="aspect-square w-full rounded-md object-cover"
                      height={150}
                      src={uploadedImages[index]}
                      width={150}
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <CldUploadButton
                    onSuccess={handleUpload}
                    uploadPreset={UPLOAD_PRESET}
                    options={{
                      maxFiles: 1,
                      sources: ['local', 'url', 'camera'],
                      maxFileSize: 10000000,
                      resourceType: "image",
                      clientAllowedFormats: ["png", "gif", "jpeg", "jpg", "webp"],
                      maxImageFileSize: 10000000,
                    }}
                    className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed hover:bg-gray-50 transition-colors group"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CldUploadButton>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};