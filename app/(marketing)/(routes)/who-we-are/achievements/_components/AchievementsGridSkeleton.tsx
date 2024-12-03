import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AchievementsGridSkeleton = () => {
  return (
    <div className="w-full">
      {/* Featured Achievements Skeleton */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* Other Achievements Skeleton */}
      <div>
        <div className="flex items-center mb-4">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsGridSkeleton;
