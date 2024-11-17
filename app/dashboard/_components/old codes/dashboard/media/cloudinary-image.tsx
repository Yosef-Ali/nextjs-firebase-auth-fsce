"use client";

import { Heart, Copy } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';
import { setAsFavoriteAction } from './actions';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SearchResult } from '@/types'; // Update this path as necessary

interface CloudinaryImageProps {
  imageData: SearchResult;
  width: number;
  height: number;
  alt: string;
  path: string;
  onUnfavorited: () => void;
}

export default function CloudinaryImage({
  imageData,
  width,
  height,
  alt,
  path,
  onUnfavorited
}: CloudinaryImageProps) {
  const router = useRouter();

  const [isFavorited, setIsFavorited] = useState(
    imageData.tags.includes("favorite")
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const imageUrl = `https://res.cloudinary.com/demo/image/upload/${imageData.public_id}.${imageData.format}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    startTransition(() => {
      setAsFavoriteAction(imageData.public_id, !isFavorited);
    });
    router.refresh();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(imageUrl);
    // You might want to show a toast or some feedback here
  };

  useEffect(() => {
    router.refresh();
  }, [isFavorited, router]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer">
          <CldImage
            {...imageData}
            src={imageData.public_id}
            className="rounded-lg"
            width={width}
            height={height}
            alt="Cloudinary Image"
          />
          <Heart
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 hover:text-red-500 cursor-pointer text-white"
            fill={isFavorited ? "red" : "none"}
          />
        </div>
      </DialogTrigger>
      <DialogContent >
        <div className="relative">
          <CldImage
            src={imageData.public_id}
            width={800}
            height={800}
            alt="Enlarged Cloudinary Image"
            className="w-full h-full object-contain"
          />
          <Heart
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 hover:text-red-500 cursor-pointer text-white text-2xl"
            fill={isFavorited ? "red" : "none"}
          />
        </div>
        <DialogFooter className="sm:justify-start p-4">
          <div className="flex items-center space-x-2 w-full">
            <Input
              value={imageUrl}
              readOnly
              className="flex-grow"
            />
            <Button onClick={handleCopyUrl} size="sm" className="px-3">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="mt-2">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}