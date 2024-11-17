import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Define the Merit interface
interface Merit {
  _id: string;
  title: string;
  imageUrl: string;
  description: string;
  slug: string;
}

interface MeritsProps {
  merits: Merit[]; // This ensures merits is an array of Merit objects
}

const Merits: React.FC<MeritsProps> = ({ merits }) => {
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

  // Safeguard: Handle case when merits are empty or undefined
  if (!merits || merits.length === 0) {
    return <div className="text-center py-8">No merits available.</div>;
  }

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
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Merits</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Discover the key merits that set us apart.
            </p>
          </div>
          <div className="max-w-5xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {merits.map((merit, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate={controls}
                  variants={variants}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="p-0 flex justify-center items-center">
                      <img
                        src={merit.imageUrl}
                        alt={merit.title}
                        className="w-full h-48 object-contain"
                      />
                    </CardHeader>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold">{merit.title}</h3>
                      <p className="mt-2 text-gray-600">{merit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Merits;