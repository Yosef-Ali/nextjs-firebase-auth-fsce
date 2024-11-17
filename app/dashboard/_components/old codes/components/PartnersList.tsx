"use client"

import React from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Masonry from 'react-masonry-css';

interface Partner {
  name: string;
  position: string;
  logo: string;
  bio: string;
}

interface PartnersProps {
  partners: Partner[];
}

const Partners: React.FC<PartnersProps> = ({ partners = [] }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  const variants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 3,
    500: 2
  };

  return (
    <div className="bg-gray-50">
      <motion.section
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        className="w-full py-12 md:py-16 lg:py-24"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-3 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Partners</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Meet our dedicated partners who are driving our mission forward.
            </p>
          </div>
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate={controls}
                variants={variants}
                className="mb-4"
              >
                <Card className="overflow-hidden h-full">
                  <CardHeader className="p-0 flex justify-center items-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-48 object-contain"
                    />
                  </CardHeader>
                  <CardContent className="p-6 bg-slate-50">
                    <h3 className="text-xl font-bold">{partner.name}</h3>
                    <p className="text-gray-500">{partner.position}</p>
                    <p className="mt-2 text-gray-600">{partner.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Masonry>
        </div>
      </motion.section>
    </div>
  );
}

export default Partners;