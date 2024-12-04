'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface ProgramSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProgramSearch({ 
  onSearch, 
  placeholder = "Search programs...", 
  className = "" 
}: ProgramSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <div className="flex items-center bg-white/30 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl overflow-hidden gap-2 p-2">
        <div className="flex-grow flex items-center bg-transparent">
          <Search className="ml-2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder={placeholder}
            className="w-full px-4 py-2 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <button 
          className="bg-primary/80 text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-300"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
}
