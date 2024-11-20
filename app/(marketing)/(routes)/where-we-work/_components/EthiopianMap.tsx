"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { regions, Region } from "./Map/regions";
import RegionPath from "./Map/region-path";
import Captions from "./caption";

interface TooltipProps {
  data: { id: string; title: string; apo: string; dis: string; } | null;
}

const data = [
  {
    id: "ET-HA",
    title: "Harari People",
    apo: "Harari Site",
    dis: "Engaged over 4,700 volunteer groups to address community problems related to children and youth."
  },
  {
    id: "ET-DD",
    title: "Dire Dawa",
    apo: "Dire Dawa, APO",
    dis: "Rescued trafficked children, rehabilitated sexually exploited children, supported children in conflict with law through child-friendly centers, worked to reduce female genital mutilation."
  },
  {
    id: "ET-SO",
    title: "Somali",
    apo: "Jijiga, Site Office",
    dis: "Engaged over 4,700 volunteer groups to address community problems related to children and youth."
  },
  {
    id: "ET-AA",
    title: "Addis Ababa",
    apo: "Addis Ababa, APO",
    dis: "Rehabilitated and reintegrated sexually abused children, street children, and children in labor."
  },
  {
    id: "ET-BE",
    title: "Benshangul-Gumaz",
    apo: "",
    dis: ""
  },
  {
    id: "ET-OR",
    title: "Oromiya",
    apo: "Adama, APO",
    dis: ""
  },
  {
    id: "ET-GA",
    title: "Gambela Peoples",
    apo: "",
    dis: ""
  },
  {
    id: "ET-SN",
    title: "Southern Nations, Nationalities and Peoples",
    apo: "Wolita Sodo, APO",
    dis: "Supported around 1,136 street children in Sodo town through rehabilitation and reintegration as of 2014."
  },
  {
    id: "ET-AF",
    title: "Afar",
    apo: "",
    dis: ""
  },
  {
    id: "ET-TI",
    title: "Tigray",
    apo: "",
    dis: ""
  },
  {
    id: "ET-AM",
    title: "Amhara",
    apo: "Bahir Dar APO and Dessie APO",
    dis: ""
  }
];

const EthiopianMap: React.FC = () => {
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const memoizedRegions = useMemo(() => regions, []);
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const pathVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.1, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay: i * 0.1, duration: 0.01 }
      }
    })
  };

  const tooltipData = data.find(item => item.id === hoveredRegion?.id);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={sectionVariants}
      className="relative w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-auto"
          >
            {memoizedRegions.map((region, index) => (
              <RegionPath
                key={region.id}
                region={region}
                hoveredRegion={hoveredRegion}
                setHoveredRegion={setHoveredRegion}
                variants={pathVariants}
                custom={index}
                initial="hidden"
                animate="visible"
              />
            ))}
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          {tooltipData && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">{tooltipData.title}</h3>
              {tooltipData.apo && (
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Area Program Office:</span> {tooltipData.apo}
                </p>
              )}
              {tooltipData.dis && (
                <p className="text-gray-600">{tooltipData.dis}</p>
              )}
            </div>
          )}
        </div>
      </div>
      <Captions data={data} region={hoveredRegion} />
    </motion.div>
  );
};

export default EthiopianMap;
