import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Plus,
  ShieldCheck,
  List,
  Map as MapIcon,
  Navigation,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Star,
  Sparkles,
  Home
} from 'lucide-react';
import { DurgaPandalItem, UserLocation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { useNav } from '../../context/NavigationContext';
import { calculateHaversineDistance } from '../../utils/serviceArea';
import { PandalDetailsModal } from '../modals/PandalDetailsModal';
import { AddPandalModal } from '../modals/AddPandalModal';
import { ReportPandalModal } from '../modals/ReportPandalModal';

interface PujaPandalsViewProps {
  pandals: DurgaPandalItem[];
  userLocation: UserLocation;
  onBack: () => void;
  onAddPandal: (pandalData: Omit<DurgaPandalItem, 'id' | 'createdAt' | 'verificationStatus'>) => Promise<any>;
  onReportPandal: (report: any) => Promise<void>;
}

export const PujaPandalsView: React.FC<PujaPandalsViewProps> = ({
  pandals,
  userLocation,
  onBack,
  onAddPandal,
  onReportPandal
}) => {
  const { isBengali } = useLanguage();
  const { toggleSavePandal, isPandalSaved, savedPandalIds } = useApp();
  const { navigate } = useNav();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'distance' | 'popularity' | 'rating'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Modals state
  const [selectedPandal, setSelectedPandal] = useState<DurgaPandalItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingPandal, setReportingPandal] = useState<DurgaPandalItem | null>(null);

  // Categories
  const categories = ['All', 'Saved Pandals', 'Theme Pandal', 'Traditional Sabaki', 'Eco-Friendly', 'Lighting & Illumination', 'Heritage'];

  // Distance calculation and filtered sorting
  const processedPandals = useMemo(() => {
    return pandals.map((pandal) => {
      const dist = calculateHaversineDistance(
        userLocation.lat,
        userLocation.lng,
        pandal.lat,
        pandal.lng
      );
      return {
        ...pandal,
        distanceKm: dist
      };
    });
  }, [pandals, userLocation]);

  const filteredPandals = useMemo(() => {
    return processedPandals.filter((pandal) => {
      const matchesSearch =
        pandal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pandal.nameBn && pandal.nameBn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pandal.committee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pandal.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pandal.themeName && pandal.themeName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (selectedCategory === 'Saved Pandals') {
        return matchesSearch && isPandalSaved(pandal.id);
      }

      const matchesCategory = selectedCategory === 'All' || pandal.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      } else if (sortBy === 'popularity') {
        return (b.popularityScore || 0) - (a.popularityScore || 0);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });
  }, [processedPandals, searchQuery, selectedCategory, sortBy, savedPandalIds]);

  const handleOpenDetails = (pandal: DurgaPandalItem) => {
    setSelectedPandal(pandal);
    setIsDetailsOpen(true);
  };

  const handleOpenReport = (pandal: DurgaPandalItem) => {
    setReportingPandal(pandal);
    setIsReportModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-900 via-[#007AFF] to-blue-950 rounded-3xl p-5 text-white shadow-lg space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('home')}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white hover:bg-blue-50 text-[#007AFF] font-black text-xs px-3.5 py-2 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isBengali ? 'মণ্ডপ যোগ করুন' : 'Add Pandal'}</span>
          </button>
        </div>

        <div className="space-y-1 relative z-10">
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {isBengali ? 'JPG দুর্গোৎসব মণ্ডপ ডিরেক্টরি' : 'JPG Durga Puja Pandals'}
          </h1>
          <p className="text-xs text-blue-100 font-medium">
            {isBengali
              ? 'আপনার বর্তমান জিপিএস অবস্থান অনুযায়ী নিখুঁত দূরত্ব ও দিকনির্দেশসহ সেরা পূজা মণ্ডপসমূহ'
              : 'Discover verified pandals across JPG with real GPS distance & Google Maps route.'}
          </p>
        </div>

        {/* View Mode Toggle & Search */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 relative z-10">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isBengali ? 'মণ্ডপের নাম, এলাকা বা থিম খুঁজুন...' : 'Search by pandal name, committee, or theme...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white border border-white/20 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white px-3 py-2.5 rounded-2xl text-xs font-bold border border-white/20 focus:outline-none cursor-pointer"
            >
              <option value="distance">{isBengali ? 'নিকটবর্তী প্রথম (Nearest)' : 'Nearest First'}</option>
              <option value="popularity">{isBengali ? 'জনপ্রিয়তা (Popular)' : 'Most Popular'}</option>
              <option value="rating">{isBengali ? 'রেটিং (Top Rated)' : 'Top Rated'}</option>
            </select>

            <div className="flex bg-white/20 p-1 rounded-2xl border border-white/20 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-[#007AFF] shadow-xs' : 'text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-white text-[#007AFF] shadow-xs' : 'text-white'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs Scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#007AFF] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat === 'Saved Pandals' ? (isBengali ? '🔖 সংরক্ষিত মণ্ডপসমূহ' : '🔖 Saved Pandals') : cat}
          </button>
        ))}
      </div>

      {/* Main Content: List vs Map View */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPandals.length > 0 ? (
            filteredPandals.map((pandal) => {
              const formattedDist = (pandal.distanceKm || 0) < 1 
                ? `${Math.round((pandal.distanceKm || 0) * 1000)} m` 
                : `${(pandal.distanceKm || 0).toFixed(1)} km`;
              
              const isSaved = isPandalSaved(pandal.id);

              return (
                <div
                  key={pandal.id}
                  onClick={() => handleOpenDetails(pandal)}
                  className="bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col sm:flex-row relative"
                >
                  {/* Image */}
                  <div className="relative w-full sm:w-44 h-44 shrink-0 bg-gray-900">
                    <img
                      src={pandal.primaryPhoto}
                      alt={pandal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="bg-[#007AFF] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                        {pandal.category}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSavePandal(pandal.id);
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                          isSaved ? 'bg-amber-500 text-white' : 'bg-black/60 text-white hover:bg-black/80'
                        }`}
                        title={isSaved ? 'Saved' : 'Save'}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>

                      <div className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                        <Compass className="w-3 h-3 text-blue-400" />
                        <span>{formattedDist}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#007AFF] transition-colors">
                          {isBengali ? (pandal.nameBn || pandal.name) : pandal.name}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          {pandal.rating && (
                            <div className="flex items-center gap-0.5 text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{pandal.rating.toFixed(1)}</span>
                            </div>
                          )}
                          {pandal.verificationStatus === 'verified' && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {isBengali ? (pandal.committeeBn || pandal.committee) : pandal.committee}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300 font-medium mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
                        <span className="truncate">{pandal.locality}</span>
                      </div>
                    </div>

                    {pandal.themeName && (
                      <div className="bg-blue-50/60 dark:bg-blue-950/40 p-2 rounded-xl text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-1 border border-blue-100 dark:border-blue-900/30">
                        ✨ "{pandal.themeName}"
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 text-xs font-bold text-[#007AFF]">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        {pandal.locality}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>{isBengali ? 'দিকনির্দেশ ও বিস্তারিত' : 'Route & Details'}</span>
                        <Navigation className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center space-y-3 border border-gray-200 dark:border-gray-700">
              <img src="/durga-ma-icon.png" alt="Durga Ma" className="w-12 h-12 mx-auto object-contain" referrerPolicy="no-referrer" />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {selectedCategory === 'Saved Pandals'
                  ? (isBengali ? 'আপনার সংরক্ষিত তালিকায় কোনো মণ্ডপ নেই।' : 'No saved pandals yet. Bookmark your favorites!')
                  : (isBengali ? 'কোনো মণ্ডপ খুঁজে পাওয়া যায়নি।' : 'No pandals found matching your filter.')}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-xs text-[#007AFF] font-bold hover:underline"
              >
                {isBengali ? 'সব মণ্ডপ দেখুন' : 'View All Pandals'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Map View Simulation with Interactive Pins */
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[#007AFF]" />
              <span>{isBengali ? 'জলপাইগুড়ি পৌরসভা মণ্ডপ জিপিএস মানচিত্র' : 'Jalpaiguri Pandal GPS Map'}</span>
            </span>
            <span>{filteredPandals.length} {isBengali ? 'টি মণ্ডপ চিহ্ণিত' : 'Pandals Pinned'}</span>
          </div>

          <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-[#0B132B] to-gray-950 border border-blue-900/50 p-4 flex flex-col justify-between">
            {/* Visual Grid Lines simulating map */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Pinned Pandals Overlay Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-y-auto max-h-[85%] pr-1">
              {filteredPandals.map((pandal) => (
                <div
                  key={pandal.id}
                  onClick={() => handleOpenDetails(pandal)}
                  className="bg-gray-900/90 hover:bg-blue-900/90 text-white p-2.5 rounded-xl border border-blue-500/30 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between text-[10px] text-blue-300 font-bold">
                    <span className="truncate">{pandal.locality}</span>
                    <MapPin className="w-3 h-3 text-red-400 group-hover:scale-125 transition-transform" />
                  </div>
                  <h4 className="text-xs font-black truncate">{pandal.name}</h4>
                  <span className="text-[10px] text-gray-300 font-semibold block">
                    📍 {((pandal.distanceKm || 0)).toFixed(1)} km
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10 text-[11px] text-gray-300 bg-black/60 p-2 rounded-xl backdrop-blur-xs flex items-center justify-between">
              <span>{isBengali ? 'যে কোনো প্যান্ডেল কার্ডে ক্লিক করে গুগল ম্যাপস নেভিগেশন চালু করুন' : 'Tap any pinned pandal to view details and launch Google Maps direction.'}</span>
              <Compass className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PandalDetailsModal
        pandal={selectedPandal}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        userLocation={userLocation}
        onOpenReportModal={handleOpenReport}
      />

      <AddPandalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userLocation={userLocation}
        onSubmit={onAddPandal}
      />

      <ReportPandalModal
        pandal={reportingPandal}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={onReportPandal}
      />
    </div>
  );
};
