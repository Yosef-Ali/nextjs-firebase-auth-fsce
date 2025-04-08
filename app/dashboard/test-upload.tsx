"use client";

import { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function TestUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadDetails, setUploadDetails] = useState<any>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadDetails({
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userAuthenticated: !!user,
      userDetails: user
        ? {
            uid: user.uid,
            email: user.email,
            isAnonymous: user.isAnonymous,
          }
        : null,
    });

    try {
      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      if (!user) {
        throw new Error("You must be logged in to upload images");
      }

      // Create a unique file path
      const timestamp = Date.now();
      const fileName = `test-uploads/${
        user.uid
      }-${timestamp}-${file.name.replace(/[^\w.-]/g, "-")}`;

      console.log("Creating storage reference for:", fileName);
      const storageRef = ref(storage, fileName);

      // Upload with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.uid,
          originalName: file.name,
        },
      };

      console.log("Starting upload with metadata:", metadata);
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log("Upload successful:", uploadResult);

      // Get download URL
      const url = await getDownloadURL(uploadResult.ref);
      console.log("Download URL:", url);

      setImageUrl(url);
      setUploadDetails((prev: any) => ({
        ...prev,
        success: true,
        downloadUrl: url,
      }));
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setUploadDetails((prev: any) => ({
        ...prev,
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Image Upload</h1>

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
            disabled={uploading || !user}
            className="cursor-pointer"
          />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
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
