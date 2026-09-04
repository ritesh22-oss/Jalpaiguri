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
  ShoppingBag,
  Store,
  LayoutList,
  Map as MapIcon,
  Filter,
  Share2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shop, ShopCategory } from '../../types';

const CATEGORIES: { key: string; labelEn: string; labelBn: string; icon: string }[] = [
  { key: 'All', labelEn: 'All Stores', labelBn: 'সব দোকান', icon: '🏬' },
  { key: 'Grocery & Departmental', labelEn: 'Grocery & Ration', labelBn: 'মুদিখানা ও রেশন', icon: '🛒' },
  { key: 'Pharmacy & Medical', labelEn: 'Pharmacy', labelBn: 'ওষুধের দোকান', icon: '💊' },
  { key: 'Bakery & Sweets', labelEn: 'Sweets & Bakery', labelBn: 'মিষ্টি ও বেকারি', icon: '🍬' },
  { key: 'Electronics & Mobile', labelEn: 'Electronics', labelBn: 'ইলেকট্রনিক্স ও মোবাইল', icon: '📱' },
  { key: 'Clothing & Garments', labelEn: 'Clothing', labelBn: 'পোশাক ও বস্ত্র', icon: '👕' },
  { key: 'Hardware & Electricals', labelEn: 'Hardware', labelBn: 'হার্ডওয়্যার ও ইলেকট্রিক্যাল', icon: '🔧' },
  { key: 'Books & Stationery', labelEn: 'Books & Papers', labelBn: 'বই ও স্টেশনারি', icon: '📚' },
  { key: 'Fresh Meat & Fish', labelEn: 'Meat & Fish', labelBn: 'মাছ ও মাংসের বাজার', icon: '🐟' },
  { key: 'Dairy & Milk', labelEn: 'Dairy & Milk', labelBn: 'দুগ্ধজাত পণ্য', icon: '🥛' },
  { key: 'Personal Care & Salon', labelEn: 'Personal Care', labelBn: 'সেলুন ও প্রসাধন', icon: '✂️' },
  { key: 'Other', labelEn: 'Other Services', labelBn: 'অন্যান্য', icon: '🏪' }
];

export const ShopMarketplaceView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filters
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [minRating4, setMinRating4] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState<string>('All');

  // Fetch shops from backend API
  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shops');
      if (res.ok) {
        const data = await res.json();
        setShops(data);
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Filter logic
  const filteredShops = shops.filter((shop) => {
    if (selectedCategory !== 'All' && shop.category !== selectedCategory) {
      return false;
    }
    if (openNowOnly && !shop.isOpen) {
      return false;
    }
    if (verifiedOnly && !shop.isVerified) {
      return false;
    }
    if (deliveryOnly && !shop.deliveryAvailable) {
      return false;
    }
    if (minRating4 && shop.rating < 4.5) {
      return false;
    }
    if (selectedLocality !== 'All' && !shop.locality.toLowerCase().includes(selectedLocality.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = shop.name.toLowerCase().includes(q);
      const matchBn = (shop.nameBengali || '').toLowerCase().includes(q);
      const matchLoc = shop.locality.toLowerCase().includes(q);
      const matchCat = shop.category.toLowerCase().includes(q);
      const matchSub = (shop.subcategories || []).some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchBn && !matchLoc && !matchCat && !matchSub) return false;
    }
    return true;
  });

  const handleShareShop = (shop: Shop, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${shop.name} - Jalpaiguri Connect`,
        text: `Check out ${shop.name} in ${shop.locality}, Jalpaiguri on Jalpaiguri Connect!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shop.name}, ${shop.locality}, Jalpaiguri. Contact: ${shop.phone}`);
      alert(language === 'bn' ? 'দোকানের বিবরণ কপি করা হয়েছে!' : 'Shop details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0F1A15]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA]/60 dark:border-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-lg font-black text-[#11241C] dark:text-white leading-tight flex items-center gap-1.5">
                <span>{language === 'bn' ? 'জলপাইগুড়ি বাজার' : 'Jalpaiguri Shops'}</span>
                <span className="text-[10px] font-bold bg-[#E6F4EA] dark:bg-emerald-950/80 text-[#063B2C] dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                  {filteredShops.length}
                </span>
              </h1>
              <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                {language === 'bn' ? 'স্থানীয় বিশ্বস্ত ব্যবসায়ী ও দোকান' : 'Local verified merchants & stores'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 p-0.5 rounded-xl flex items-center shadow-2xs">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#063B2C] text-white shadow-xs'
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
                    ? 'bg-[#063B2C] text-white shadow-xs'
                    : 'text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C]'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>

            {/* + Add Shop Button */}
            <button
              onClick={() => navigate('add-shop')}
              className="px-3 py-2 rounded-xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'দোকান যোগ' : 'Add Shop'}</span>
            </button>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'দোকানের নাম, পণ্য বা এলাকা খুঁজুন...' : 'Search shop, medicine, groceries, locality...'}
            className="w-full pl-9.5 pr-4 py-2 bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-2xl text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8A9A92] dark:placeholder:text-[#657970] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500 shadow-2xs transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Horizontal Pills */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#063B2C] text-white shadow-xs'
                    : 'bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-[#44554E] dark:text-[#C5D5CC] hover:bg-[#F3EFE6] dark:hover:bg-white/5'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Quick Action Banners */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Smart Item Finder Banner */}
          <div
            onClick={() => navigate('smart-shopping')}
            className="bg-gradient-to-br from-[#E6F4EA] to-[#D5EADB] dark:from-[#132B22] dark:to-[#0C1E18] p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 cursor-pointer shadow-2xs hover:border-emerald-400 transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-emerald-900/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                {language === 'bn' ? 'স্মার্ট খোঁজ' : 'Smart Search'}
              </span>
            </div>
            <h4 className="mt-2 text-xs font-black text-[#11241C] dark:text-white leading-tight">
              {language === 'bn' ? 'পণ্যটি কোথায় পাবেন?' : 'Where is it in Stock?'}
            </h4>
            <p className="text-[10px] font-semibold text-[#44554E] dark:text-[#A2B3AA] mt-0.5">
              {language === 'bn' ? 'ওষুধ, মুদি বা পোশাক খুঁজুন' : 'Search any item in Jalpaiguri'}
            </p>
          </div>

          {/* Merchant Portal Banner */}
          <div
            onClick={() => navigate('merchant-dashboard')}
            className="bg-gradient-to-br from-[#F5EBE1] to-[#EBDCCE] dark:from-[#251E18] dark:to-[#1C1612] p-3 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 cursor-pointer shadow-2xs hover:border-amber-400 transition-all active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-amber-900/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shadow-2xs">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                {language === 'bn' ? 'দোকানদার ড্যাশবোর্ড' : 'Merchant Hub'}
              </span>
            </div>
            <h4 className="mt-2 text-xs font-black text-[#11241C] dark:text-white leading-tight">
              {language === 'bn' ? 'নিজের দোকান পরিচালনা' : 'Manage Your Store'}
            </h4>
            <p className="text-[10px] font-semibold text-[#44554E] dark:text-[#A2B3AA] mt-0.5">
              {language === 'bn' ? 'পণ্য যোগ, অর্ডার ও পরিসংখ্যান' : 'Products, analytics & AI import'}
            </p>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
          <button
            onClick={() => setOpenNowOnly(!openNowOnly)}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
              openNowOnly
                ? 'bg-[#063B2C] text-white border-[#063B2C]'
                : 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{language === 'bn' ? 'এখন খোলা' : 'Open Now'}</span>
          </button>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
              verifiedOnly
                ? 'bg-[#063B2C] text-white border-[#063B2C]'
                : 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{language === 'bn' ? 'যাচাইকৃত' : 'Verified'}</span>
          </button>

          <button
            onClick={() => setDeliveryOnly(!deliveryOnly)}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
              deliveryOnly
                ? 'bg-[#063B2C] text-white border-[#063B2C]'
                : 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>{language === 'bn' ? 'হোম ডেলিভারি' : 'Delivery'}</span>
          </button>

          <button
            onClick={() => setMinRating4(!minRating4)}
            className={`px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
              minRating4
                ? 'bg-[#063B2C] text-white border-[#063B2C]'
                : 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>★ 4.5+</span>
          </button>
        </div>

        {/* MAP VIEW */}
        {viewMode === 'map' && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#11241C] dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
                <span>{language === 'bn' ? 'জলপাইগুড়ির মানচিত্রে দোকান' : 'Jalpaiguri Local Store Map'}</span>
              </span>
              <span className="text-[10px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                Interactive Hub
              </span>
            </div>

            {/* Custom Interactive SVG Jalpaiguri Map with Pins */}
            <div className="relative w-full h-56 bg-[#E8F0EC] dark:bg-[#0B1713] rounded-2xl overflow-hidden border border-emerald-900/10 dark:border-white/10 p-3 flex flex-col justify-between">
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

              {/* Plot Pins for shops */}
              <div className="relative z-10 grid grid-cols-3 gap-2 my-auto">
                {filteredShops.slice(0, 6).map((shop, idx) => (
                  <button
                    key={shop.id}
                    onClick={() => navigate('shop-detail', { shopId: shop.id })}
                    className="bg-white/95 dark:bg-[#17231E]/95 border border-[#063B2C]/30 dark:border-emerald-500/40 rounded-xl p-2 text-left shadow-md hover:scale-105 transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#063B2C] dark:text-emerald-300 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="truncate">{shop.name}</span>
                    </div>
                    <div className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {shop.locality}
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative z-10 flex items-center justify-between text-[10px] font-bold text-[#55685F] dark:text-[#A2B3AA] bg-white/80 dark:bg-black/40 px-2 py-1 rounded-lg backdrop-blur-xs">
                <span>📍 Kadamtala • Dinbazar • DBC Road</span>
                <span>{filteredShops.length} shops pinned</span>
              </div>
            </div>
          </div>
        )}

        {/* SHOP LIST VIEW */}
        {loading ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-[#063B2C] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-[#55685F] dark:text-[#A2B3AA]">
              {language === 'bn' ? 'দোকান লোড হচ্ছে...' : 'Loading Jalpaiguri shops...'}
            </p>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-[#17231E] rounded-3xl border border-[#E8E4DA] dark:border-white/10 p-6 space-y-3">
            <Store className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
              {language === 'bn' ? 'কোনো দোকান পাওয়া যায়নি' : 'No Shops Found'}
            </h3>
            <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] max-w-xs mx-auto">
              {language === 'bn'
                ? 'আপনার ফিল্টার বা সার্চ শব্দ পরিবর্তন করুন অথবা আপনার নিজের দোকান যোগ করুন।'
                : 'Try adjusting your filters, searching another item, or register your shop on Jalpaiguri Connect.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setOpenNowOnly(false);
                  setVerifiedOnly(false);
                  setDeliveryOnly(false);
                  setMinRating4(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white cursor-pointer"
              >
                {language === 'bn' ? 'সব ফিল্টার রিসেট করুন' : 'Reset Filters'}
              </button>
              <button
                onClick={() => navigate('add-shop')}
                className="px-4 py-2 rounded-xl bg-[#063B2C] text-white text-xs font-bold cursor-pointer"
              >
                {language === 'bn' ? '+ দোকান যোগ করুন' : '+ Add Your Shop'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => navigate('shop-detail', { shopId: shop.id })}
                className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl overflow-hidden shadow-xs hover:border-[#063B2C] dark:hover:border-emerald-500 transition-all cursor-pointer group"
              >
                {/* Shop Cover & Badges */}
                <div className="relative h-36 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={shop.photoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80'}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {shop.isFeatured && (
                        <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5 fill-amber-950" />
                          <span>Featured</span>
                        </span>
                      )}
                      {shop.isVerified && (
                        <span className="bg-emerald-700/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs shadow-sm">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-200" />
                          <span>Verified Store</span>
                        </span>
                      )}
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShareShop(shop, e)}
                      className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                      title="Share Shop"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Image Overlay: Shop Name & Status */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-black text-base text-white drop-shadow-sm leading-snug truncate">
                          {shop.name}
                        </h3>
                        {shop.nameBengali && (
                          <p className="text-[11px] font-bold text-emerald-300 drop-shadow-xs truncate">
                            {shop.nameBengali}
                          </p>
                        )}
                      </div>

                      {/* Open/Closed Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 shadow-xs ${
                        shop.isOpen
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}>
                        {shop.isOpen ? (language === 'bn' ? 'খোলা আছে' : 'Open Now') : (language === 'bn' ? 'বন্ধ' : 'Closed')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shop Body Info */}
                <div className="p-3.5 space-y-2.5">
                  {/* Category & Locality */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200/40 dark:border-emerald-800/40">
                      {shop.category}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#55685F] dark:text-[#A2B3AA]">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-[#063B2C] dark:text-emerald-400" />
                        <span>{shop.locality}</span>
                      </span>
                      {shop.distance && (
                        <>
                          <span>•</span>
                          <span>{shop.distance}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Highlights row: Delivery & Opening Hours */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA] pt-0.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{shop.openingHours.open} - {shop.openingHours.close}</span>
                    </div>

                    {shop.deliveryAvailable ? (
                      <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold">
                        <Truck className="w-3 h-3 text-emerald-600" />
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
                        <span className="text-xs font-black text-[#11241C] dark:text-white">{shop.rating}</span>
                        <span className="text-[10px] text-[#73827B] dark:text-[#A2B3AA]">({shop.reviewCount})</span>
                      </div>
                    </div>

                    {/* Action Buttons: Call & WhatsApp & View */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${shop.phone.replace(/\s+/g, '')}`;
                        }}
                        className="p-2 rounded-xl bg-[#D2EBE0] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 hover:bg-[#C2E4D5] active:scale-95 transition-all cursor-pointer border border-emerald-200/50 dark:border-emerald-800/40"
                        title="Call Store"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const msg = encodeURIComponent(`Nomoshkar! I found your shop ${shop.name} on Jalpaiguri Connect. Are you open right now?`);
                          const waPhone = (shop.whatsappNumber || shop.phone).replace(/\D/g, '');
                          window.open(`https://wa.me/91${waPhone.slice(-10)}?text=${msg}`, '_blank');
                        }}
                        className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => navigate('shop-detail', { shopId: shop.id })}
                        className="px-3 py-2 rounded-xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>{language === 'bn' ? 'পণ্য দেখুন' : 'View Store'}</span>
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
    </div>
  );
};
