import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Home as HomeIcon,
  Sun,
  Moon,
  Globe,
  ArrowRight,
  ChevronRight,
  Map as MapIcon,
  List
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { searchMyJpgDirectory, SearchResult } from '../../services/SearchService';

export const DiscoverView: React.FC = () => {
  const { navigate, setIsAssistantOpen } = useNav();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isBengali, toggleLanguage } = useLanguage();
  const appData = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [radius, setRadius] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const categories = ['All', 'Schools', 'Colleges', 'Cafes', 'Restaurants', 'Hospitals', 'Pharmacies', 'Shops', 'Parks', 'Blood', 'Doctors', 'Workers'];

  // Combined search results
  const filteredResults = useMemo(() => {
    let results: SearchResult[] = [];
    
    // Directory Search (MYJPG)
    const directoryResults = searchMyJpgDirectory(searchQuery, appData);
    results = [...results, ...directoryResults];

    // TODO: Google Places Search Integration
    
    // Filter by Category
    if (selectedCategory !== 'All') {
      results = results.filter(r => r.category === selectedCategory);
    }
    
    return results;
  }, [searchQuery, selectedCategory, appData]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0] pb-28 select-none transition-colors duration-200">
      {/* Header */}
      <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#020617]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10">
        <div className="max-w-5xl mx-auto px-5 pt-6 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-white">
              {isBengali ? 'অন্বেষণ' : 'Discover'}
            </h1>
            {/* Theme & Language Toggles */}
            <div className="flex gap-2">
                <button onClick={toggleLanguage} className="p-2 rounded-full bg-white dark:bg-[#1E293B] border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#007AFF]">{isBengali ? 'বাংলা' : 'EN'}</button>
                <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-[#1E293B] border border-[#E8E4DA] dark:border-white/10 text-slate-500">{isDarkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}</button>
            </div>
          </div>

          {/* New Intelligent Search Bar */}
          <div className="w-full bg-white dark:bg-[#1E293B] border border-[#D2CEBE] dark:border-white/10 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs focus-within:border-[#007AFF] transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isBengali ? 'স্থান, স্কুল, ক্যাফে খুঁজুন...' : 'Search places, schools, colleges, cafes...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-[#0F172A] dark:text-white bg-transparent focus:outline-none"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${selectedCategory === cat ? 'bg-[#007AFF] text-white' : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                >
                    {cat}
                </button>
            ))}
          </div>
          
          {/* Radius Filter */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <span>Radius:</span>
              {[1, 3, 5, 10, 20].map(r => (
                  <button key={r} onClick={() => setRadius(r)} className={`${radius === r ? 'text-[#007AFF] font-bold' : ''}`}>{r}km</button>
              ))}
          </div>
        </div>
      </header>
      
      {/* List / Map Toggle */}
      <div className="flex justify-center p-4">
        <div className="flex p-1 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-slate-700">
            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'list' ? 'bg-[#007AFF] text-white' : ''} flex items-center gap-1`}><List className="w-3.5 h-3.5"/>List</button>
            <button onClick={() => setViewMode('map')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${viewMode === 'map' ? 'bg-[#007AFF] text-white' : ''} flex items-center gap-1`}><MapIcon className="w-3.5 h-3.5"/>Map</button>
        </div>
      </div>
      
      {/* Results */}
      <div className="max-w-5xl mx-auto p-4">
          {filteredResults.map(result => (
              <div key={result.id} className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl mb-3 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{result.name}</h3>
                      <p className="text-xs text-slate-500">{result.category}</p>
                  </div>
                  <button className="text-xs font-bold text-[#007AFF]">View</button>
              </div>
          ))}
      </div>
    </div>
  );
};
