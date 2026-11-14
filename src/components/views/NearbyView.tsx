import React, { useState, useMemo } from 'react';
import {
  MapPin,
  List,
  Map as MapIcon,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Star,
  Phone,
  ArrowRight,
  ChevronRight,
  SlidersHorizontal,
  Wrench,
  Stethoscope,
  Droplet,
  Briefcase,
  Store,
  Car,
  PawPrint,
  Home as HomeIcon,
  Landmark,
  Layers,
  Compass,
  Navigation,
  X,
  Clock
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { useApp } from '../../context/AppContext';
import { NearbyCategoryType, DistanceFilterType, NearbyItem } from '../../types';
import { UNIFIED_NEARBY_DIRECTORY } from '../../data/nearbyServicesDirectory';
import { calculateHaversineDistance, formatDistanceString } from '../../data/jalpaiguriLocalities';
import { NearbyGoogleMapPanel } from '../nearby/NearbyGoogleMapPanel';

export const NearbyView: React.FC = () => {
  const { navigate, params, setIsAssistantOpen } = useNav();
  const { location, setIsLocationSelectorOpen, requestCurrentLocation } = useLocation();
  const { workers, doctors, hospitals, bloodDonors, jobs, rentals } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<NearbyCategoryType>(
    (params?.category as NearbyCategoryType) || 'All'
  );
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilterType>('Any distance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarkerItem, setSelectedMarkerItem] = useState<NearbyItem | null>(null);

  const categories: { id: NearbyCategoryType; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'Workers', label: 'Workers', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'Medical', label: 'Medical', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'Blood', label: 'Blood', icon: <Droplet className="w-3.5 h-3.5" /> },
    { id: 'Jobs', label: 'Jobs', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'Shops', label: 'Shops', icon: <Store className="w-3.5 h-3.5" /> },
    { id: 'Vehicle', label: 'Vehicle', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'Animal', label: 'Animal', icon: <PawPrint className="w-3.5 h-3.5" /> },
    { id: 'Rentals', label: 'Rentals', icon: <HomeIcon className="w-3.5 h-3.5" /> },
    { id: 'Services', label: 'Services', icon: <Landmark className="w-3.5 h-3.5" /> }
  ];

  const distanceOptions: DistanceFilterType[] = [
    'Within 1 km',
    'Within 3 km',
    'Within 5 km',
    'Within 10 km',
    'Any distance'
  ];

  // Dynamically calculate distance to every directory item and sort by nearest
  const nearbyItemsWithDistance = useMemo(() => {
    return UNIFIED_NEARBY_DIRECTORY.map((item) => {
      const dist = calculateHaversineDistance(location.lat, location.lng, item.lat, item.lng);
      return {
        ...item,
        distanceKm: dist,
        distanceText: `${formatDistanceString(dist)} away`
      };
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [location.lat, location.lng]);

  // Filter items by category, distance limit, and search query
  const filteredItems = useMemo(() => {
    return nearbyItemsWithDistance.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Distance filter
      const dist = item.distanceKm || 0;
      if (distanceFilter === 'Within 1 km' && dist > 1.0) return false;
      if (distanceFilter === 'Within 3 km' && dist > 3.0) return false;
      if (distanceFilter === 'Within 5 km' && dist > 5.0) return false;
      if (distanceFilter === 'Within 10 km' && dist > 10.0) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSub = item.subcategory.toLowerCase().includes(q);
        const matchesArea = item.area.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesSub && !matchesArea && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [nearbyItemsWithDistance, selectedCategory, distanceFilter, searchQuery]);

  const getCategoryColor = (cat: NearbyCategoryType) => {
    switch (cat) {
      case 'Workers':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/50';
      case 'Medical':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/50';
      case 'Blood':
        return 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900/50';
      case 'Jobs':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-900/50';
      case 'Shops':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800/50';
      case 'Vehicle':
        return 'bg-slate-100 dark:bg-slate-800/40 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700/50';
      case 'Animal':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/50';
      case 'Rentals':
        return 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-900/50';
      case 'Services':
        return 'bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800/40 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700/50';
    }
  };

  const handleAction = (item: NearbyItem) => {
    navigate(item.targetView, item.targetParams);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#020617] pb-28 select-none transition-colors">
      {/* Top Location & Search Header */}
      <header className="w-full sticky top-0 z-30 bg-white/95 dark:bg-[#0B1224]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 shadow-xs transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              📍 Discovery Radius
            </span>
            <div
              onClick={() => setIsLocationSelectorOpen(true)}
              className="flex items-center gap-1.5 cursor-pointer group"
            >
              <h1 className="text-base font-extrabold text-[#0F172A] dark:text-white tracking-tight group-hover:text-[#007AFF] dark:group-hover:text-[#38BDF8] truncate max-w-[280px]">
                {location.name || `${location.locality}, Jalpaiguri`}
              </h1>
              <span className="text-xs text-[#007AFF] dark:text-[#38BDF8] font-bold underline decoration-dotted shrink-0">
                Change
              </span>
            </div>
          </div>

          {/* List vs Map Toggle */}
          <div className="flex items-center bg-[#FAF8F5] dark:bg-[#0F172A] p-1 rounded-xl border border-[#D2CEBE] dark:border-white/10">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#007AFF] dark:bg-blue-600 text-white shadow-xs scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:scale-105 active:scale-95'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#007AFF] dark:bg-blue-600 text-white shadow-xs scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:scale-105 active:scale-95'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full bg-[#FAF8F5] dark:bg-[#0F172A] border border-[#D2CEBE] dark:border-white/10 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search workers, doctors, blood, jobs, shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-[#0F172A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none bg-transparent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-500 dark:text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Chips Scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#007AFF] dark:bg-blue-600 text-white border-[#007AFF] dark:border-blue-600 shadow-xs scale-105'
                    : 'bg-white dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 border-[#E8E4DA] dark:border-white/10 hover:border-[#007AFF] dark:hover:border-blue-500 hover:scale-105 active:scale-95'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Distance Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase shrink-0 mr-1">
            Distance:
          </span>
          {distanceOptions.map((dist) => {
            const isSelected = distanceFilter === dist;
            return (
              <button
                key={dist}
                onClick={() => setDistanceFilter(dist)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-[#38BDF8] font-extrabold ring-1 ring-[#007AFF] dark:ring-blue-500 scale-105 shadow-xs'
                    : 'bg-[#FAF8F5] dark:bg-[#0F172A] text-slate-500 dark:text-slate-400 border border-[#E8E4DA] dark:border-white/10 hover:bg-white dark:hover:bg-blue-900/20 hover:scale-105 active:scale-95'
                }`}
              >
                {dist}
              </button>
            );
          })}
        </div>
        </div>
      </header>

      {/* Main Content: LIST or MAP */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Results Header Info */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-[#0F172A] dark:text-white">
            {filteredItems.length} {selectedCategory === 'All' ? 'Services' : selectedCategory} Near You
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Sorted by nearest first
          </span>
        </div>

        {/* LIST VIEW */}
        {activeTab === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-[#E8E4DA] dark:border-white/10 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out space-y-3"
              >
                {/* Card Top: Category & Distance */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.subcategory}
                      </span>

                      {item.verified && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}

                      {item.availability && (
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                          {item.availability}
                        </span>
                      )}

                      {item.openStatus && (
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                          {item.openStatus}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-[#0F172A] dark:text-white leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* Distance Pill */}
                  <div className="bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-[#38BDF8] px-2.5 py-1 rounded-xl text-xs font-black shrink-0 flex items-center gap-1 shadow-xs">
                    <MapPin className="w-3 h-3 text-[#007AFF] dark:text-[#38BDF8]" />
                    <span>{item.distanceText}</span>
                  </div>
                </div>

                {/* Locality and Description */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                    <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">📍 {item.area}</span>
                  </p>
                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer Pricing / Rating & Action Button */}
                <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.rating && (
                      <div className="flex items-center gap-1 text-xs font-extrabold text-[#0F172A] dark:text-white">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                        {item.reviewCount && (
                          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            ({item.reviewCount})
                          </span>
                        )}
                      </div>
                    )}

                    {item.startingPrice && (
                      <span className="text-xs font-black text-[#007AFF] dark:text-[#38BDF8]">
                        {item.startingPrice}
                      </span>
                    )}

                    {item.salary && (
                      <span className="text-xs font-black text-amber-800 dark:text-amber-300">
                        {item.salary}
                      </span>
                    )}

                    {item.rent && (
                      <span className="text-xs font-black text-purple-800 dark:text-purple-300">
                        {item.rent}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAction(item)}
                    className="bg-[#007AFF] dark:bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-300 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer hover:scale-105"
                  >
                    <span>{item.primaryActionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MAP VIEW */}
        {activeTab === 'map' && (
          <NearbyGoogleMapPanel
            items={filteredItems}
            userLat={location?.lat ?? 26.5265}
            userLng={location?.lng ?? 88.723}
            selectedMarkerItem={selectedMarkerItem}
            onSelectMarker={setSelectedMarkerItem}
            onAction={handleAction}
          />
        )}

        {/* Empty State when no nearby services found */}
        {filteredItems.length === 0 && (
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 text-center border border-[#E8E4DA] dark:border-white/10 shadow-xs space-y-4 my-4 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white">
                No services found nearby
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                No matching results within {distanceFilter}. Expand your radius or select a different locality in Jalpaiguri.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
              <button
                onClick={() => setDistanceFilter('Any distance')}
                className="w-full bg-[#007AFF] dark:bg-blue-600 text-white py-2.5 rounded-xl text-xs font-extrabold shadow-xs hover:bg-blue-700 cursor-pointer"
              >
                Expand Search to Any Distance
              </button>
              <button
                onClick={() => setIsLocationSelectorOpen(true)}
                className="w-full bg-[#FAF8F5] dark:bg-blue-900/20 text-[#0F172A] dark:text-white border border-[#D2CEBE] dark:border-white/10 py-2.5 rounded-xl text-xs font-bold hover:bg-white dark:hover:bg-blue-900/30 cursor-pointer"
              >
                Change Location Area
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setDistanceFilter('Any distance');
                  setSearchQuery('');
                }}
                className="w-full text-xs font-bold text-slate-500 dark:text-slate-400 py-1 hover:text-[#007AFF] dark:hover:text-[#38BDF8] cursor-pointer"
              >
                Browse All Services
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
