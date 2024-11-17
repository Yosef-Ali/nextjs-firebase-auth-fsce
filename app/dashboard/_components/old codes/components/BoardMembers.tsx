import React, { useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface BoardMember {
  name: string;
  position: string;
  image: string;
  bio: string;
}

interface BoardMembersProps {
  members: BoardMember[];
}

const BoardMembers: React.FC<BoardMembersProps> = ({ members }) => {
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
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Board Members</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Meet our dedicated board members who are driving our mission forward.
            </p>
          </div>
          <div className="max-w-5xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  animate={controls}
                  variants={variants}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-48 object-cover"
                      />
                    </CardHeader>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      <p className="text-gray-500">{member.position}</p>
                      <p className="mt-2 text-gray-600">{member.bio}</p>
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
}

export default BoardMembers;