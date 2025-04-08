'use client';

import { useState } from 'react';
import { EnhancedImageUpload } from '@/components/ui/enhanced-image-upload';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from 'sonner';

export default function EnhancedUploadTest() {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleImageChange = (url: string) => {
    console.log('Image URL changed:', url);
    setImageUrl(url);
  };

  const handleImageRemove = () => {
    console.log('Image removed');
    setImageUrl('');
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster position="top-center" />
      
      <h1 className="text-3xl font-bold mb-8">Enhanced Image Upload Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>
              You need to be logged in to upload images
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-md">
                <p>✅ Logged in as: {user.email}</p>
                <p className="text-sm">User ID: {user.uid}</p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                <p>❌ Not logged in</p>
                <p className="text-sm">Please log in to upload images</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enhanced Image Upload</CardTitle>
            <CardDescription>
              Try uploading an image with our improved component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedImageUpload
              value={imageUrl}
              onChange={handleImageChange}
              onRemove={handleImageRemove}
              disabled={!user}
              label="Upload a test image"
              maxSizeMB={5}
            />
          </CardContent>
        </Card>
      </div>

      {imageUrl && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Image URL</CardTitle>
            <CardDescription>
              The URL of the uploaded image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-md overflow-auto">
              <p className="text-sm break-all">{imageUrl}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <Button 
          onClick={() => window.location.href = '/dashboard/posts'}
          variant="outline"
        >
          Back to Posts
        </Button>
      </div>
    </div>
  );
}
