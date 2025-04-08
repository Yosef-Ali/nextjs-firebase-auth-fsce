'use client';

import { useState } from 'react';
import { useUploadThing } from '@/app/utils/uploadthing';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function TestUploadThing() {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadDetails, setUploadDetails] = useState<any>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        console.log('Upload completed:', res);
        setImageUrl(res[0].url);
        setUploadDetails({
          success: true,
          response: res[0]
        });
      }
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      setError(error.message);
      setUploadDetails({
        success: false,
        error: error.message
      });
    },
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploadDetails({
      fileName: files[0].name,
      fileSize: files[0].size,
      fileType: files[0].type,
      userAuthenticated: !!user,
      userDetails: user ? {
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous,
      } : null
    });

    try {
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }

      await startUpload(Array.from(files));
    } catch (error) {
      console.error('Upload preparation error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test UploadThing</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        {user ? (
          <div className="p-4 bg-green-50 text-green-700 rounded-md">
            <p>✅ Logged in as: {user.email}</p>
            <p>User ID: {user.uid}</p>
          </div>
        ) : (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p>❌ Not logged in</p>
            <p>You must be logged in to upload images</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Upload Test</h2>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading || !user}
            className="cursor-pointer"
          />
          {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {imageUrl && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Uploaded Image</h2>
          <div className="relative w-[300px] h-[200px] border rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt="Uploaded image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {uploadDetails && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Upload Details</h2>
          <pre className="p-4 bg-gray-50 rounded-md overflow-auto">
            {JSON.stringify(uploadDetails, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
