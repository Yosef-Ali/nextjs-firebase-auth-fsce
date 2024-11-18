import { Metadata } from 'next';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { locationsService } from '@/app/services/locations';
import { LocationCard } from './_components/location-card';
import { LocationStats } from './_components/location-stats';
import { LocationsMap } from './_components/locations-map';

export const metadata: Metadata = {
  title: 'Where We Work | FSCE',
  description: 'Explore FSCE\'s presence across Ethiopia, from city offices to regional centers.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function WhereWeWorkPage() {
  const [locations, stats] = await Promise.all([
    locationsService.getAllLocations(),
    locationsService.getLocationStatistics(),
  ]);

  const cityLocations = locations.filter(loc => loc.type === 'city');
  const regionalLocations = locations.filter(loc => loc.type === 'regional');

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Where We Work</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          FSCE operates across Ethiopia through a network of city and regional offices,
          working directly with communities to create lasting positive change.
        </p>
      </div>

      <LocationStats stats={stats} />

      <div className="h-[400px] w-full rounded-lg overflow-hidden">
        <Suspense fallback={<div>Loading map...</div>}>
          <LocationsMap locations={locations} />
        </Suspense>
      </div>

      <Tabs defaultValue="city" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="city">City Offices</TabsTrigger>
          <TabsTrigger value="regional">Regional Offices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="city">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {cityLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="regional">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {regionalLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
