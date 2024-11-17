// 'use client';

// import React from 'react';
// import { useSearchParams } from 'next/navigation';
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import Link from 'next/link';
// import { useQuery } from 'convex/react';
// import { api } from '../../../../convex/_generated/api';
// import SearchResultSkeleton from '@/components/dashboard/search-skeleton';

// const SearchResultsPage = () => {
//   const searchParams = useSearchParams();
//   const searchTerm = searchParams.get('q') || '';
//   const searchResults = useQuery(api.posts.searchPosts, { searchTerm });

//   if (searchResults === undefined) {
//     return <SearchResultSkeleton />;
//   }

//   return (
//     <div className="container max-w-5xl mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-4">Search Results for &quot;{searchTerm}&quot;</h1>
//       {searchResults?.length === 0 ? (
//         <Card>
//           <CardContent>
//             <p className="text-center py-4">No results found. Try a different search term.</p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-4">
//           {searchResults?.map((post) => (
//             <Link href={`/search/${post.slug}`} key={post._id}>
//               <Card
//                 className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"
//               >
//                 <CardHeader>
//                   <CardTitle>{post.title}</CardTitle>
//                   <CardDescription>{post.category}</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <p>{post.excerpt}</p>
//                   <span
//                     className="text-blue-500 hover:underline mt-2 inline-block transition-colors duration-200"
//                   >
//                     Read more
//                   </span>
//                 </CardContent>
//               </Card>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchResultsPage;

import { Suspense } from 'react';
import SearchResults from './SearchResults';
import SearchResultSkeleton from '@/components/dashboard/search-skeleton';

export default function SearchPage({ searchParams }: { searchParams: { q: string } }) {
  const searchTerm = searchParams.q;

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for &quot;{searchTerm}&quot;</h1>
      <Suspense fallback={<SearchResultSkeleton />}>
        <SearchResults searchTerm={searchTerm} />
      </Suspense>
    </div>
  );
}