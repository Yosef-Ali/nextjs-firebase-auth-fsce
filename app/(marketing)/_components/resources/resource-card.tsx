import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/app/utils/date';
import { Download, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    await resourcesService.incrementDownloadCount(resource.id);
    window.open(resource.fileUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden h-full transition-all duration-300 hover:shadow-lg flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={resource.coverImage || "/images/placeholder.svg"}
            alt={resource.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="text-white">
              <Badge variant="secondary" className="mb-2 capitalize">
                {resource.type}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-6 flex flex-col flex-grow">
          <div className="space-y-3 flex-grow">
            <div className="flex items-center text-sm text-muted-foreground space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                {resource.publishedDate ? formatDate(resource.publishedDate) : 'No date'}
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {resource.title}
            </h2>
            <p className="text-muted-foreground text-sm line-clamp-3">
              {resource.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              <span>{resource.downloadCount} downloads</span>
            </div>
          </div>

          <div className="pt-4 border-t mt-auto flex gap-4">
            <Button
              variant="ghost"
              className="flex-1 justify-between px-0 hover:bg-transparent text-muted-foreground hover:text-primary"
              onClick={handleDownload}
            >
              <span className="group-hover:underline">Download</span>
              <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Button>

            <Link href={`/resources/${resource.type}/${resource.slug}`} className="group/link flex-1">
              <Button
                variant="ghost"
                className="w-full justify-between px-0 hover:bg-transparent text-muted-foreground hover:text-primary"
              >
                <span className="group-hover/link:underline">Details</span>
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
