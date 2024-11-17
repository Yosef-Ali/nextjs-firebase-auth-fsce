import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const NewsFeedSkeleton = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">News</h2>

      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center space-x-4 pt-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-[150px] w-full rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-full" />
              <div className="flex items-center space-x-4 pt-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsFeedSkeleton;