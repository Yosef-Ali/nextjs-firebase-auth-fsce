// components/Sidebar.tsx
import React, { FC } from 'react';
import RecentPosts from './RecentPosts';
import Categories from './Categories';
import Newsletter from './Newsletter';
import SearchForm from './SearchForm';
import MessageSection from './messages';

const Sidebar: FC = () => {
  return (
    <div className="ml-2 md:ml-4 mr-2">
      {/* <div className="mt-20 sm:mt-0 text-center">
        <MessageSection />
      </div> */}
      <div className="">
        <SearchForm />
      </div>
      <div className="mt-10">
        <Newsletter />
      </div>
      <div className="mt-10">
        <Categories />
      </div>
      <div className="mt-10">
        <RecentPosts />
      </div>
    </div>
  );
};

export default Sidebar;
