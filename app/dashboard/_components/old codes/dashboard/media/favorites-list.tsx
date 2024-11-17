"use client";

import { useEffect, useState } from "react";
import CloudinaryImage from "./cloudinary-image";
import { SearchResult } from '@/types'; // Adjust the import path as needed
import { ImageGrid } from "./image-grid";

export default function FavoritesList({
  initialResources,
}: {
  initialResources: SearchResult[];
}) {
  const [resources, setResources] = useState(initialResources);

  useEffect(() => {
    setResources(initialResources);
  }, [initialResources]);

  return (
    <ImageGrid
      images={resources}
      getImage={(imageData: SearchResult) => {
        return (
          <CloudinaryImage
            key={imageData.public_id}
            imageData={imageData}
            width={400}
            height={300}
            alt="an image of something"
            path="/favorites"
            onUnfavorited={() => {
              setResources((currentResources) =>
                currentResources.filter(
                  (resource) => resource.public_id !== imageData.public_id
                )
              );
            }}
          />
        );
      }}
    />
  );
}