import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Plus,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  Star,
  CheckCircle2,
  Truck,
  Sparkles,
  Utensils,
  Coffee,
  LayoutList,
  Map as MapIcon,
  Filter,
  Share2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Package,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { Restaurant, RestaurantCategory } from '../../types';

const CATEGORIES: { key: string; labelEn: string; labelBn: string; icon: string }[] = [
  { key: 'All', labelEn: 'All Dining', labelBn: 'সব', icon: '🍽️' },
  { key: 'Cafe', labelEn: 'Cafés & Coffee', labelBn: 'ক্যাফে', icon: '☕' },
  { key: 'Restaurant', labelEn: 'Restaurants', labelBn: 'রেস্তোরাঁ', icon: '🍛' },
  { key: 'Fast Food', labelEn: 'Fast Food', labelBn: 'ফাস্ট ফুড', icon: '🍔' },
  { key: 'Street Food', labelEn: 'Street Food', labelBn: 'রাস্তার খাবার', icon: '🥙' },
  { key: 'Bakery & Sweets', labelEn: 'Bakery & Sweets', labelBn: 'মিষ্টি ও বেকারি', icon: '🍰' },
  { key: 'Cloud Kitchen', labelEn: 'Cloud Kitchen', labelBn: 'ক্লাউড কিচেন', icon: '📦' },
  { key: 'Dhaba', labelEn: 'Dhaba', labelBn: 'ধাবা', icon: '🍲' },
  { key: 'Other', labelEn: 'Other', labelBn: 'অন্যান্য', icon: '🍴' }
];

