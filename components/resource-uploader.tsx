"use client";

import { useState } from "react";
import { generateUploadButton } from "@uploadthing/react";
import { FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const UploadButton = generateUploadButton<OurFileRouter>();

interface ResourceUploaderProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function ResourceUploader({
  onSuccess,
  onError,
}: ResourceUploaderProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("publication");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: "publication", label: "Publication" },
    { value: "report", label: "Report" },
    { value: "media", label: "Media" },
  ];

  const handleUploadComplete = async (res: any) => {
    try {
      if (!res || res.length === 0) {
        throw new Error("No file uploaded");
      }

      if (!title.trim()) {
        throw new Error("Title is required");
      }

      if (!description.trim()) {
        throw new Error("Description is required");
      }

      // Here you would typically call your API to create the resource
      // For now, we'll just simulate success
      onSuccess();
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("publication");
      setUploading(false);
    } catch (error) {
      setUploading(false);
      onError(error instanceof Error ? error : new Error("Failed to upload resource"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={uploading}
          >
            {categories.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Enter title"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
            required
          />

          <textarea
            placeholder="Enter description"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
            required
          />
        </div>
        
        <UploadButton
          endpoint="resourceUploader"
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error: Error) => {
            setUploading(false);
            onError(error);
          }}
        />
      </div>
    </div>
  );
}
