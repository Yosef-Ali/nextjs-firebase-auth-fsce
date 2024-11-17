import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle } from 'lucide-react';
import RenderedContent from './render-content';
import { Id } from '../../convex/_generated/dataModel';

interface GoodGovernanceProps {
  aboutData: Array<{
    _id: Id<"posts">;
    _creationTime: number;
    image?: string;
    author: {
      name: string;
      image: string;
      id: string;
    };
    title: string;
    slug: string;
    content: any;
    excerpt: string;
    status: "draft" | "published" | "archived";
    category: string;
    updatedAt: number;
  }>;
}


const GoodGovernance: React.FC<GoodGovernanceProps> = ({ aboutData }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });
  const governanceContent = aboutData.find(item => item.slug === 'governance');

  console.log('goodGovernanceContent:', governanceContent);


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

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const listItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 p-4 ">

      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={imageVariants}
        className="max-w-5xl mx-auto py-20"
      >
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">Governance</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 text-center">
            {`FSCE has a robust governance structure with a General Assembly `}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center rounded">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={imageVariants}
            className="md:w-1/2 mb-8 md:mb-0"
          >
            <div className="relative">
              <div className="bg-purple-100 w-64 h-64 rounded-lg absolute top-4 left-4"></div>
              <img
                src={governanceContent ? governanceContent.image : ''}
                alt="AI visualization"
                className="relative z-10 rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            animate={controls}
            variants={textVariants}
            className="md:w-1/2 md:pl-8"
          >

            <h2 className="text-gray-600 font-semibold mb-2">GOVERNANCE</h2>
            <RenderedContent content={governanceContent?.content || ''} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoodGovernance;