import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenFilters: () => void;
}

export const EducationSearch: React.FC<Props> = ({ searchQuery, setSearchQuery, onOpenFilters }) => {
  const { isBengali } = useLanguage();

  return (
    <div className="relative flex items-center bg-white dark:bg-[#17231E] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm mx-4 -mt-6">
      <Search className="w-5 h-5 text-gray-400 absolute left-4" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={isBengali ? 'স্কুল, কলেজ বা কোর্স খুঁজুন...' : 'Search schools, colleges, courses...'}
        className="w-full pl-12 pr-12 py-4 rounded-2xl text-sm font-bold focus:outline-none bg-transparent"
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery('')} className="absolute right-12 p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
        </button>
      )}
      <button onClick={onOpenFilters} className="absolute right-4 p-2 text-blue-600 hover:bg-blue-50 rounded-full">
        <Filter className="w-5 h-5" />
      </button>
    </div>
  );
};
