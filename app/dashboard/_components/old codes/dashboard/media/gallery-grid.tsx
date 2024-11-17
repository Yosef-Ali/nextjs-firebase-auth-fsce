"use client";

import { ImageGrid } from "./image-grid";
import { SearchResult } from "@/types";
import CloudinaryImage from "./cloudinary-image";

export default function GalleryGrid({ images }: { images: SearchResult[] }) {
  return (
    <ImageGrid
      images={images}
      getImage={(imageData: SearchResult) => {
        return (
          <CloudinaryImage
            key={imageData.public_id}
            imageData={imageData}
            width={400}
            height={300}
            alt="an image of something"
            path="/gallery" // Add this line
            onUnfavorited={() => { }} // Add this line
          />
        );
      }}
    />
  );
}