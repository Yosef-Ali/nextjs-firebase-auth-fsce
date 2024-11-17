

import { useQuery } from 'convex/react';
import React from 'react';
import { api } from '../../convex/_generated/api';

const Categories = () => {
  const categories = useQuery(api.posts.getCategories) || [];

  return (
    <div>
      <h2 className="scroll-m-20 text-xl font-semibold tracking-tight text-center">Categories</h2>
      {categories.length === 0 ? (
        <p>Loading categories...</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {categories.map((category: { name: string; postCount: number }, index: number) => (
            <li key={index} className="flex">
              <a href={`/category/${category.name.toLowerCase()}`} className="leading-7 [&:not(:first-child)]:mt-6 py-2 block flex-1">
                {category.name}
              </a>
              <span className="text-gray-700 text-lg font-thin p-2">{category.postCount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Categories;



