import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface MeritCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const MeritCard = ({ title, description, icon }: MeritCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="p-6 h-full bg-white/5 backdrop-blur-sm border-neutral-200/10 hover:bg-white/10 transition-all duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
};
