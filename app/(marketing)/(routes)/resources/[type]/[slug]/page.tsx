import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { Download, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { resourcesService } from '@/app/services/resources';
import { ResourceCard } from '../../_components/resource-card';
import { ResourcesGrid } from '../../_components/resources-grid';

interface ResourcePageProps {
  params: {
    type: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const resource = await resourcesService.getResourceBySlug(params.slug);
  
  if (!resource) {
    return {
      title: 'Resource Not Found | FSCE',
    };
  }

  return {
    title: `${resource.title} | FSCE Resources`,
    description: resource.description,
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const resource = await resourcesService.getResourceBySlug(params.slug);
  
  if (!resource) {
    notFound();
  }

  const relatedResources = await resourcesService.getRelatedResources(
    resource.id,
    resource.type,
    3
  );

  return (
    <div className="container mx-auto py-8">
      <Link
        href="/resources"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Resources
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-[16/9] relative rounded-lg overflow-hidden">
            <Image
              src={resource.coverImage || '/images/default-resource-cover.jpg'}
              alt={resource.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div>
            <Badge variant="secondary" className="capitalize mb-4">
              {resource.type}
            </Badge>
            <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(resource.publishedDate), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{resource.downloadCount} downloads</span>
              </div>
            </div>

            <div className="prose max-w-none">
              {resource.content}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-lg font-semibold mb-4">Download Resource</h2>
            <Button
              size="lg"
              className="w-full"
              onClick={async () => {
                await resourcesService.incrementDownloadCount(resource.id);
                window.open(resource.fileUrl, '_blank');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download {resource.type}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              By downloading this resource, you agree to our terms of use and privacy policy.
            </p>
          </div>

          {relatedResources.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Related Resources</h2>
              <div className="space-y-4">
                {relatedResources.map((relatedResource) => (
                  <ResourceCard
                    key={relatedResource.id}
                    resource={relatedResource}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
