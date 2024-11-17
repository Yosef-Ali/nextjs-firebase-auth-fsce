import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import RenderedContent from './render-content';

interface MasonryGridProps {
  data: Array<{ slug: string, content: string, title: string }>;
}

const YouthEmpowerment: React.FC<MasonryGridProps> = ({ data }) => {
  const content = data.find(item => item.slug === 'youth-empowerment');
  const images = [
    '/images/Child-reunion.jpeg',
    '/images/Child-reunion1.jpeg',
    '/images/demo.png',
  ];

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
    <div className="bg-gray-50">
      <motion.section
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={variants}
        className="w-full py-12 md:py-16 lg:py-24"
      >
        <div className="container mx-auto grid gap-4 px-4 py-8 md:px-6 lg:gap-10">
          <div className="space-y-3 text-center ">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Youth Empowerment</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Unleashing Potential: Empowering Youth for a Brighter Future!
            </p>
          </div>
          <div className="max-w-5xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First Column: Content */}
              <motion.div
                className="mt-8 pr-8 text-gray-600"
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

              {/* Second Column: Masonry Images */}
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial="hidden"
                animate={controls}
                variants={variants}
              >
                {images.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Image ${index + 1}`}
                    className={`w-full rounded-lg ${index % 3 === 0 ? 'col-span-2' : 'col-span-1'}`}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default YouthEmpowerment;
