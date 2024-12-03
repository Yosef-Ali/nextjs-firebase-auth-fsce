import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Merit } from './Merit';

interface MeritCardProps {
  merit: Merit;
}

export const MeritCard = ({ merit }: MeritCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="p-6 h-full flex flex-col bg-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            {merit.icon}
          </div>
          <h3 className="text-xl font-semibold text-foreground">{merit.title}</h3>
        </div>
        <div className="flex-grow">
          <p className="text-muted-foreground">{merit.description}</p>
        </div>
      </Card>
    </motion.div>
  );
};
