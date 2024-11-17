
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadButton from './upload-button';
import cloudinary from "cloudinary"
import FavoritesList from './favorites-list';
import { ForceRefresh } from './force-refresh';
import GalleryGrid from './gallery-grid';

import { SearchResult } from '@/types'; // Import the shared type


export default async function Media() {
  let results: { resources: SearchResult[] } = { resources: [] };
  let results_favorites: { resources: SearchResult[] } = { resources: [] };

  try {
    results = (await cloudinary.v2.search
      .expression('resource_type:image AND folder:FSCE')
      .sort_by('created_at', 'desc')
      .with_field('tags')
      .max_results(30)
      .execute()) as { resources: SearchResult[] };

    results_favorites = (await cloudinary.v2.search
      .expression('resource_type:image AND folder:FSCE AND tags=favorite')
      .sort_by('created_at', 'desc')
      .with_field('tags')
      .max_results(30)
      .execute()) as { resources: SearchResult[] };
  } catch (error) {
    console.error('Error fetching data from Cloudinary:', error);
    // Handle the error, e.g., show an error message to the user
  }

  return (

    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-24 md:gap-8">
      <ForceRefresh />
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Gallery</TabsTrigger>
            <TabsTrigger value="Favorite">Favorite</TabsTrigger>
            <TabsTrigger value="Video">Video</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <UploadButton />
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>Gallery</CardTitle>
              <CardDescription>All images in your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <ForceRefresh />
              <GalleryGrid images={results.resources} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="Favorite">
          <Card>
            <CardHeader className="px-7">
              <CardTitle>Favorite</CardTitle>
              <CardDescription>All favorite images in your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <FavoritesList initialResources={results_favorites.resources} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}