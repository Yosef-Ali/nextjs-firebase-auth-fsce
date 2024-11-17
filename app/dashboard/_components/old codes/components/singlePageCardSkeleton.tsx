import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SinglePageSkeleton = () => (
  <div className="p-5 max-w-5xl mx-auto ">
    <Skeleton className="w-full h-80" />
    <div className="py-2">

      <div className="flex space-x-2 items-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-64" />
      </div>
    </div>
    <div className="py-2 space-y-2">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-4" />
    </div>
    <div className="py-2 space-y-2">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-full h-4" />
    </div>
  </div>
);

export default SinglePageSkeleton;
