"use client"
import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import RenderedContent from './render-content';

interface KeyActivityProps {
  data: Array<{ slug: string; content: string; title: string }>;
}

const KeyActivity: React.FC<KeyActivityProps> = ({ data }) => {
  const content = data.find(item => item.slug === 'key-activities-include');

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });

  useEffect(() => {
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

  return (
    <div className="py-12 md:py-16 lg:py-24 bg-gray-50">
      <motion.section
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        className="w-full"
      >
        <div className="container mx-auto grid gap-4 px-4 py-8 md:px-6 lg:gap-10">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key activities include</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Key activities include: family support, education access, child reintegration, youth training, community awareness, and protection systems.
            </p>
          </div>
          <div className="max-w-5xl mx-auto p-4">
            <div className="grid grid-cols-1 gap-8 items-center">
              <motion.div
                className="mt-8 pr-8 text-gray-600 flex justify-center items-center"
                initial="hidden"
                animate={controls}
                variants={variants}
              >
                {content ? (
                  <RenderedContent content={content.content} />
                ) : (
                  <p>No content available</p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
export default KeyActivity;
