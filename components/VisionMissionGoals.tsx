import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Eye, BarChart2, GraduationCap } from 'lucide-react';
import { AboutContent } from '@/app/types/about';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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
    }
  }, [controls, inView]);

  useEffect(() => {
    console.log('VisionMissionGoals received data:', {
      count: aboutData.length,
      data: aboutData.map(item => ({
        id: item.id,
        title: item.title,
        section: item.section,
        category: item.category,
        content: typeof item.content === 'string' ? item.content.substring(0, 50) + '...' : 'Non-string content'
      }))
    });
  }, [aboutData]);

  // Filter content by section
  const visionContent = aboutData.find(item => item.section === 'vision');
  const missionContent = aboutData.find(item => item.section === 'mission');
  const valuesContent = aboutData.find(item => item.section === 'values');

  // Function to render content safely
  const renderContent = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText;
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const cards = [
    {
      title: "Our Vision",
      icon: Eye,
      content: visionContent,
      index: 0
    },
    {
      title: "Our Mission",
      icon: BarChart2,
      content: missionContent,
      index: 1
    },
    {
      title: "Our Values",
      icon: GraduationCap,
      content: valuesContent,
      index: 2
    }
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <motion.h2 
        className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Our Vision, Mission and Values
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8" ref={ref}>
        {cards.map(({ title, icon: Icon, content, index }) => (
          <motion.div
            key={title}
            custom={index}
            initial="hidden"
            animate={controls}
            variants={cardVariants}
          >
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
              </div>
              <div className="flex-grow prose prose-sm">
                {content?.content ? (
                  <p>{renderContent(content.content)}</p>
                ) : (
                  <p className="text-muted-foreground">We're working on {title.toLowerCase()} content. Stay tuned!</p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default VisionMissionGoals;
