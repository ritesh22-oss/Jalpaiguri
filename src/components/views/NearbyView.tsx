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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Medical':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Blood':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Jobs':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Shops':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Vehicle':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Animal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Rentals':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Services':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleAction = (item: NearbyItem) => {
    navigate(item.targetView, item.targetParams);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      {/* Top Location & Search Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 pt-6 pb-3 border-b border-[#E8E4DA] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#55685F] block">
              📍 Discovery Radius
            </span>
            <div
              onClick={() => setIsLocationSelectorOpen(true)}
              className="flex items-center gap-1.5 cursor-pointer group"
            >
              <h1 className="text-base font-extrabold text-[#11241C] tracking-tight group-hover:text-[#063B2C] truncate max-w-[200px]">
                {location.locality}, Jalpaiguri
              </h1>
              <span className="text-xs text-[#063B2C] font-bold underline decoration-dotted">
                Change
              </span>
            </div>
          </div>

          {/* List vs Map Toggle */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#D2CEBE]">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#063B2C] text-white shadow-xs'
                  : 'text-[#55685F] hover:text-[#11241C]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-[#063B2C] text-white shadow-xs'
                  : 'text-[#55685F] hover:text-[#11241C]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xs">
          <Search className="w-4 h-4 text-[#55685F]" />
          <input
            type="text"
            placeholder="Search workers, doctors, blood, jobs, shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] placeholder:text-[#8C9B93] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#55685F]">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#063B2C] text-white border-[#063B2C] shadow-xs'
                    : 'bg-white text-[#55685F] border-[#E8E4DA] hover:border-[#063B2C]'
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
          <span className="text-[10px] font-extrabold text-[#55685F] uppercase shrink-0 mr-1">
            Distance:
          </span>
          {distanceOptions.map((dist) => {
            const isSelected = distanceFilter === dist;
            return (
              <button
                key={dist}
                onClick={() => setDistanceFilter(dist)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E6F4EA] text-[#063B2C] font-extrabold ring-1 ring-[#063B2C]'
                    : 'bg-[#FAF8F5] text-[#55685F] border border-[#E8E4DA] hover:bg-white'
                }`}
              >
                {dist}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content: LIST or MAP */}
      <div className="p-4 space-y-4">
        {/* Results Header Info */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-[#11241C]">
            {filteredItems.length} {selectedCategory === 'All' ? 'Services' : selectedCategory} Near You
          </span>
          <span className="text-[11px] font-semibold text-[#55685F]">
            Sorted by nearest first
          </span>
        </div>

        {/* LIST VIEW */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-[#E8E4DA] shadow-xs hover:shadow-md transition-shadow space-y-3"
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
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}

                      {item.availability && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded-md">
                          {item.availability}
                        </span>
                      )}

                      {item.openStatus && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {item.openStatus}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-[#11241C] leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* Distance Pill */}
                  <div className="bg-[#E6F4EA] text-[#063B2C] px-2.5 py-1 rounded-xl text-xs font-black shrink-0 flex items-center gap-1 shadow-xs">
                    <MapPin className="w-3 h-3 text-[#063B2C]" />
                    <span>{item.distanceText}</span>
                  </div>
                </div>

                {/* Locality and Description */}
                <div className="space-y-1 text-xs">
                  <p className="text-[#55685F] font-semibold flex items-center gap-1">
                    <span className="text-[#11241C] font-bold">📍 {item.area}</span>
                  </p>
                  {item.description && (
                    <p className="text-xs text-[#55685F] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer Pricing / Rating & Action Button */}
                <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.rating && (
                      <div className="flex items-center gap-1 text-xs font-extrabold text-[#11241C]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                        {item.reviewCount && (
                          <span className="text-[11px] font-normal text-[#55685F]">
                            ({item.reviewCount})
                          </span>
                        )}
                      </div>
                    )}

                    {item.startingPrice && (
                      <span className="text-xs font-black text-[#063B2C]">
                        {item.startingPrice}
                      </span>
                    )}

                    {item.salary && (
                      <span className="text-xs font-black text-amber-800">
                        {item.salary}
                      </span>
                    )}

                    {item.rent && (
                      <span className="text-xs font-black text-purple-800">
                        {item.rent}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAction(item)}
                    className="bg-[#063B2C] text-white hover:bg-[#084D3A] active:scale-95 transition-all px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
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
          <div className="relative w-full h-[520px] bg-[#E8E4DA] rounded-3xl overflow-hidden border border-[#D2CEBE] shadow-md flex flex-col justify-between">
            {/* Interactive Vector Map Canvas Mockup with real GPS markers */}
            <div className="absolute inset-0 bg-[#E5E9E2] overflow-hidden">
              {/* Stylized road grid lines */}
              <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="map-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#BAC5B5" strokeWidth="1.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />
                {/* Teesta & Karala Rivers stylized */}
                <path
                  d="M -20 180 Q 120 220, 240 160 T 480 260"
                  fill="none"
                  stroke="#99C2EC"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 320 -10 Q 300 200, 360 400"
                  fill="none"
                  stroke="#99C2EC"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>

              {/* User Center GPS Beacon */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer"
                title="Your approximate location"
              >
                <span className="relative flex h-8 w-8 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-[#063B2C] border-3 border-white shadow-md"></span>
                </span>
                <span className="mt-1 px-2 py-0.5 rounded-full bg-[#063B2C] text-white text-[9px] font-extrabold shadow-sm">
                  You are here ({location.locality})
                </span>
              </div>

              {/* Service Pins placed relative to center */}
              {filteredItems.slice(0, 12).map((item, idx) => {
                // Calculate visual offsets relative to center based on lat/lng difference
                const deltaLng = (item.lng - location.lng) * 4500;
                const deltaLat = (location.lat - item.lat) * 4500;

                const posX = Math.max(15, Math.min(85, 50 + deltaLng));
                const posY = Math.max(15, Math.min(85, 50 + deltaLat));

                const isSelected = selectedMarkerItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMarkerItem(item)}
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-transform hover:scale-125 ${
                      isSelected ? 'scale-125 z-30' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-2xl shadow-lg border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#063B2C] text-white border-white ring-4 ring-[#E6F4EA]'
                          : 'bg-white text-[#11241C] border-[#063B2C]'
                      }`}
                    >
                      {item.category === 'Workers' && <Wrench className="w-3.5 h-3.5 text-emerald-600" />}
                      {item.category === 'Medical' && <Stethoscope className="w-3.5 h-3.5 text-blue-600" />}
                      {item.category === 'Blood' && <Droplet className="w-3.5 h-3.5 text-rose-600" />}
                      {item.category === 'Jobs' && <Briefcase className="w-3.5 h-3.5 text-amber-600" />}
                      {item.category === 'Shops' && <Store className="w-3.5 h-3.5 text-purple-600" />}
                      {item.category === 'Vehicle' && <Car className="w-3.5 h-3.5 text-slate-700" />}
                      {item.category === 'Animal' && <PawPrint className="w-3.5 h-3.5 text-green-600" />}
                      {item.category === 'Rentals' && <HomeIcon className="w-3.5 h-3.5 text-indigo-600" />}
                      {item.category === 'Services' && <Landmark className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Top Badge */}
            <div className="relative z-20 p-3 flex items-center justify-between">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E8E4DA] text-[11px] font-bold text-[#11241C] shadow-xs flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#063B2C]" />
                <span>Tap any pin to inspect nearby service</span>
              </div>
            </div>

            {/* Map Selected Result Bottom Sheet */}
            {selectedMarkerItem && (
              <div className="relative z-30 m-3 bg-white rounded-2xl p-4 border border-[#E8E4DA] shadow-xl animate-in slide-in-from-bottom-4 duration-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#E6F4EA] text-[#063B2C] uppercase">
                        {selectedMarkerItem.subcategory}
                      </span>
                      {selectedMarkerItem.verified && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-[#11241C]">
                      {selectedMarkerItem.name}
                    </h4>
                    <p className="text-xs text-[#55685F] font-semibold mt-0.5">
                      📍 {selectedMarkerItem.area} • {selectedMarkerItem.distanceText}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMarkerItem(null)}
                    className="p-1 text-[#55685F] hover:text-[#11241C]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#063B2C]">
                    {selectedMarkerItem.startingPrice ||
                      selectedMarkerItem.salary ||
                      selectedMarkerItem.openStatus ||
                      'Available Now'}
                  </span>
                  <button
                    onClick={() => handleAction(selectedMarkerItem)}
                    className="bg-[#063B2C] text-white hover:bg-[#084D3A] px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>{selectedMarkerItem.primaryActionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State when no nearby services found */}
        {filteredItems.length === 0 && (
          <div className="bg-white rounded-3xl p-6 text-center border border-[#E8E4DA] shadow-xs space-y-4 my-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#11241C]">
                No services found nearby
              </h3>
              <p className="text-xs text-[#55685F] mt-1 max-w-xs mx-auto">
                No matching results within {distanceFilter}. Expand your radius or select a different locality in Jalpaiguri.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
              <button
                onClick={() => setDistanceFilter('Any distance')}
                className="w-full bg-[#063B2C] text-white py-2.5 rounded-xl text-xs font-extrabold shadow-xs hover:bg-[#084D3A] cursor-pointer"
              >
                Expand Search to Any Distance
              </button>
              <button
                onClick={() => setIsLocationSelectorOpen(true)}
                className="w-full bg-[#FAF8F5] text-[#11241C] border border-[#D2CEBE] py-2.5 rounded-xl text-xs font-bold hover:bg-white cursor-pointer"
              >
                Change Location Area
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setDistanceFilter('Any distance');
                  setSearchQuery('');
                }}
                className="w-full text-xs font-bold text-[#55685F] py-1 hover:text-[#063B2C] cursor-pointer"
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
