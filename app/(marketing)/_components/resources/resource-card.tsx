import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Download, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Resource } from '@/app/types/resource';
import { resourcesService } from '@/app/services/resources';
import { motion } from 'framer-motion';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const handleDownload = async () => {
    // Increment download count
    await resourcesService.incrementDownloadCount(resource.id);
    
    // Open the file in a new tab
    window.open(resource.fileUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col">
        <CardContent className="p-4 flex-grow">
          <div className="aspect-[3/2] relative mb-4">
            <Image
              src={resource.coverImage || '/images/default-resource-cover.jpg'}
              alt={resource.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Badge variant="secondary" className="capitalize">
              {resource.type}
            </Badge>
            
            <Link href={`/resources/${resource.type}/${resource.slug}`}>
              <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
                {resource.title}
              </h3>
            </Link>
            
            <p className="text-sm text-muted-foreground line-clamp-3">
              {resource.description}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {resource.publishedDate && format(new Date(resource.publishedDate), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{resource.downloadCount}</span>
            </div>
          </div>
          
          <Button
            variant="default"
            className="w-full"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
