import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import RenderedContent from './render-content';
import { usePathname } from 'next/navigation';

interface OverviewProps {
  data: Array<{ slug: string; content: string; title: string; images?: string[] }>;
  title?: string;  // make it optional since some places might use the default "Overview"
  firstImageAlt?: string;
  secondImageAlt?: string;
}

const Overview: React.FC<OverviewProps> = ({ data, title = "Overview", firstImageAlt, secondImageAlt }) => {
  const pathname = usePathname();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });
  const content = data.find(item => item.slug === 'overview');
  const isHomePage = pathname === '/';

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
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className="min-h-[50vh] flex items-center justify-center bg-gray-50 p-4 py-16"
    >
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-8 gap-6">
        {/* First column */}
        <div className="md:col-span-4 flex items-center ">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div>
              {isHomePage ? (
                <h1 className="text-4xl font-bold mt-4 text-blue-900">Welcome to FSCE</h1>
              ) : (
                <h1 className="text-2xl font-bold mt-4 text-blue-900">What we do</h1>
              )}
            </div>
            <div className="mt-8 pr-8 text-gray-600">
              {content ? (
                <RenderedContent content={content.content} />
              ) : (
                <p>No content available</p>
              )}
            </div>
          </div>
        </div>

        {/* Second column */}
        <div className="md:col-span-2 relative bg-blue-500 rounded-lg shadow-md">
          {content?.images?.map((imageUrl, index) => (
            <img key={index} src={imageUrl} alt={firstImageAlt || `Image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
          ))}
        </div>

        {/* Third column */}
        <div className="md:col-span-2 relative bg-blue-100 rounded-lg shadow-md">
          <img src="/images/old-women-1.webp" alt={secondImageAlt || "Elder woman"} className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;