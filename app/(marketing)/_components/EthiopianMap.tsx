"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { regions, Region } from "./Map/regions";
import RegionPath from "./Map/region-path";

interface EthiopianMapProps {
  selectedRegion?: string | null;
  onRegionSelect?: (region: string) => void;
  highlightedRegions?: string[];
}

const EthiopianMap: React.FC<EthiopianMapProps> = ({
  selectedRegion,
  onRegionSelect,
  highlightedRegions = []
}) => {
  const handleRegionClick = (region: Region) => {
    if (onRegionSelect) {
      onRegionSelect(region.title);
    }
  };

  const regionVariants: Variants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: (delay: number) => ({
      opacity: 1,
      pathLength: 1,
      transition: { duration: 0.8, delay },
    }),
  };

  return (
    <div className="w-full aspect-[4/3] relative">
      <motion.svg
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 800 600"
      >
        {regions.map((region, index) => {
          const isHighlighted = highlightedRegions.includes(region.title);
          const isSelected = selectedRegion === region.title;

          return (
            <motion.path
              key={region.id}
              d={region.d}
              variants={regionVariants}
              custom={index * 0.1}
              initial="hidden"
              animate="visible"
              className={`
                transition-colors duration-200
                ${isHighlighted 
                  ? isSelected
                    ? 'fill-blue-600 stroke-white'
                    : 'fill-blue-400 stroke-white hover:fill-blue-500'
                  : 'fill-gray-200 stroke-gray-300 hover:fill-gray-300'
                }
              `}
              style={{
                strokeWidth: isSelected ? 2 : 1,
                cursor: isHighlighted ? 'pointer' : 'default'
              }}
              onClick={() => isHighlighted && handleRegionClick(region)}
            />
          );
        })}
      </motion.svg>
    </div>
  );
};

export default EthiopianMap;
