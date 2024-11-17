"use client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { CldUploadButton, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadButton() {
  const [imageId, setImageId] = useState<string | null>(null);

  const router = useRouter();
  return (

    <Button asChild size="sm" className="h-8 gap-1" >
      <div className="flex items-center gap-1">
        <Upload className="h-3.5 w-3.5" />
        <CldUploadButton
          onSuccess={(results: CloudinaryUploadWidgetResults) => {
            if (results.event === "success" && results.info) {
              const info = results.info as CloudinaryUploadWidgetInfo;
              setImageId(info.secure_url);
            } else {
              console.error("Image upload failed:", results.event);
            }
            setTimeout(() => {
              router.refresh();
            }, 1000);
          }}
          uploadPreset="fsce2024"
        />
      </div>
    </Button>

  );
}