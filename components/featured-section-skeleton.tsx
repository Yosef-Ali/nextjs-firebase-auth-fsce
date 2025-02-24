import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function FeaturedSectionSkeleton() {
  return (
    <section className="py-16">
      <div className="container px-4 mx-auto">
        {/* Title Skeleton */}
        <Skeleton className="w-64 h-10 mx-auto mb-12" />

        {/* Category Tabs Skeleton */}
        <div className="flex justify-start w-full mb-8">
          <div className="inline-flex gap-2 p-1 rounded-lg bg-muted/30">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-32 h-10" />
            ))}
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-full overflow-hidden">
              <div className="relative aspect-square">
                <Skeleton className="absolute inset-0" />
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="w-12 h-5" />
                  <Skeleton className="w-full h-6" />
                </div>
                <Skeleton className="w-full h-20" />
                <div className="flex items-center justify-between pt-4">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-20 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
