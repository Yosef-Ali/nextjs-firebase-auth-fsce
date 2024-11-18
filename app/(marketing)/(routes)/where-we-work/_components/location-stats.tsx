import { Building2, Users, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LocationStatistics } from '@/app/types/location';
import { motion } from 'framer-motion';

interface LocationStatsProps {
  stats: LocationStatistics;
}

export function LocationStats({ stats }: LocationStatsProps) {
  const statItems = [
    {
      icon: Building2,
      label: 'City Offices',
      value: stats.cityOffices,
    },
    {
      icon: MapPin,
      label: 'Regional Offices',
      value: stats.regionalOffices,
    },
    {
      icon: Users,
      label: 'Beneficiaries Reached',
      value: stats.beneficiariesReached.toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
