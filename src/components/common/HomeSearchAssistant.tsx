import React, { useState } from 'react';
import { Search, Mic, Send, MapPin, Loader2 } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';

interface HomeSearchAssistantProps {
  onSearch: (query: string) => void;
}

export const HomeSearchAssistant: React.FC<HomeSearchAssistantProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAssistantOpen } = useNav();
  const { isBengali } = useLanguage();

  const handleSend = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    // Submit query to existing assistant or local search logic
    onSearch(query);
    // Simulate loading state for demonstration
    setTimeout(() => {
        setIsLoading(false);
        setQuery('');
    }, 1500);
  };

  const chips = [
    { label: isBengali ? 'নিকটস্থ' : 'Nearby', id: 'nearby' },
    { label: isBengali ? 'রক্ত' : 'Blood', id: 'blood' },
    { label: isBengali ? 'ডাক্তার' : 'Doctors', id: 'doctors' },
    { label: isBengali ? 'চাকরি' : 'Jobs', id: 'jobs' },
    { label: isBengali ? 'দোকান' : 'Shops', id: 'shops' },
    { label: isBengali ? 'জরুরি' : 'Emergency', id: 'emergency' },
  ];

  return (
    <div className="space-y-3 px-1 mb-6">
      {/* Search Bar */}
      <div className="w-full bg-white dark:bg-[#1A2634] border border-gray-200 dark:border-white/10 rounded-full pl-4 pr-1 py-1 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isBengali ? 'জলপাইগুড়ি নিয়ে যেকোনো প্রশ্ন করুন...' : 'Ask anything about Jalpaiguri...'}
          className="flex-1 bg-transparent border-none text-sm font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 py-3 outline-none"
        />
        <button className="text-gray-400 dark:text-gray-500 hover:text-blue-500 p-2">
          <Mic className="w-5 h-5" />
        </button>
        <button
          onClick={handleSend}
          disabled={isLoading || !query.trim()}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-all"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>

      {/* Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {chips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => onSearch(chip.label)}
            className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white dark:bg-[#1A2634] border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all shadow-sm"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
