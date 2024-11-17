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

const MapComponent: React.FC = () => {
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

  const regionVariants: Variants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: (delay: number) => ({
      opacity: 1,
      pathLength: 1,
      transition: { duration: 0.8, delay },
    }),
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={sectionVariants}
      className="max-w-3xl mx-auto py-16"
    >
      <div className="container mx-auto lg:gap-10 ">
        <motion.div className="space-y-4 text-center">
          <motion.h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Graphic Intervention Areas</motion.h2>
          <motion.p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">Protecting children&apos;s rights, rehabilitating vulnerable children, combating harmful practices, and empowering youth through community engagement across Ethiopia.</motion.p>
          <motion.h4 className="text-xl font-bold tracking-tighter sm:text-1xl md:text-2xl text-gray-500">2023</motion.h4>
          <div className="flex flex-col items-center justify-center gap-4">
            <motion.svg
              className="default-svg w-full h-full py-4 z-0"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 800 600"
            >
              {memoizedRegions.map((region, index) => (
                <RegionPath
                  key={region.id}
                  region={region}
                  hoveredRegion={hoveredRegion}
                  setHoveredRegion={setHoveredRegion}
                  variants={regionVariants}
                  custom={index * 0.2}
                  initial="hidden"
                  animate={controls}
                />
              ))}
            </motion.svg>
            <motion.div
              className="w-full min-h-[100px] mt-4"
              variants={sectionVariants}
            >
              <Captions data={data} region={hoveredRegion} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MapComponent;