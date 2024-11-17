import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const WhatWeDoSection: React.FC = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  const imageVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[50vh]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap overflow-hidden">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={imageVariants}
            className="flex flex-col md:flex-row p-8 py-20 max-w-6xl mx-auto"
          >
            <div className="md:w-1/2 relative mb-8 md:mb-0 flex items-center justify-center">
              <img
                src="/images/Child-reunion.jpeg"
                alt="Two people working together"
                className="rounded-lg shadow-lg"
              />
            </div>
            <motion.div
              initial="hidden"
              animate={controls}
              variants={textVariants}
              className="md:w-1/2 md:pl-8"
            >
              <h2 className="text-gray-600 font-semibold mb-2">What We Do!</h2>
              <h1 className="text-4xl font-bold mb-6">We develop &amp; create awesome websites.</h1>

              <div className="space-y-6">
                <motion.div variants={textVariants}>
                  <h3 className="flex items-center text-xl font-semibold mb-2">
                    <span className="text-blue-600 mr-2">01</span>
                    Refreshing Design
                  </h3>
                  <p className="text-gray-600">
                    Clean, refreshing, and high-quality design that gives positive vibes. Figma source files are also provided so you can use them to prototype, experiment, play, or adjust.
                  </p>
                </motion.div>

                <motion.div variants={textVariants}>
                  <h3 className="flex items-center text-xl font-semibold mb-2">
                    <span className="text-blue-600 mr-2">02</span>
                    Developer Friendly
                  </h3>
                  <p className="text-gray-600">
                    Developer experience is our #1 priority. The entire library is designed, coded, and organized in a way that saves hundreds of hours and increases productivity.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WhatWeDoSection;