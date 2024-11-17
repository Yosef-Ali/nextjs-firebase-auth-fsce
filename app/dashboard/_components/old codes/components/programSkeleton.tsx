import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

const ProgramsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Skeleton className="h-10 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-grow" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgramsSkeleton;