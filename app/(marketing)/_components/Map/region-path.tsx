"use client";

import React from "react";
import { motion } from "framer-motion";
import { Region } from "./regions";

interface RegionPathProps {
  region: Region;
  hoveredRegion: Region | null;
  setHoveredRegion: (region: Region | null) => void;
  variants: any;
  custom: number;
  initial: string;
  animate: any;
}

const RegionPath: React.FC<RegionPathProps> = ({
  region,
  hoveredRegion,
  setHoveredRegion,
  variants,
  custom,
  initial,
  animate,
}) => {
  const isHovered = hoveredRegion?.id === region.id;

  return (
    <motion.path
      key={region.id}
      d={region.d}
      variants={variants}
      custom={custom}
      initial={initial}
      animate={animate}
      onHoverStart={() => setHoveredRegion(region)}
      onHoverEnd={() => setHoveredRegion(null)}
      className={`
        transition-colors duration-200
        ${isHovered ? "fill-blue-500" : "fill-blue-200"}
        hover:fill-blue-400
        stroke-gray-600
      `}
      style={{ strokeWidth: 1 }}
    />
  );
};

export default RegionPath;
