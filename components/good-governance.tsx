import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { AboutContent } from '@/app/types/about';

interface GoodGovernanceProps {
  aboutData: AboutContent[];
}

const GoodGovernance: React.FC<GoodGovernanceProps> = ({ aboutData }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });
  const governanceContent = aboutData.find(item => item.section === 'governance');

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

  if (!governanceContent) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-16">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={imageVariants}
        className="max-w-5xl mx-auto px-4"
      >
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
            {governanceContent.title}
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center">
            FSCE has a robust governance structure with a General Assembly
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={imageVariants}
            className="md:w-1/2"
          >
            <div className="relative">
              <div className="bg-primary/10 w-64 h-64 rounded-lg absolute top-4 left-4" />
              {governanceContent.coverImage && (
                <img
                  src={governanceContent.coverImage}
                  alt="Governance structure"
                  className="relative z-10 rounded-lg shadow-lg object-cover w-full h-full"
                />
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={controls}
            variants={textVariants}
            className="md:w-1/2 space-y-4"
          >
            <div className="prose prose-sm max-w-none">
              <PortableText value={governanceContent.content} />
            </div>

            <motion.ul
              variants={listVariants}
              className="grid gap-2"
            >
              {['Transparency', 'Accountability', 'Participation', 'Rule of Law'].map((item) => (
                <motion.li
                  key={item}
                  variants={listItemVariants}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="text-primary h-5 w-5" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default GoodGovernance;
