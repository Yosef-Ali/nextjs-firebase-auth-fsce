"use client";

import { generateUploadButton } from "@uploadthing/react";
import { FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { ResourceType } from "@/app/types/resource";
import { useState } from "react";

const UploadButton = generateUploadButton<OurFileRouter>();

interface ResourceUploaderProps {
  disabled?: boolean;
  onChange: (data: { url: string; title: string; description: string }) => void;
  onRemove: () => void;
  value: string;
  resourceType?: ResourceType;
  onTypeChange?: (type: ResourceType) => void;
}

export function ResourceUploader({
  disabled,
  onChange,
  onRemove,
  value,
  resourceType = "publication",
  onTypeChange,
}: ResourceUploaderProps) {
  const resourceTypes: ResourceType[] = ["publication", "report", "toolkit", "research"];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="flex flex-col gap-4">
      {!value ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={resourceType}
              onChange={(e) => onTypeChange?.(e.target.value as ResourceType)}
              disabled={disabled}
            >
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Enter title"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled}
            />

            <textarea
              placeholder="Enter description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <UploadButton
            endpoint="resourceUploader"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                onChange({
                  url: res[0].url,
                  title,
                  description
                });
              }
            }}
            onUploadError={(error: Error) => {
              console.error(error);
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4 border rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <div className="text-sm text-gray-500 mb-2">
                  {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}
                </div>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-500 hover:underline"
              >
                View file
              </a>
              <Button
                type="button"
                onClick={onRemove}
                variant="destructive"
                size="sm"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
