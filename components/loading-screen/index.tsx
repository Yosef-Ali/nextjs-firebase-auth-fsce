'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingScreen() {
  return (
    <div className="relative h-full min-h-screen">
      {/* Sidebar Skeleton */}
      <div className="fixed inset-y-0 left-0 w-72 bg-background border-r border-border p-6 hidden md:block">
        {/* Logo Area */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-[100px]" />
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-72">
        {/* Header */}
        <div className="h-16 border-b border-border px-8 flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="py-10">
          <div className="px-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <Skeleton className="h-8 w-[200px] mb-2" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
              <Skeleton className="h-10 w-[120px]" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border border-border">
              {/* Table Header */}
              <div className="border-b border-border p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 w-[150px]">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-6 w-[80px] rounded-full" />
                      <Skeleton className="h-6 w-[80px] rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
