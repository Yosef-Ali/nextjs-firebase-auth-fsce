import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Region } from './regions';
import './RegionPath.css';

interface RegionPathProps {
  region: Region;
  setHoveredRegion: (region: Region | null) => void;
  hoveredRegion: Region | null;
  variants: Variants;
  custom: number;
  initial: string;
  animate: any;
}

const RegionPath: React.FC<RegionPathProps> = ({
  region,
  setHoveredRegion,
  hoveredRegion,
  variants,
  custom,
  initial,
  animate,
}) => {
  const [tooltipVisible, setTooltipVisible] = React.useState(false);

  return (
    <motion.svg role="img" initial={initial} animate={animate} variants={variants} custom={custom}>
      <motion.path
        {...region}
        fill={hoveredRegion === region ? region.hoverFillColor : region.fillColor}
        stroke={region.strokeColor}
        strokeWidth={region.strokeWidth}
        onMouseEnter={() => {
          setHoveredRegion(region);
          setTooltipVisible(true);
        }}
        onMouseLeave={() => {
          setHoveredRegion(null);
          setTooltipVisible(false);
        }}
        className="region-path"
      >
        <title>{region.tooltiptext}</title>
      </motion.path>
    </motion.svg>
  );
};

export default RegionPath;