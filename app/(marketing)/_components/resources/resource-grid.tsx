'use client';

import { Resource } from '@/app/types/post';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface ResourceGridProps {
  resources: Resource[];
  onDownload: (resource: Resource) => void;
}

export function ResourceGrid({ resources, onDownload }: ResourceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="border rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{resource.title}</h3>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Size: {resource.fileSize}</span>
              <span>{resource.downloadCount || 0} downloads</span>
            </div>
            <div className="text-xs">
              Added on {formatDate(resource.createdAt)}
            </div>
          </div>
          <Button
            onClick={() => onDownload(resource)}
            className="w-full"
            variant="outline"
          >
            Download
          </Button>
        </div>
      ))}
    </div>
  );
}