export const DiningMarketplaceView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { restaurants } = useApp();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return sessionStorage.getItem('jpg_marketplace_search_query') || '';
    } catch {
      return '';
    }
  });

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    try {
      sessionStorage.setItem('jpg_marketplace_search_query', val);
    } catch {}
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filters
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [minRating4, setMinRating4] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState<string>('All');

  // Filter logic: match restaurant name, bengali name, category, menuItems, locality, address, landmark, pincode
  const filteredRestaurants = (restaurants || []).filter((restaurant) => {
    if (selectedCategory !== 'All' && restaurant.category !== selectedCategory) {
      return false;
    }
    if (openNowOnly && !restaurant.isOpen) {
      return false;
    }
    if (verifiedOnly && !restaurant.isVerified) {
      return false;
    }
    if (deliveryOnly && !restaurant.deliveryAvailable) {
      return false;
    }
    if (minRating4 && restaurant.rating < 4.5) {
      return false;
    }
    if (selectedLocality !== 'All' && !restaurant.locality.toLowerCase().includes(selectedLocality.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (restaurant.name || '').toLowerCase().includes(q);
      const matchBn = (restaurant.nameBengali || '').toLowerCase().includes(q);
      const matchLoc = (restaurant.locality || '').toLowerCase().includes(q);
      const matchAddr = (restaurant.address || '').toLowerCase().includes(q);
      const matchLandmark = ((restaurant as any).landmark || '').toLowerCase().includes(q);
      const matchPin = ((restaurant as any).pincode || '').toString().includes(q);
      const matchCat = (restaurant.category || '').toLowerCase().includes(q);
      const matchSub = (restaurant.subcategories || []).some(s => s.toLowerCase().includes(q));
      const matchDesc = (restaurant.description || '').toLowerCase().includes(q);
      
      // Match items if restaurant has menuItem list or specialties
      const matchMenuItem = ((restaurant as any).menuItems || []).some((p: any) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.nameBengali || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );

      if (!matchName && !matchBn && !matchLoc && !matchAddr && !matchLandmark && !matchPin && !matchCat && !matchSub && !matchDesc && !matchMenuItem) {
        return false;
      }
    }
    return true;
  });

  // Calculate restaurant count per category
  const getCategoryCount = (categoryKey: string) => {
    if (categoryKey === 'All') return (restaurants || []).length;
    return (restaurants || []).filter(s => s.category === categoryKey).length;
  };

  const handleResetFilters = () => {
    handleSearchChange('');
    setSelectedCategory('All');
    setOpenNowOnly(false);
    setVerifiedOnly(false);
    setDeliveryOnly(false);
    setMinRating4(false);
    setSelectedLocality('All');
  };

  const handleShareRestaurant = (restaurant: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = restaurant.phone || (restaurant as any).ownerPhone || '';
    if (navigator.share) {
      navigator.share({
        title: `${restaurant.name} - MYJPG`,
        text: `Check out ${restaurant.name} in ${restaurant.locality}, Jalpaiguri on MYJPG! Contact: ${phone}`,
        url: window.location.href
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${restaurant.name}, ${restaurant.locality}, Jalpaiguri. Contact: ${phone}`);
      setToastMessage(language === 'bn' ? 'দোকানের বিবরণ কপি করা হয়েছে!' : 'Restaurant details copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] pb-28 max-w-md mx-auto select-none transition-colors relative">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0B132B]/95 backdrop-blur-md px-4 pt-3 pb-2.5 border-b border-[#E8E4DA]/60 dark:border-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-lg font-black text-[#11241C] dark:text-white leading-tight flex items-center gap-1.5">
                <span>{language === 'bn' ? 'জলপাইগুড়ি বাজার' : 'Jalpaiguri Restaurants'}</span>
                <span className="text-[10px] font-bold bg-[#eff6ff] dark:bg-blue-950/80 text-[#007AFF] dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/40">
                  {filteredRestaurants.length}
                </span>
              </h1>
              <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                {language === 'bn' ? 'স্থানীয় বিশ্বস্ত ব্যবসায়ী ও দোকান' : 'Local verified restaurantOwners & stores'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Upgrade Plan Button for restaurantOwners */}
            <button
              onClick={() => navigate('restaurantOwner-dashboard')}
              className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900 transition-all cursor-pointer"
              title={language === 'bn' ? 'মার্চেন্ট প্ল্যান আপগ্রেড করুন' : 'Upgrade RestaurantOwner Plan'}
            >
              <Sparkles className="w-5 h-5" />
            </button>
            
            {/* View Mode Toggle: List / Map */}
            <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 p-0.5 rounded-xl flex items-center shadow-2xs">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C]'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C]'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Restaurant button in header */}
            <button
              id="btn-header-add-restaurant"
              onClick={() => navigate('add-restaurant')}
              className="px-3 py-2 rounded-xl bg-[#007AFF] dark:bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer"
              title="Register Your Restaurant"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'দোকান যোগ' : 'Add Restaurant'}</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mt-2 bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-md text-center animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top-Level Search Bar for Restaurants, Categories & MenuItems */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="restaurant-marketplace-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={language === 'bn' ? 'দোকান, পণ্য (চাল, মিষ্টি, ওষুধ) বা এলাকা খুঁজুন...' : 'Search restaurants, menuItems (rice, sweets, medicine) or area...'}
            className="w-full pl-9.5 pr-8 py-2.5 bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8A9A92] dark:placeholder:text-[#657970] focus:outline-none focus:border-[#007AFF] dark:focus:border-blue-500 shadow-2xs transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-300 flex items-center justify-center text-[10px] font-black cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Cards */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-[#55685F] dark:text-[#A2B3AA] flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>{language === 'bn' ? 'দোকানের ক্যাটাগরি' : 'Restaurant Categories'}</span>
            </span>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-[10px] font-extrabold text-[#007AFF] dark:text-blue-400 hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'সব দেখুন' : 'Show All'}
              </button>
            )}
          </div>

          <div className="flex items-stretch gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const count = getCategoryCount(cat.key);
              return (
                <button
                  key={cat.key}
                  id={`cat-card-${cat.key.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-2 rounded-2xl shrink-0 transition-all cursor-pointer flex flex-col justify-between text-left min-w-[112px] border ${
                    isSelected
                      ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-sm ring-2 ring-[#007AFF]/20'
                      : 'bg-white dark:bg-[#0F172A] border-[#E8E4DA] dark:border-white/10 text-[#44554E] dark:text-[#C5D5CC] hover:border-[#007AFF]/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="text-base">{cat.icon}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <p className="text-[11px] font-black leading-tight line-clamp-1">
                      {language === 'bn' ? cat.labelBn : cat.labelEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Quick Action Portals Banner Strip */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Smart Item Finder Banner */}
          <div
            id="banner-smart-menuItem-search"
            onClick={() => navigate('smart-dining-search')}
            className="bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] dark:from-[#132B22] dark:to-[#0C1E18] p-3 rounded-2xl border border-blue-200/60 dark:border-blue-800/40 cursor-pointer shadow-2xs hover:border-blue-400 transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-blue-900/60 flex items-center justify-center text-blue-800 dark:text-blue-300 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-800 dark:text-blue-300">
                {language === 'bn' ? 'স্মার্ট খোঁজ' : 'Smart Search'}
              </span>
            </div>
            <h4 className="mt-2 text-xs font-black text-[#11241C] dark:text-white leading-tight">
              {language === 'bn' ? 'পণ্যটি কোথায় পাবেন?' : 'Find Item in Stock'}
            </h4>
            <p className="text-[10px] font-semibold text-[#44554E] dark:text-[#A2B3AA] mt-0.5">
              {language === 'bn' ? 'ওষুধ, চাল বা সামগ্রীর দাম ও দোকান' : 'Search specific items across Jalpaiguri'}
            </p>
          </div>

          {/* RestaurantOwner Portal Banner */}
          <div
            id="banner-restaurantOwner-dashboard"
            onClick={() => navigate('restaurantOwner-dashboard')}
            className="bg-gradient-to-br from-[#F5EBE1] to-[#EBDCCE] dark:from-[#251E18] dark:to-[#1C1612] p-3 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 cursor-pointer shadow-2xs hover:border-amber-400 transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-amber-900/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shadow-2xs">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                {language === 'bn' ? 'দোকানদার ড্যাশবোর্ড' : 'RestaurantOwner Hub'}
              </span>
            </div>
            <h4 className="mt-2 text-xs font-black text-[#11241C] dark:text-white leading-tight">
              {language === 'bn' ? 'নিজের দোকান পরিচালনা' : 'Manage Your Restaurant'}
            </h4>
            <p className="text-[10px] font-semibold text-[#44554E] dark:text-[#A2B3AA] mt-0.5">
              {language === 'bn' ? 'স্টক, দাম আপডেট ও অফার' : 'MenuItems, quick price edit & orders'}
            </p>
          </div>
        </div>

        {/* Filter Chips Bar (Open Now, Verified, Delivery, 4.5+ Rating) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
          <button
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              openNowOnly
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-white dark:bg-[#0F172A] border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{language === 'bn' ? 'এখন খোলা' : 'Open Now'}</span>
          </button>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              verifiedOnly
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-white dark:bg-[#0F172A] border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{language === 'bn' ? 'যাচাইকৃত দোকান' : 'Verified'}</span>
          </button>

          <button
            onClick={() => setDeliveryOnly(!deliveryOnly)}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              deliveryOnly
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-white dark:bg-[#0F172A] border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>{language === 'bn' ? 'হোম ডেলিভারি' : 'Home Delivery'}</span>
          </button>

          <button
            onClick={() => setMinRating4(!minRating4)}
            className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              minRating4
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-white dark:bg-[#0F172A] border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>★ 4.5+</span>
          </button>
        </div>

        {/* MAP VIEW */}
        {viewMode === 'map' && (
          <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#11241C] dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
                <span>{language === 'bn' ? 'জলপাইগুড়ির মানচিত্রে দোকান' : 'Jalpaiguri Local Restaurant Map'}</span>
              </span>
              <span className="text-[10px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                Interactive Map
              </span>
            </div>

            {/* Custom Interactive SVG Jalpaiguri Map with Pins */}
            <div className="relative w-full h-56 bg-[#f1f5f9] dark:bg-[#0B1713] rounded-2xl overflow-hidden border border-blue-900/10 dark:border-white/10 p-3 flex flex-col justify-between">
              {/* Map background illustration of Teesta River & Jalpaiguri Grid */}
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10 180 Q 80 120 140 140 T 260 90 T 360 40" fill="none" stroke="#2B7A68" strokeWidth="12" />
                <path d="M 0 50 L 380 50 M 0 110 L 380 110 M 0 170 L 380 170" stroke="#7CB3A1" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 80 0 L 80 240 M 180 0 L 180 240 M 280 0 L 280 240" stroke="#7CB3A1" strokeWidth="1" strokeDasharray="4 4" />
              </svg>

              {/* River label */}
              <span className="relative z-10 text-[9px] font-bold text-teal-800 dark:text-teal-400 tracking-wider">
                Teesta River Basin (তিস্তা নদী)
              </span>

              {/* Plot Pins for restaurants */}
              <div className="relative z-10 grid grid-cols-3 gap-2 my-auto">
                {filteredRestaurants.slice(0, 6).map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => navigate('restaurant-detail', { restaurantId: restaurant.id })}
                    className="bg-white/95 dark:bg-[#0F172A]/95 border border-[#007AFF]/30 dark:border-blue-500/40 rounded-xl p-2 text-left shadow-md hover:scale-105 transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#007AFF] dark:text-blue-300 truncate">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="truncate">{restaurant.name}</span>
                    </div>
                    <div className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {restaurant.locality}
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative z-10 flex items-center justify-between text-[10px] font-bold text-[#55685F] dark:text-[#A2B3AA] bg-white/80 dark:bg-black/40 px-2 py-1 rounded-lg backdrop-blur-xs">
                <span>📍 Kadamtala • Dinbazar • DBC Road</span>
                <span>{filteredRestaurants.length} restaurants pinned</span>
              </div>
            </div>
          </div>
        )}

        {/* SHOP LIST VIEW */}
        {filteredRestaurants.length === 0 ? (
          /* Smart Empty State conforming strictly to Rule 34 */
          <div className="py-10 text-center bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E8E4DA] dark:border-white/10 p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] dark:bg-blue-950/50 flex items-center justify-center mx-auto text-[#007AFF] dark:text-blue-300 shadow-2xs">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
              {language === 'bn' ? 'জলপাইগুড়ি কানেক্টে নতুন দোকান যুক্ত হচ্ছে।' : 'New restaurants are joining MYJPG.'}
            </h3>
            <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] max-w-xs mx-auto">
              {language === 'bn'
                ? 'এই ক্যাটাগরিতে এখনও কোনো দোকান যুক্ত হয়নি বা সার্চের সাথে মেলেনি। আপনি কি এই এলাকার দোকানদার? আজই যুক্ত করুন!'
                : 'No stores currently match this query. Are you a local restaurantOwner in Jalpaiguri? Register your restaurant now.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ফিল্টার মুছুন' : 'Reset Filters'}</span>
              </button>
              <button
                onClick={() => navigate('add-restaurant')}
                className="px-4 py-2.5 rounded-xl bg-[#007AFF] dark:bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'bn' ? '+ আপনার দোকান যোগ করুন' : '+ I Own a Café/Restaurant'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => navigate('restaurant-detail', { restaurantId: restaurant.id })}
                className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl overflow-hidden shadow-xs hover:border-[#007AFF] dark:hover:border-blue-500 transition-all cursor-pointer group"
              >
                {/* Restaurant Cover & Status Badges */}
                <div className="relative h-36 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={restaurant.photoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Gradient Overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Bar Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                      <span>{restaurant.category}</span>
                    </span>

                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button
                        onClick={(e) => handleShareRestaurant(restaurant, e)}
                        className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
                        title="Share Restaurant"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Bar on Photo: Open/Closed & Verified Badge */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                          restaurant.isOpen
                            ? 'bg-blue-500/90 text-white'
                            : 'bg-rose-500/90 text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        <span>{restaurant.isOpen ? (language === 'bn' ? 'এখন খোলা' : 'Open') : (language === 'bn' ? 'এখন বন্ধ' : 'Closed')}</span>
                      </span>

                      {restaurant.isVerified && (
                        <span className="bg-[#007AFF]/90 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-400/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified on MYJPG</span>
                        </span>
                      )}
                    </div>

                    {restaurant.isFeatured && (
                      <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3 fill-amber-950" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Restaurant Details */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-[#11241C] dark:text-white leading-snug group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors">
                        {restaurant.name}
                      </h3>
                      {restaurant.nameBengali && (
                        <p className="text-[11px] font-bold text-[#55685F] dark:text-[#A2B3AA]">
                          {restaurant.nameBengali}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-[#55685F] dark:text-[#A2B3AA] block">
                        📍 {restaurant.locality}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        {restaurant.address.slice(0, 26)}...
                      </span>
                    </div>
                  </div>

                  {/* Highlights row: Delivery & Opening Hours */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA] pt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>
                        {restaurant.openingHours?.open || (restaurant as any).openingTime || '08:00 AM'} - {restaurant.openingHours?.close || (restaurant as any).closingTime || '09:00 PM'}
                      </span>
                    </div>

                    {(restaurant.deliveryAvailable ?? (restaurant as any).homeDelivery ?? true) ? (
                      <div className="flex items-center gap-1 text-blue-800 dark:text-blue-300 font-bold">
                        <Truck className="w-3 h-3 text-blue-600" />
                        <span>{language === 'bn' ? 'হোম ডেলিভারি আছে' : 'Home Delivery'}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">{language === 'bn' ? 'দোকানে এসে সংগ্রহ' : 'In-Store Pickup'}</span>
                    )}
                  </div>

                  {/* Rating and Actions Row */}
                  <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between gap-2">
                    {/* Rating */}
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center gap-0.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 px-2 py-0.5 rounded-lg">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-[#11241C] dark:text-white">{restaurant.rating || 4.8}</span>
                        <span className="text-[10px] text-[#73827B] dark:text-[#A2B3AA]">({restaurant.reviewCount || 20})</span>
                      </div>
                    </div>

                    {/* Action Buttons: Call & WhatsApp & View Restaurant */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const ph = restaurant.phone || (restaurant as any).ownerPhone || '+919832011094';
                          window.location.href = `tel:${ph.replace(/\s+/g, '')}`;
                        }}
                        className="p-2 rounded-xl bg-[#dbeafe] dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 hover:bg-[#C2E4D5] active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer border border-blue-200/50 dark:border-blue-800/40"
                        title="Call Restaurant"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const msg = encodeURIComponent(`Nomoshkar! I found your restaurant ${restaurant.name} on MYJPG. Are you open right now?`);
                          const waPhone = (restaurant.whatsappNumber || restaurant.phone || (restaurant as any).ownerPhone || '9832011094').replace(/\D/g, '');
                          window.open(`https://wa.me/91${waPhone.slice(-10)}?text=${msg}`, '_blank');
                        }}
                        className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => navigate('restaurant-detail', { restaurantId: restaurant.id })}
                        className="px-3 py-2 rounded-xl bg-[#007AFF] dark:bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all"
                      >
                        <span>{language === 'bn' ? 'পণ্য দেখুন' : 'View Restaurant'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating 'Add Your Restaurant' Button - Fixed at bottom-right */}
      <button
        id="btn-floating-add-restaurant"
        onClick={() => navigate('add-restaurant')}
        className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 bg-[#007AFF] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl flex items-center gap-2 font-black text-xs cursor-pointer active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all group border-2 border-white/20 backdrop-blur-xs"
        title="Register Your Restaurant on MYJPG"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Plus className="w-4 h-4 text-white stroke-[2.8]" />
        </div>
        <span className="whitespace-nowrap font-black">
          {language === 'bn' ? '+ আপনার দোকান যোগ করুন' : '+ I Own a Café/Restaurant'}
        </span>
      </button>
    </div>
  );
};
