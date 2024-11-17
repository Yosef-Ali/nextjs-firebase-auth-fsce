import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle } from 'lucide-react';

const FeaturesSection: React.FC = () => {
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

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const listItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={imageVariants}
        className="max-w-5xl mx-auto py-20"
      >
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
                src="/images/Child-reunion1.jpeg"
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
            <h2 className="text-gray-600 font-semibold mb-2">GAIN MORE LOYAL CUSTOMERS</h2>
            <h1 className="text-4xl font-bold mb-4">Powerful AI Features Built for Conversations</h1>
            <p className="text-gray-600 mb-6">
              Boost your conversions with automation and provide human-like answers to customers 24/7 with an AI chatbot.
            </p>
            <motion.ul
              initial="hidden"
              animate={controls}
              variants={listVariants}
              className="space-y-3 mb-6"
            >
              {[
                'Treat every website visitor like a VIP',
                'Recommend products at optimal moments',
                'Create remarkable customer journeys with our Tool'
              ].map((feature, index) => (
                <motion.li key={index} variants={listItemVariants} className="flex items-center">
                  <CheckCircle className="text-blue-600 mr-2" size={20} />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturesSection;