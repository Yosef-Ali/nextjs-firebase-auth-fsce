import { FileText, Download, BookOpen, FileSearch } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ResourceStatistics } from '@/app/types/resource';
import { motion } from 'framer-motion';

interface ResourceStatsProps {
  stats: ResourceStatistics;
}

export function ResourceStats({ stats }: ResourceStatsProps) {
  const statItems = [
    {
      icon: FileText,
      label: 'Total Resources',
      value: stats.totalResources,
    },
    {
      icon: Download,
      label: 'Total Downloads',
      value: stats.totalDownloads.toLocaleString(),
    },
    {
      icon: BookOpen,
      label: 'Publications',
      value: stats.resourcesByType.publication,
    },
    {
      icon: FileSearch,
      label: 'Research Papers',
      value: stats.resourcesByType.research,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
