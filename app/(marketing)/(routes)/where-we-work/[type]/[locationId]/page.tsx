import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail, Users } from 'lucide-react';
import { locationsService } from '@/app/services/locations';

interface LocationPageProps {
  params: {
    type: string;
    locationId: string;
  };
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const location = await locationsService.getLocationById(params.locationId);
  if (!location) return { title: 'Location Not Found' };

  return {
    title: `${location.title} | FSCE`,
    description: `Learn about FSCE's work in ${location.title} and the impact we're making in the community.`,
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const location = await locationsService.getLocationById(params.locationId);
  if (!location) notFound();

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
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

          <div>
            <h1 className="text-4xl font-bold mb-4">{location.title}</h1>
            <div className="prose max-w-none">
              <PortableText value={location.description} />
            </div>
          </div>

          {/* Staff Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {location.staff.map((member) => (
                <Card key={member.name} className="p-4">
                  {member.image && (
                    <div className="relative h-32 w-32 mx-auto mb-4 rounded-full overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold text-center">{member.name}</h3>
                  <p className="text-sm text-muted-foreground text-center">{member.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{location.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{location.contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{location.contactInfo.email}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{location.beneficiariesCount.toLocaleString()} beneficiaries reached</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Programs</h2>
            <div className="space-y-2">
              {location.programs.map((program) => (
                <Badge key={program} variant="outline" className="mr-2">
                  {program}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
