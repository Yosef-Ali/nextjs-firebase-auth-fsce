"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Region } from '@/components/Map/regions';

interface CaptionsProps {
  data?: { id: string; title: string; apo: string; dis: string; }[];
  region?: Region | null;
}

const Captions: React.FC<CaptionsProps> = ({ data, region }) => {
  if (!region) {
    return (
      <div className="mt-4 text-center text-gray-600">
        Hover over a region to see the corresponding information
      </div>
    );
  }

  const hoveredRegionData = data?.find((item) => item.id === region.id);

  if (!hoveredRegionData || hoveredRegionData.apo.trim() === "") {
    return (
      <div className="mt-4 text-center text-gray-600">
        No information available for this region
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 mt-4">
      <Avatar className="hidden h-14 w-14 sm:flex rounded-full bg-muted p-3">
        <AvatarImage src="/logo.svg" alt="FSCE Logo" />
        <AvatarFallback>FS</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium leading-none text-left">
          {hoveredRegionData.title}
        </p>
        <p className="text-left text-gray-600">{hoveredRegionData.apo}</p>
        {hoveredRegionData.dis && (
          <p className="text-sm text-gray-500 text-left mt-2">
            {hoveredRegionData.dis}
          </p>
        )}
      </div>
    </div>
  );
};

export default Captions;
