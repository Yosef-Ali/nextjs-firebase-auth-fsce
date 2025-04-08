'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { Toaster } from "sonner";

export default function ImageUploadFixPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster position="top-center" />
      
      <h1 className="text-3xl font-bold mb-8">Image Upload Fix</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
            <CardTitle>Image Upload Issue</CardTitle>
            <CardDescription>
              We've identified and fixed issues with image uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              We've implemented several improvements to the image upload functionality:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Enhanced error handling for image uploads</li>
              <li>Improved image preview with better error states</li>
              <li>More robust file naming to prevent conflicts</li>
              <li>Better user feedback during the upload process</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Upload Test</CardTitle>
            <CardDescription>
              Test our new enhanced image upload component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This page demonstrates our new image upload component with improved error handling and user feedback.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/enhanced-upload-test">
                Try Enhanced Upload
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Tool</CardTitle>
            <CardDescription>
              Test different upload methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This diagnostic tool lets you test different image upload methods to identify which one works best for your needs.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/image-upload-diagnostic">
                Open Diagnostic Tool
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create a Post</CardTitle>
            <CardDescription>
              Try the improved image uploads in a real post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Create a new post to test the improved image upload functionality in a real-world scenario.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/posts/new">
                Create New Post
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

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
