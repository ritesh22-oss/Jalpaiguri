import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building,
  HeartPulse,
  Compass,
  Car,
  Fuel,
  Store,
  GraduationCap,
  List,
  Map as MapIcon,
  Sun,
  Moon,
  X,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { useTheme } from '../../context/ThemeContext';
import { ExplorePlaceItem, ExplorePlaceCategory } from '../../types';
import { JALPAIGURI_EXPLORE_PLACES } from '../../data/jalpaiguriPlaces';
import { ExplorePlaceCard } from '../explore/ExplorePlaceCard';
import { PlaceDetailsModal } from '../explore/PlaceDetailsModal';
import { ExplorePlacesMapView } from '../explore/ExplorePlacesMapView';
import {
  validateServiceArea,
  calculateHaversineDistance,
  SERVICE_AREA_MODE
} from '../../utils/serviceArea';

export const MapsExplorerView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { location } = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExplorePlaceCategory>('All');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedPlaceForModal, setSelectedPlaceForModal] = useState<ExplorePlaceItem | null>(null);

  // User coordinates (defaults to Kadamtala, Jalpaiguri if not detected)
  const userLat = location.lat || 26.5228;
  const userLng = location.lng || 88.7245;

  const categories: { id: ExplorePlaceCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Places', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'Healthcare', label: 'Hospitals & Medical', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { id: 'Heritage & Tourism', label: 'Parks & Heritage', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'Commercial & Markets', label: 'Markets & Shops', icon: <Store className="w-3.5 h-3.5" /> },
    { id: 'Transport', label: 'Railway & Toto Stands', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'Education & Civic', label: 'Colleges & Civic', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'Fuel & Utilities', label: 'Petrol & Utilities', icon: <Fuel className="w-3.5 h-3.5" /> }
  ];

  // 1. Jalpaiguri-only verification & dynamic distance calculation
  const verifiedJalpaiguriPlaces: ExplorePlaceItem[] = useMemo(() => {
    return JALPAIGURI_EXPLORE_PLACES.filter((p) => {
      // Strictly enforce Jalpaiguri service area boundary
      const validation = validateServiceArea(p.lat, p.lng);
      return validation.isInside;
    }).map((p) => {
      const dist = calculateHaversineDistance(userLat, userLng, p.lat, p.lng);
      const distText = dist < 1 ? `${Math.round(dist * 1000)} m away` : `${dist.toFixed(1)} km away`;
      return {
        ...p,
        distanceKm: dist,
        distanceText: distText
      };
    });
  }, [userLat, userLng]);

  // 2. Filter by search query and category
  const filteredPlaces = useMemo(() => {
    return verifiedJalpaiguriPlaces.filter((place) => {
      // Category filter
      if (selectedCategory !== 'All' && place.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = place.name.toLowerCase().includes(q);
        const matchesSubcategory = place.subcategory.toLowerCase().includes(q);
        const matchesAddress = place.formattedAddress.toLowerCase().includes(q);
        const matchesFeatures = place.features?.some((f) => f.toLowerCase().includes(q));
        const matchesPlaceId = place.placeId.toLowerCase().includes(q);

        return (
          matchesName ||
          matchesSubcategory ||
          matchesAddress ||
          matchesFeatures ||
          matchesPlaceId
        );
      }

      return true;
    });
  }, [verifiedJalpaiguriPlaces, selectedCategory, searchQuery]);

  // Handle Ask AI navigation
  const handleAskAI = (place: ExplorePlaceItem) => {
    navigate('ai-chat');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] text-[#11241C] dark:text-white pb-24 max-w-md mx-auto transition-colors duration-200">
      {/* 1. Header with Jalpaiguri Identity, Theme Toggle & Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#13201A]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA] dark:border-white/10 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={goBack}
              className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-white/10 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white hover:bg-[#EFECE6] dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold tracking-tight">Explore Places</h1>
                <span className="px-1.5 py-0.5 rounded-md bg-[#063B2C] dark:bg-[#25634D] text-[9px] font-bold text-white uppercase tracking-wider">
                  Jalpaiguri
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#9EB3A8] truncate max-w-[180px]">
                Near 📍 {location.locality || 'Jalpaiguri Core'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark / Light Theme Quick Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-white/10 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white hover:bg-[#EFECE6] dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#063B2C]" />
              )}
            </button>

            {/* Ask AI button */}
            <button
              onClick={() => navigate('ai-chat')}
              className="w-9 h-9 rounded-full bg-[#E6F4EA] dark:bg-[#1E3E30] text-[#063B2C] dark:text-[#5CE6B0] flex items-center justify-center hover:bg-[#C8E6C9] dark:hover:bg-[#2A5240] active:scale-95 transition-all cursor-pointer"
              title="Chat with Jalpaigi AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Search Input */}
        <div className="mt-3 relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified Jalpaiguri places & Place IDs…"
            className="w-full bg-[#FAF8F5] dark:bg-white/5 border border-[#D2CEBE] dark:border-white/15 rounded-full pl-10 pr-10 py-2.5 text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#7A8C84] dark:placeholder:text-[#7A9387] focus:outline-none focus:border-[#063B2C] dark:focus:border-[#34D399] transition-colors"
          />
          <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA] absolute left-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3. View Mode Toggle (List vs Map) & Service Area Pill */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {/* List / Map Switcher */}
          <div className="inline-flex p-1 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#1E3B2E] text-[#063B2C] dark:text-[#5CE6B0] shadow-xs'
                  : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-[#1E3B2E] text-[#063B2C] dark:text-[#5CE6B0] shadow-xs'
                  : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>

          {/* Jalpaiguri Coverage Pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F4EA] dark:bg-[#1A382A] text-[#063B2C] dark:text-[#5CE6B0] text-[10px] font-bold border border-[#A7D7B9]/40 dark:border-emerald-700/30">
            <ShieldCheck className="w-3 h-3" />
            <span>Jalpaiguri Service Area</span>
          </div>
        </div>

        {/* 4. Horizontal Categories Carousel */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#063B2C] dark:bg-[#25634D] text-white shadow-xs'
                    : 'bg-[#FAF8F5] dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10 text-[#55685F] dark:text-[#9FB2A8] hover:bg-[#E6F4EA] dark:hover:bg-white/10 hover:text-[#063B2C] dark:hover:text-white'
                }`}
              >
                {c.icon}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-4">
        {/* Results Counter & Active Filter Badge */}
        <div className="flex items-center justify-between text-xs font-bold text-[#55685F] dark:text-[#9FB2A8] px-1">
          <span>
            {filteredPlaces.length} {filteredPlaces.length === 1 ? 'Place' : 'Places'} in Jalpaiguri
          </span>
          <span className="text-[11px] text-[#063B2C] dark:text-[#5CE6B0]">
            Google Places Verified
          </span>
        </div>

        {/* View Mode: Map or List */}
        {viewMode === 'map' ? (
          <ExplorePlacesMapView
            places={filteredPlaces}
            userLat={userLat}
            userLng={userLng}
            onSelectPlace={(place) => setSelectedPlaceForModal(place)}
          />
        ) : (
          <div className="space-y-4">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place) => (
                <ExplorePlaceCard
                  key={place.id}
                  place={place}
                  onSelect={(p) => setSelectedPlaceForModal(p)}
                  onAskAI={handleAskAI}
                />
              ))
            ) : (
              // Empty State (Strictly enforcing Jalpaiguri boundaries)
              <div className="bg-white dark:bg-[#16231E] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-8 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#E6F4EA] dark:bg-white/10 text-[#063B2C] dark:text-[#5CE6B0] flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-[#11241C] dark:text-white">
                    No places found in Jalpaiguri
                  </h3>
                  <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] max-w-xs mx-auto">
                    {searchQuery
                      ? `No verified landmarks matching "${searchQuery}" inside the Jalpaiguri service area.`
                      : 'No locations available for this category.'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#063B2C] dark:bg-[#1E4D3B] text-white text-xs font-bold hover:bg-[#084D3A] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Place Details Bottom Sheet / Modal */}
      {selectedPlaceForModal && (
        <PlaceDetailsModal
          place={selectedPlaceForModal}
          onClose={() => setSelectedPlaceForModal(null)}
          onAskAI={handleAskAI}
        />
      )}
    </div>
  );
};
