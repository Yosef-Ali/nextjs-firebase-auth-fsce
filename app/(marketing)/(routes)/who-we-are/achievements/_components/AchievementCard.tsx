import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Award } from './AchievementsGrid';
import * as LucideIcons from 'lucide-react';
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AchievementCardProps {
  achievement: Award & { icon?: string | React.ReactNode };
}

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  // Safely render icon
  const renderIcon = () => {
    // If icon is a string, try to get the Lucide icon
    if (typeof achievement.icon === 'string') {
      const IconComponent = LucideIcons[achievement.icon as keyof typeof LucideIcons] as LucideIcon;
      return IconComponent ? <IconComponent className="w-6 h-6 text-primary" /> : null;
    }
    
    // If icon is already a React element, return it directly
    if (React.isValidElement(achievement.icon)) {
      return achievement.icon;
    }
    
    // If icon is a function component, render it
    if (typeof achievement.icon === 'function') {
      const IconComponent = achievement.icon as LucideIcon;
      return <IconComponent className="w-6 h-6 text-primary" />;
    }
    
    // If no valid icon, return null
    return null;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="p-6 h-full flex flex-col bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-4 mb-4">
          {achievement.icon && (
            <div className="p-3 rounded-lg bg-primary/10">
              {renderIcon()}
            </div>
          )}
          <h3 className="text-xl font-semibold text-foreground">{achievement.title}</h3>
        </div>
        <div className="flex-grow">
          <p className="text-muted-foreground">{achievement.description}</p>
        </div>
        {achievement.longDescription && (
          <div className="mt-4 text-sm text-gray-500">
            <p>{achievement.longDescription}</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
