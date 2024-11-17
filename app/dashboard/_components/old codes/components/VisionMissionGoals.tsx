import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, BarChart2, GraduationCap } from 'lucide-react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import RenderedContent from './render-content';


interface VisionMissionGoalsProps {
  aboutData: Array<{ slug: string; content: string; title: string }>;
}

const VisionMissionGoals: React.FC<VisionMissionGoalsProps> = ({ aboutData }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  const itemVariants = (delay: number): Variants => ({
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
  });

  const items = [
    {
      slug: 'vision',
      title: 'Our Vision',
      icon: Eye,
      delay: 0.2,
    },
    {
      slug: 'mission',
      title: 'Our Mission',
      icon: BarChart2,
      delay: 0.4,
    },
    {
      slug: 'core-values',
      title: 'Our Core Values',
      icon: GraduationCap,
      delay: 0.6,
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 ">
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
        Our Vision, Mission and Goals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8" ref={ref}>
        {items.map((item, index) => {
          const data = aboutData.find(d => d.slug === item.slug);
          return (
            <motion.div
              key={item.slug}
              variants={itemVariants(item.delay)}
              initial="hidden"
              animate={controls}
            >
              <Card className="h-full flex flex-col items-center p-6 gap-5  ">
                <div className="flex flex-col items-center gap-5 ">
                  <div className="bg-gray-200 p-3 rounded-full">
                    {React.createElement(item.icon, { className: "w-6 h-6 text-blue-800 " })}
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-center">
                  {data ? (
                    <RenderedContent content={data.content} />
                  ) : (
                    <p>No content available</p>
                  )}
                </p>
              </Card>

            </motion.div>
          );
        })}
      </div>
    </div >
  );
};

export default VisionMissionGoals;