import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Eye, BarChart2, GraduationCap } from 'lucide-react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AboutContent } from '@/app/types/about';
import { PortableText } from '@portabletext/react';

interface VisionMissionGoalsProps {
  aboutData: AboutContent[];
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
      section: 'vision',
      title: 'Our Vision',
      icon: Eye,
      delay: 0.2,
    },
    {
      section: 'mission',
      title: 'Our Mission',
      icon: BarChart2,
      delay: 0.4,
    },
    {
      section: 'core-values',
      title: 'Our Core Values',
      icon: GraduationCap,
      delay: 0.6,
    }
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
        Our Vision, Mission and Goals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8" ref={ref}>
        {items.map((item) => {
          const content = aboutData.find(d => d.section === item.section);
          
          return (
            <motion.div
              key={item.section}
              variants={itemVariants(item.delay)}
              initial="hidden"
              animate={controls}
            >
              <Card className="h-full flex flex-col items-center p-6 gap-5 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col items-center gap-5">
                  <div className="bg-gray-100 p-3 rounded-full">
                    {React.createElement(item.icon, { 
                      className: "w-6 h-6 text-primary"
                    })}
                  </div>
                  <h3 className="text-xl font-semibold text-primary">
                    {item.title}
                  </h3>
                </div>
                <div className="text-muted-foreground text-center prose prose-sm">
                  {content ? (
                    <PortableText value={content.content} />
                  ) : (
                    <p>Content not available</p>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default VisionMissionGoals;
