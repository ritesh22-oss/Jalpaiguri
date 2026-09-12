import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { query, collection, getDocs } from 'firebase/firestore';
import {
  ArrowLeft,
  Share2,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Truck,
  QrCode,
  Sparkles,
  Utensils,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Search,
  Check,
  X,
  Camera
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Restaurant, MenuItem } from '../../types';
import { FALLBACK_JALPAIGURI_RESTAURANTS } from '../../data/jalpaiguriRestaurantsFallback';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';

export const RestaurantDetailView: React.FC = () => {
  const { navParams, goBack, navigate } = useNav();
  const { language } = useLanguage();
  const restaurantId = navParams.restaurantId as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => {
    return FALLBACK_JALPAIGURI_RESTAURANTS.find(s => s.id === restaurantId) || null;
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'info' | 'reviews'>('catalog');
  const [menuItemSearch, setMenuItemSearch] = useState('');
  const [selectedMenuItemCategory, setSelectedMenuItemCategory] = useState<string>('All');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => {
    try {
      const thumbs = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
      return thumbs[restaurantId] || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const fetchRestaurantAndMenuItems = async () => {
      try {
        if (!restaurantId) return;

        
        const [restaurantRes, prodRes] = await Promise.all([
          fetch(`/api/restaurants/${restaurantId}`).catch(() => null),
          fetch(`/api/restaurants/${restaurantId}/menuItems`).catch(() => null)
        ]);
        
        let foundRestaurant: any = null;
        let foundMenuItems: any[] = [];
        
        try {
          // Fetch from Firebase directly for menu items
          const q = query(collection(db, 'restaurants', restaurantId, 'menuItems'));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            foundMenuItems.push({ id: doc.id, ...doc.data() });
          });
        } catch (e) {
          console.error("Error fetching menu items from firebase", e);
        }


        if (restaurantRes && restaurantRes.ok) {
          const restaurantData = await restaurantRes.json();
          foundRestaurant = restaurantData.restaurant ? { ...restaurantData.restaurant, ...restaurantData } : restaurantData;
          if (restaurantData.menuItems && Array.isArray(restaurantData.menuItems) && restaurantData.menuItems.length > 0) {
            foundMenuItems = restaurantData.menuItems;
          }
        }
        if (prodRes && prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData) && prodData.length > 0) {
            foundMenuItems = prodData;
          }
        }

        if (foundRestaurant) {
          setRestaurant(foundRestaurant);
        } else if (!restaurant) {
          const fallback = FALLBACK_JALPAIGURI_RESTAURANTS.find(s => s.id === restaurantId);
          if (fallback) setRestaurant(fallback);
        }

        if (foundMenuItems.length > 0) {
          setMenuItems(foundMenuItems);
        }
      } catch (err) {
        console.error('Error fetching restaurant detail:', err);
      }
    };

    fetchRestaurantAndMenuItems();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-10 h-10 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-[#55685F] dark:text-[#A2B3AA]">
          {language === 'bn' ? 'দোকানের বিবরণ লোড হচ্ছে...' : 'Loading restaurant catalog...'}
        </p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] p-6 text-center space-y-4">
        <button
          onClick={goBack}
          className="p-2 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
        </button>
        <h2 className="text-base font-bold text-[#11241C] dark:text-white">Restaurant Not Found</h2>
        <p className="text-xs text-gray-500">The requested store profile could not be loaded.</p>
      </div>
    );
  }

  // Filter menuItems
  const menuItemCategories = ['All', ...Array.from(new Set(menuItems.map(p => p.category)))];

  const filteredMenuItems = menuItems.filter(p => {
    if (selectedMenuItemCategory !== 'All' && p.category !== selectedMenuItemCategory) {
      return false;
    }
    if (menuItemSearch.trim()) {
      const q = menuItemSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBn = (p.nameBengali || '').toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchBn && !matchCat) return false;
    }
    return true;
  });

  const handleShare = () => {
    if (!restaurant) return;
    const phone = restaurant.phone || (restaurant as any).ownerPhone || '';
    if (navigator.share) {
      navigator.share({
        title: `${restaurant.name} - MYJPG`,
        text: `Check out ${restaurant.name} in ${restaurant.locality}, Jalpaiguri! Contact: ${phone}`,
        url: window.location.href
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage(language === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Restaurant link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleMenuItemOrder = (menuItem: MenuItem) => {
    if (!restaurant) return;
    const text = `Nomoshkar ${restaurant.name}! I want to order/inquire about "${menuItem.name}" (Price: ₹${menuItem.price}/${menuItem.unit}) which I saw on MYJPG. Is this available right now?`;
    const waPhone = (restaurant.whatsappNumber || restaurant.phone || (restaurant as any).ownerPhone || '9832011094').replace(/\D/g, '');
    window.open(`https://wa.me/91${waPhone.slice(-10)}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Top Floating Action Bar */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0B132B]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/60 dark:border-white/10">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <span className="font-extrabold text-sm text-[#11241C] dark:text-white truncate max-w-[200px]">
          {restaurant.name}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="mx-4 mt-2 bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-md text-center flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Image */}
      <div className="relative h-56 w-full bg-gray-200 dark:bg-gray-800">
        <img
          src={customPhoto || restaurant.photoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Upload Photo Button in Banner */}
        <button
          onClick={() => setIsPhotoModalOpen(true)}
          className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-white/20 z-10"
          title="Upload restaurant photo"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>Upload Photo</span>
        </button>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {(restaurant.isFeatured || (restaurant as any).featured) && (
              <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 fill-amber-950" />
                <span>Featured</span>
              </span>
            )}
            {(restaurant.isVerified || (restaurant as any).status === 'verified') && (
              <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-blue-200" />
                <span>Verified RestaurantOwner</span>
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
              restaurant.isOpen ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {restaurant.isOpen ? (language === 'bn' ? 'এখন খোলা' : 'Open Now') : (language === 'bn' ? 'বন্ধ' : 'Closed')}
            </span>
          </div>

          <h1 className="text-xl font-black text-white leading-tight">
            {restaurant.name}
          </h1>
          {(restaurant.nameBengali || (restaurant as any).nameBn) && (
            <p className="text-xs font-bold text-blue-300">
              {restaurant.nameBengali || (restaurant as any).nameBn}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Core Metadata Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#007AFF] dark:text-blue-400 bg-[#E6F4EA] dark:bg-blue-950/60 px-2.5 py-1 rounded-xl border border-blue-200/50 dark:border-blue-800/40">
              {restaurant.category}
            </span>

            <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 px-2.5 py-1 rounded-xl">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-black text-[#11241C] dark:text-white">{restaurant.rating || 4.8}</span>
              <span className="text-[10px] text-[#73827B] dark:text-[#A2B3AA]">({restaurant.reviewCount || 20} reviews)</span>
            </div>
          </div>

          {/* Locality & Address */}
          <div className="space-y-1 text-xs">
            <div className="flex items-start gap-2 text-[#11241C] dark:text-white font-semibold">
              <MapPin className="w-4 h-4 text-[#007AFF] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{restaurant.address}, {restaurant.locality}</p>
                {restaurant.landmark && (
                  <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">Near {restaurant.landmark}</p>
                )}
                <p className="text-[11px] text-gray-500">PIN: {restaurant.pincode} • Jalpaiguri, WB</p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA] pt-1">
              <Clock className="w-4 h-4 text-[#007AFF] dark:text-blue-400 shrink-0" />
              <span>
                {restaurant.openingHours?.open || (restaurant as any).openingTime || '08:00 AM'} to {restaurant.openingHours?.close || (restaurant as any).closingTime || '09:00 PM'}
              </span>
              {(restaurant.openingHours?.weeklyOff || (restaurant as any).weeklyOff) && (restaurant.openingHours?.weeklyOff !== 'None' && (restaurant as any).weeklyOff !== 'None') && (
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  (Closed: {restaurant.openingHours?.weeklyOff || (restaurant as any).weeklyOff})
                </span>
              )}
            </div>
          </div>

          {/* Delivery & UPI Badges */}
          <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between text-xs flex-wrap gap-2">
            {(restaurant.deliveryAvailable ?? (restaurant as any).homeDelivery ?? true) ? (
              <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 font-bold bg-[#E6F4EA] dark:bg-blue-950/60 px-2.5 py-1 rounded-xl">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'bn' ? 'হোম ডেলিভারি উপলব্ধ' : 'Home Delivery Available'}</span>
              </div>
            ) : (
              <span className="text-[11px] text-gray-500 font-semibold">{language === 'bn' ? 'দোকানে এসে সংগ্রহ' : 'In-Store Pickup Only'}</span>
            )}

            {restaurant.paymentMethods?.includes('UPI') && (
              <button
                onClick={() => setShowUpiModal(true)}
                className="flex items-center gap-1.5 text-[#007AFF] dark:text-blue-300 font-bold bg-[#D2EBE0] dark:bg-blue-950/70 px-2.5 py-1 rounded-xl hover:bg-[#C2E4D5] cursor-pointer transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'UPI পেমেন্ট QR' : 'Pay via UPI'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Instant Action Bar: Call, WhatsApp, Directions */}
        <div className="grid grid-cols-3 gap-2">
          {/* Call */}
          <button
            onClick={() => {
              const ph = restaurant.phone || (restaurant as any).ownerPhone || '+919832011094';
              window.location.href = `tel:${ph.replace(/\s+/g, '')}`;
            }}
            className="py-3 px-3 rounded-2xl bg-[#D2EBE0] dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-[#C2E4D5] active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer border border-blue-200/50 dark:border-blue-800/40"
          >
            <Phone className="w-4 h-4" />
            <span>{language === 'bn' ? 'কল করুন' : 'Call Restaurant'}</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => {
              const text = `Nomoshkar ${restaurant.name}! I am contacting you from MYJPG app regarding your menuItems.`;
              const waPhone = (restaurant.whatsappNumber || restaurant.phone || (restaurant as any).ownerPhone || '9832011094').replace(/\D/g, '');
              window.open(`https://wa.me/91${waPhone.slice(-10)}?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="py-3 px-3 rounded-2xl bg-blue-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-blue-700 active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
          </button>

          {/* Directions */}
          <button
            onClick={() => {
              const q = encodeURIComponent(`${restaurant.name}, ${restaurant.locality}, Jalpaiguri, West Bengal`);
              window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
            }}
            className="py-3 px-3 rounded-2xl bg-[#007AFF] dark:bg-blue-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-blue-700 active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer shadow-xs"
          >
            <MapPin className="w-4 h-4" />
            <span>{language === 'bn' ? 'লোকেশন' : 'Directions'}</span>
          </button>
        </div>

        {/* Tab Navigation: MenuItems, Info, Reviews */}
        <div className="flex border-b border-[#E8E4DA] dark:border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'catalog'
                ? 'border-[#007AFF] text-[#007AFF] dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>{language === 'bn' ? 'পণ্য তালিকা' : 'MenuItem Catalog'}</span>
            <span className="text-[10px] bg-gray-200 dark:bg-gray-800 px-1.5 py-0.2 rounded-full">
              {menuItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'info'
                ? 'border-[#007AFF] text-[#007AFF] dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <span>{language === 'bn' ? 'দোকানের বিবরণ' : 'About & Delivery'}</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'reviews'
                ? 'border-[#007AFF] text-[#007AFF] dark:border-blue-400 dark:text-blue-400 font-black'
                : 'border-transparent text-[#55685F] dark:text-[#A2B3AA]'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{language === 'bn' ? 'মতামত' : 'Reviews'}</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-3">
            {/* Search within catalog */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={menuItemSearch}
                onChange={(e) => setMenuItemSearch(e.target.value)}
                placeholder={language === 'bn' ? 'দোকানের মধ্যে পণ্য খুঁজুন...' : 'Search items in this store...'}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-xl text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#007AFF]"
              />
            </div>

            {/* Category pills */}
            {menuItemCategories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {menuItemCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedMenuItemCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                      selectedMenuItemCategory === cat
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* MenuItem items list */}
            {filteredMenuItems.length === 0 ? (
              <div className="py-8 text-center bg-white dark:bg-[#0F172A] rounded-2xl border border-[#E8E4DA] dark:border-white/10 p-6 space-y-2">
                <Utensils className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
                <p className="text-xs font-bold text-[#11241C] dark:text-white">
                  {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No items match your search'}
                </p>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {language === 'bn' ? 'সরাসরি হোয়াটসঅ্যাপে দোকানদারকে জিজ্ঞেস করতে পারেন।' : 'You can message the restaurantOwner directly on WhatsApp to ask about inventory.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredMenuItems.map((menuItem) => (
                  <div
                    key={menuItem.id}
                    className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl overflow-hidden p-2.5 flex flex-col justify-between shadow-2xs hover:border-[#007AFF] transition-colors"
                  >
                    <div>
                      {/* MenuItem Image */}
                      {menuItem.photoUrl && (
                        <div className="h-28 w-full rounded-xl overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800">
                          <img
                            src={menuItem.photoUrl}
                            alt={menuItem.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase truncate">
                          {menuItem.category}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                          menuItem.inStock
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {menuItem.inStock ? (language === 'bn' ? 'স্টকে আছে' : 'In Stock') : (language === 'bn' ? 'স্টক শেষ' : 'Out of Stock')}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white leading-snug line-clamp-2">
                        {menuItem.name}
                      </h4>
                      {menuItem.nameBengali && (
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold truncate">
                          {menuItem.nameBengali}
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#F0ECE1] dark:border-white/10">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-sm font-black text-[#11241C] dark:text-white">
                          ₹{menuItem.price}
                        </span>
                        {menuItem.discountPrice && (
                          <span className="text-[10px] line-through text-gray-400 font-semibold">
                            ₹{menuItem.discountPrice}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 font-semibold">
                          /{menuItem.unit}
                        </span>
                      </div>

                      <button
                        onClick={() => handleMenuItemOrder(menuItem)}
                        className="w-full py-1.5 px-2 rounded-xl bg-[#007AFF] dark:bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{language === 'bn' ? 'অর্ডার করুন' : 'Order'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ABOUT & DELIVERY */}
        {activeTab === 'info' && (
          <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-4 text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white mb-1">
                {language === 'bn' ? 'দোকানের পরিচিতি' : 'About This Restaurant'}
              </h3>
              <p className="text-[#55685F] dark:text-[#A2B3AA] leading-relaxed font-semibold">
                {restaurant.description || 'Welcome to our restaurant in Jalpaiguri. We offer fresh quality menuItems, reasonable prices, and dependable service to all customers.'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F0ECE1] dark:border-white/10 space-y-2">
              <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white">
                {language === 'bn' ? 'ডেলিভারি সংক্রান্ত তথ্য' : 'Delivery Details'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <span className="text-gray-500 block">Home Delivery</span>
                  <span className="font-bold text-[#11241C] dark:text-white">
                    {restaurant.deliveryAvailable ? 'Available' : 'Coffee Pickup Only'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <span className="text-gray-500 block">Delivery Radius</span>
                  <span className="font-bold text-[#11241C] dark:text-white">
                    {restaurant.deliveryRadiusKm ? `Up to ${restaurant.deliveryRadiusKm} km` : 'Jalpaiguri Town'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <span className="text-gray-500 block">Minimum Order</span>
                  <span className="font-bold text-[#11241C] dark:text-white">
                    ₹{restaurant.minOrderAmount || '0'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <span className="text-gray-500 block">Free Delivery Above</span>
                  <span className="font-bold text-blue-600">
                    ₹{restaurant.freeDeliveryAbove || '300'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0ECE1] dark:border-white/10 space-y-2">
              <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white">
                {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Accepted Payment Modes'}
              </h4>
              <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                {(restaurant.paymentMethods || ['Cash', 'UPI']).map((m) => (
                  <span
                    key={m}
                    className="px-3 py-1 rounded-xl bg-[#E6F4EA] dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 border border-blue-200/50"
                  >
                    ✓ {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-[#11241C] dark:text-white">
                  {restaurant.rating}
                </span>
                <span className="text-xs text-gray-500 ml-1 font-semibold">/ 5.0</span>
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-[#E6F4EA] dark:bg-blue-950/60 px-2 py-0.5 rounded-lg">
                100% Jalpaiguri Local Reviews
              </span>
            </div>

            <div className="divide-y divide-[#F0ECE1] dark:divide-white/10 pt-2">
              <div className="py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#11241C] dark:text-white">Pradeep Sarkar (Kadamtala)</span>
                  <span className="text-[10px] text-gray-400">2 days ago</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {'★★★★★'}
                </div>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                  Always fresh stock and very polite behavior. Fast delivery across Dinbazar area.
                </p>
              </div>

              <div className="py-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#11241C] dark:text-white">Moumita Sen (Hakimpara)</span>
                  <span className="text-[10px] text-gray-400">1 week ago</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {'★★★★★'}
                </div>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                  Convenient WhatsApp ordering and UPI payment support. Very dependable.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPI QR CODE MODAL */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-xs w-full p-5 text-center space-y-3 border border-[#E8E4DA] dark:border-white/10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-[#007AFF] dark:text-blue-400">
                Direct Contactless Payment
              </span>
              <button
                onClick={() => setShowUpiModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-black text-[#11241C] dark:text-white">
              Pay {restaurant.name}
            </h3>

            {/* Custom SVG QR Code for payment */}
            <div className="p-3 bg-white rounded-2xl border border-gray-200 inline-block shadow-inner">
              <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Corner registration squares */}
                <rect x="5" y="5" width="26" height="26" rx="4" fill="#007AFF" />
                <rect x="9" y="9" width="18" height="18" fill="white" />
                <rect x="13" y="13" width="10" height="10" fill="#007AFF" />

                <rect x="69" y="5" width="26" height="26" rx="4" fill="#007AFF" />
                <rect x="73" y="9" width="18" height="18" fill="white" />
                <rect x="77" y="13" width="10" height="10" fill="#007AFF" />

                <rect x="5" y="69" width="26" height="26" rx="4" fill="#007AFF" />
                <rect x="9" y="73" width="18" height="18" fill="white" />
                <rect x="13" y="77" width="10" height="10" fill="#007AFF" />

                {/* QR Data Dots */}
                <rect x="36" y="8" width="5" height="5" fill="#007AFF" />
                <rect x="45" y="8" width="5" height="5" fill="#007AFF" />
                <rect x="55" y="8" width="5" height="5" fill="#007AFF" />
                <rect x="36" y="20" width="5" height="5" fill="#007AFF" />
                <rect x="48" y="24" width="8" height="8" fill="#007AFF" />
                <rect x="10" y="38" width="6" height="6" fill="#007AFF" />
                <rect x="22" y="45" width="6" height="6" fill="#007AFF" />
                <rect x="36" y="38" width="8" height="8" fill="#007AFF" />
                <rect x="52" y="40" width="6" height="6" fill="#007AFF" />
                <rect x="68" y="38" width="6" height="6" fill="#007AFF" />
                <rect x="80" y="44" width="8" height="8" fill="#007AFF" />
                <rect x="38" y="56" width="6" height="6" fill="#007AFF" />
                <rect x="52" y="56" width="8" height="8" fill="#007AFF" />
                <rect x="68" y="56" width="6" height="6" fill="#007AFF" />
                <rect x="44" y="72" width="6" height="6" fill="#007AFF" />
                <rect x="58" y="74" width="8" height="8" fill="#007AFF" />
                <rect x="74" y="74" width="6" height="6" fill="#007AFF" />
                <rect x="84" y="84" width="6" height="6" fill="#007AFF" />
              </svg>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-mono font-bold text-gray-700 dark:text-gray-300">
                {restaurant.upiId || `${restaurant.phone.replace(/\D/g, '').slice(-10)}@okaxis`}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold">
                Scan with Google Pay, PhonePe, Paytm, or BHIM
              </p>
            </div>

            <button
              onClick={() => {
                const upi = restaurant.upiId || `${restaurant.phone.replace(/\D/g, '').slice(-10)}@okaxis`;
                navigator.clipboard.writeText(upi);
                alert('UPI ID copied to clipboard!');
              }}
              className="w-full py-2.5 rounded-xl bg-[#007AFF] text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Copy UPI ID
            </button>
          </div>
        </div>
      )}

      <UploadPlacePhotoModal
        placeId={restaurant.id}
        placeName={restaurant.name}
        category={`Dining - ${restaurant.category}`}
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUploaded={(url) => setCustomPhoto(url)}
      />
    </div>
  );
};
