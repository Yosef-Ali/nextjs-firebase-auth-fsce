import { Skeleton } from "../ui/skeleton";

function SearchResultSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-8">
      <Skeleton className="h-6 w-1/2 mb-4" />
      <div className="space-y-4">
        <div className="p-4 border rounded-md shadow">
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        <div className="p-4 border rounded-md shadow">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="p-4 border rounded-md shadow">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default SearchResultSkeleton;