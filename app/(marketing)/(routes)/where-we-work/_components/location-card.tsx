import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Users } from 'lucide-react';
import { Location } from '@/app/types/location';
import { motion } from 'framer-motion';

interface LocationCardProps {
  location: Location;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={location.image}
              alt={location.title}
              fill
              className="object-cover"
            />
            <Badge 
              className="absolute top-4 right-4"
              variant={location.type === 'city' ? 'default' : 'secondary'}
            >
              {location.type === 'city' ? 'City Office' : 'Regional Office'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          <h3 className="text-xl font-semibold mb-2">{location.title}</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{location.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{location.contactInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{location.contactInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{location.beneficiariesCount.toLocaleString()} beneficiaries reached</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button asChild className="w-full">
            <Link href={`/where-we-work/${location.type}/${location.id}`}>
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
