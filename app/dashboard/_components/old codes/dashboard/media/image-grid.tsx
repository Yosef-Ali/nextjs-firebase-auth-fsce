"use client";

import { SearchResult } from '@/types';
import { ReactNode } from "react";

interface ImageGridProps {
  images: SearchResult[];
  getImage: (imageData: SearchResult) => ReactNode;
}

const MAX_COLUMNS = 4;

export function ImageGrid({ images, getImage }: ImageGridProps) {
  function getColumns(colIndex: number) {
    return images.filter((resource, idx) => idx % MAX_COLUMNS === colIndex);
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {[getColumns(0), getColumns(1), getColumns(2), getColumns(3)].map(
        (column, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            {column.map(getImage)}
          </div>
        )
      )}
    </div>
  );
}