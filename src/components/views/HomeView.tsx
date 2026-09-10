import React, { useState, useEffect, useMemo } from 'react';
import {
  Bus, Package, GraduationCap,
  Coffee, Search,
  Mic, Send,
  MapPin,
  Sparkles,
  AlertTriangle,
  Wrench,
  Stethoscope,
  Droplet,
  Briefcase,
  Car,
  PawPrint,
  Pill,
  Home as HomeIcon,
  Store,
  Landmark,
  Building2,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  ExternalLink,
  Star,
  Clock,
  Radio,
  Navigation,
  Loader2,
  Check,
  ShoppingBag,
  PackageSearch,
  PlusCircle
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { JalpaiguriLogo } from '../common/JalpaiguriLogo';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { LiveJalpaiguriMap } from '../common/LiveJalpaiguriMap';
import { HomeSearchAssistant } from '../common/HomeSearchAssistant';
import { UNIFIED_NEARBY_DIRECTORY } from '../../data/nearbyServicesDirectory';
import { calculateHaversineDistance, formatDistanceString } from '../../data/jalpaiguriLocalities';
import { NearbyCategoryType, DurgaPandalItem } from '../../types';
import { HomePujaPandalsSection } from './HomePujaPandalsSection';
import { PandalDetailsModal } from '../modals/PandalDetailsModal';
import { ReportPandalModal } from '../modals/ReportPandalModal';

export const HomeView: React.FC = () => {
  const { navigate, setIsAssistantOpen } = useNav();
  const { user, firebaseUser } = useAuth();
  const { workers, doctors, localAlerts, civicReports, isRealtimeConnected, refreshData, pujaPandals, reportPandalInfo } = useApp();
  const { location, status, setIsLocationSelectorOpen, requestCurrentLocation } = useLocation();
  const { isBengali, t, tLocality, tCategory } = useLanguage();

  const [selectedPandal, setSelectedPandal] = useState<DurgaPandalItem | null>(null);
  const [isPandalDetailsOpen, setIsPandalDetailsOpen] = useState(false);
  const [isPandalReportOpen, setIsPandalReportOpen] = useState(false);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  const placeholders = isBengali
    ? [
        'কর্মী, ডাক্তার, দোকান বা পরিষেবা খুঁজুন...',
        'কদমতলায় ইলেকট্রিশিয়ান প্রয়োজন?',
        '২৪x৭ রক্তদাতা বা হাসপাতাল প্রয়োজন?',
        'স্থানীয় দোকান বা কাজের সুযোগ খুঁজুন...',
        'নিকটস্থ অটো/টোটো বা বাইক মেকানিক...'
      ]
    : [
        'Find a worker, doctor, shop or service...',
        'Need an electrician in Kadamtala?',
        'Need 24x7 blood donor or hospital?',
        'Find local shop or job vacancies...',
        'Auto / Toto or bike mechanic near you...'
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Calculate dynamic time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (isBengali) {
      if (hour < 12) return 'সুপ্রভাত';
      if (hour < 17) return 'শুভ অপরাহ্ন';
      return 'শুভ সন্ধ্যা';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [isBengali]);

  const userName = user?.name ? user.name.split(' ')[0] : (isBengali ? 'নাগরিক' : 'Citizen');

  // Calculate dynamic nearby items for horizontal scroll
  const nearbyFeatured = useMemo(() => {
    return UNIFIED_NEARBY_DIRECTORY.map((item) => {
      const dist = calculateHaversineDistance(location.lat, location.lng, item.lat, item.lng);
      return {
        ...item,
        distanceKm: dist,
        distanceText: formatDistanceString(dist)
      };
    })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
      .slice(0, 8);
  }, [location.lat, location.lng]);

  const handleUseCurrentLocation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetectingLocation(true);
    await requestCurrentLocation();
    setIsDetectingLocation(false);
  };

  const quickServices = [
    { id: 'srv-transport', label: isBengali ? 'পরিবহন' : 'Transport', icon: <Bus className="w-5 h-5 text-blue-600 dark:text-blue-300" />, view: 'transport' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 'srv-courier', label: isBengali ? 'কুরিয়ার' : 'Courier', icon: <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />, view: 'courier' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'srv-education', label: isBengali ? 'শিক্ষা' : 'Education', icon: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />, view: 'education' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 'srv-workers', label: isBengali ? 'কর্মী' : 'Workers', icon: <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-300" />, view: 'nearby' as const, cat: 'Workers' as NearbyCategoryType, bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 'srv-medical', label: isBengali ? 'চিকিৎসা' : 'Medical', icon: <Stethoscope className="w-5 h-5 text-blue-700 dark:text-blue-200" />, view: 'nearby' as const, cat: 'Medical' as NearbyCategoryType, bg: 'bg-blue-100/50 dark:bg-blue-900/40' },
    { id: 'srv-banks', label: isBengali ? 'ব্যাঙ্ক ও এটিএম' : 'Banks & ATMs', icon: <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-300" />, view: 'banks-atms' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 'srv-jobs', label: isBengali ? 'চাকরি' : 'Jobs', icon: <Briefcase className="w-5 h-5 text-amber-700 dark:text-amber-300" />, view: 'nearby' as const, cat: 'Jobs' as NearbyCategoryType, bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { id: 'srv-vehicle', label: isBengali ? 'যানবাহন' : 'Vehicle', icon: <Car className="w-5 h-5 text-slate-700 dark:text-slate-300" />, view: 'nearby' as const, cat: 'Vehicle' as NearbyCategoryType, bg: 'bg-slate-50 dark:bg-slate-800/40' },
    { id: 'srv-animal', label: isBengali ? 'প্রাণী সেবা' : 'Animal Help', icon: <PawPrint className="w-5 h-5 text-sky-700 dark:text-sky-300" />, view: 'nearby' as const, cat: 'Animal' as NearbyCategoryType, bg: 'bg-sky-50 dark:bg-sky-950/40' },
    { id: 'srv-pharmacy', label: isBengali ? 'ফার্মেসি' : 'Pharmacies', icon: <Pill className="w-5 h-5 text-cyan-700 dark:text-cyan-300" />, view: 'medical' as const, cat: 'Medical' as NearbyCategoryType, bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
    { id: 'srv-rentals', label: isBengali ? 'ভাড়া' : 'Rentals', icon: <HomeIcon className="w-5 h-5 text-violet-700 dark:text-violet-300" />, view: 'nearby' as const, cat: 'Rentals' as NearbyCategoryType, bg: 'bg-violet-50 dark:bg-violet-950/40' },
    { id: 'srv-dining', label: isBengali ? 'ক্যাফে ও রেস্তোরাঁ' : 'Cafés & Dining', icon: <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-300" />, view: 'dining-marketplace' as const, cat: 'Dining' as NearbyCategoryType, bg: 'bg-amber-100/50 dark:bg-amber-900/40' },
    { id: 'srv-businesses', label: isBengali ? 'দোকান ও বাজার' : 'Shops & Mart', icon: <Store className="w-5 h-5 text-rose-700 dark:text-rose-300" />, view: 'shop-marketplace' as const, cat: 'Shops' as NearbyCategoryType, bg: 'bg-rose-50 dark:bg-rose-950/40' },
    { id: 'srv-govt', label: isBengali ? 'সরকারি' : 'Government', icon: <Landmark className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />, view: 'government' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 'srv-lostfound', label: isBengali ? 'হারানো ও প্রাপ্তি' : 'Lost & Found', icon: <HelpCircle className="w-5 h-5 text-orange-700 dark:text-orange-300" />, view: 'lost-found' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-orange-50 dark:bg-orange-950/40' },
    { id: 'srv-report', label: isBengali ? 'অভিযোগ' : 'Report Issue', icon: <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-400" />, view: 'report-problem' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-red-100/50 dark:bg-red-950/60' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Top Header */}
      <div className="bg-white dark:bg-[#121E2C] px-5 pt-3.5 pb-4 border-b border-gray-100 dark:border-white/10 sticky top-0 z-20 shadow-xs space-y-3 transition-colors">
        {/* Topmost Row: App Logo at most top left corner */}
        <div className="flex items-center justify-between">
          <div
            id="home-top-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center cursor-pointer select-none group"
            title="MYJPG - Jalpaiguri Connect"
          >
            <JalpaiguriLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                id="home-profile-btn"
                onClick={() => navigate('profile')}
                className="w-9 h-9 rounded-full bg-[#007AFF] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-blue-300 overflow-hidden"
                title="View Profile"
              >
                {firebaseUser?.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{user.name ? user.name.charAt(0) : 'J'}</span>
                )}
              </button>
            ) : (
              <button
                id="home-signin-btn"
                onClick={() => navigate('auth')}
                className="text-xs font-extrabold text-white bg-[#007AFF] dark:bg-blue-600 px-3.5 py-1.5 rounded-full shadow-xs hover:bg-blue-700 cursor-pointer"
              >
                {isBengali ? 'সাইন ইন' : 'Sign In'}
              </button>
            )}
          </div>
        </div>

        {/* User Greeting & Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white tracking-tight flex items-center gap-1.5">
                <span>{greeting}, {userName}</span>
                <span>👋</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  id="home-locality-btn"
                  onClick={() => setIsLocationSelectorOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#007AFF] dark:text-blue-400 cursor-pointer hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[150px]">{tLocality(location.name || `${location.locality}, ${location.city || ''}`)}</span>
                </div>
                <button
                  id="home-gps-detect-btn"
                  onClick={handleUseCurrentLocation}
                  disabled={isDetectingLocation}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 text-[10px] font-bold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border border-blue-200/60 dark:border-blue-800/40"
                  title="Use GPS to detect location"
                >
                  {isDetectingLocation ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3" />
                  )}
                  <span>{isBengali ? 'জিপিএস' : 'GPS'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* "What do you need today?" & Search Bar */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-0.5">
            {isBengali ? 'আজ আপনার কি প্রয়োজন?' : 'What do you need today?'}
          </h3>
          <div
            onClick={() => navigate('nearby')}
            id="home-search-bar"
            className="w-full bg-[#F8FAFC] dark:bg-[#1A2634] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs cursor-pointer hover:border-[#007AFF] dark:hover:border-blue-500 transition-all"
          >
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex-1">
              {placeholders[placeholderIndex]}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAssistantOpen(true);
              }}
              className="text-gray-400 dark:text-gray-500 hover:text-[#007AFF]"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Jalpaiguri AI Assistant Compact Search/Chat Input Box */}
        <div
          id="home-ai-assistant-box"
          onClick={() => setIsAssistantOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open Jalpaiguri AI Assistant"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsAssistantOpen(true);
            }
          }}
          className="w-full bg-gradient-to-r from-blue-50/90 via-white to-blue-50/60 dark:from-[#121E2C] dark:via-[#1A2838] dark:to-[#121E2C] border border-blue-200/80 dark:border-blue-800/60 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:border-[#007AFF] dark:hover:border-blue-500 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#007AFF] dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/50 px-2 py-0.2 rounded-full">
                  {isBengali ? 'জলপাইগুড়ি এআই' : 'Jalpaiguri AI'}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate mt-0.5">
                {isBengali ? 'জলপাইগুড়ি নিয়ে যেকোনো প্রশ্ন করুন...' : 'Ask anything about Jalpaiguri...'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-100/70 dark:bg-blue-900/60 text-[#007AFF] dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:bg-[#007AFF] group-hover:text-white transition-colors">
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* JALPAIGURI LOCAL MARKETPLACE & SHOPS COMPACT SHOWCASE CARD */}
        <div className="bg-white dark:bg-[#121E2C] border border-blue-100 dark:border-blue-900/50 rounded-2xl p-3.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#007AFF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.2 rounded-md">
                    {isBengali ? 'স্থানীয় বাজার' : 'Local Marketplace'}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate mt-0.5">
                  {isBengali ? 'দোকান ও পণ্যের ক্যাটালগ' : 'Neighborhood Shops & Live Catalog'}
                </h3>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-[#007AFF] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full shrink-0 border border-blue-100 dark:border-blue-900/40">
              {isBengali ? '৩৪+ দোকান' : '34+ Shops'}
            </span>
          </div>

          <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug line-clamp-2">
            {isBengali
              ? 'মুদিখানা, মিষ্টি, ওষুধ, ইলেকট্রনিক্স ও পোশাক—সরাসরি দোকানদারের সাথে হোয়াটসঅ্যাপে যোগাযোগ ও পণ্যের দাম জানুন।'
              : 'Discover local grocery, sweets, pharmacy, electronics & apparel stores with direct WhatsApp order.'}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              id="btn-home-browse-shops"
              onClick={() => navigate('shop-marketplace')}
              className="py-1.5 px-2.5 rounded-xl bg-[#007AFF] text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs hover:bg-blue-600 active:scale-98 transition-all cursor-pointer"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{isBengali ? 'দোকান ব্রাউজ' : 'Browse Shops'}</span>
            </button>
            <button
              id="btn-home-smart-search"
              onClick={() => navigate('smart-shopping-search')}
              className="py-1.5 px-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#007AFF] dark:text-blue-300 font-bold text-[11px] flex items-center justify-center gap-1 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100/60 active:scale-98 transition-all cursor-pointer"
            >
              <PackageSearch className="w-3.5 h-3.5" />
              <span>{isBengali ? 'পণ্য খুঁজুন' : 'Find Any Item'}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            <button
              onClick={() => navigate('add-shop')}
              className="hover:text-[#007AFF] dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-3 h-3 text-[#007AFF]" />
              <span>{isBengali ? 'দোকান রেজিস্টার (+)' : 'Register Shop (+)'}</span>
            </button>
            <button
              onClick={() => navigate('merchant-dashboard')}
              className="font-bold text-[#007AFF] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{isBengali ? 'মার্চেন্ট ড্যাশবোর্ড' : 'Merchant Portal'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>



        {/* DURGA PUJA PANDALS SECTION: Completely replaces the old Nearby For You section */}
        <HomePujaPandalsSection
          pandals={pujaPandals}
          userLocation={location}
          onSelectPandal={(pandal) => {
            setSelectedPandal(pandal);
            setIsPandalDetailsOpen(true);
          }}
          onNavigateToAll={() => navigate('puja-pandals')}
        />

        {/* 12 Quick Services Icon Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-[#11241C] dark:text-white tracking-tight">
              {isBengali ? 'শহরের পরিষেবা' : 'City Services'}
            </h3>
            <button
              onClick={() => navigate('nearby')}
              className="text-xs font-bold text-[#007AFF] dark:text-[#38BDF8] hover:underline cursor-pointer"
            >
              {isBengali ? 'সব দেখুন' : 'View all'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {quickServices.map((srv) => (
              <button
                key={srv.id}
                id={srv.id}
                onClick={() => {
                  if (srv.view === 'nearby') {
                    navigate('nearby', { category: srv.cat });
                  } else {
                    navigate(srv.view);
                  }
                }}
                className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs hover:border-[#007AFF] dark:hover:border-blue-500 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${srv.bg} dark:bg-blue-900/30 border border-transparent dark:border-blue-800/50 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105`}
                >
                  {srv.icon}
                </div>
                <span className="text-[11px] font-bold text-[#11241C] dark:text-white leading-tight line-clamp-1">
                  {srv.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Government Services Section (Only 2 cards + View All) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-[#007AFF] dark:text-[#38BDF8]" />
              <h3 className="text-sm font-extrabold text-[#11241C] dark:text-white tracking-tight">
                {isBengali ? 'জনপ্রিয় সরকারি পরিষেবা' : 'Popular Government Services'}
              </h3>
            </div>
            <button
              onClick={() => navigate('government')}
              className="text-xs font-bold text-[#007AFF] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{isBengali ? 'সব দেখুন' : 'View All'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Exactly 2 Government Service Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => navigate('government')}
              className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-3.5 shadow-2xs hover:border-[#007AFF] dark:hover:border-blue-500 hover:shadow-xs active:scale-98 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E6F4EA] dark:bg-blue-950/60 text-[#007AFF] dark:text-[#38BDF8] uppercase tracking-wider">
                    {isBengali ? 'অনলাইন পেমেন্ট' : 'Pay Online'}
                  </span>
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                </div>
                <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white leading-snug">
                  {isBengali ? 'সম্পত্তি কর ও মিউটেশন' : 'Property Tax & Mutation'}
                </h4>
                <p className="text-[10px] text-[#55685F] dark:text-[#A2B3AA] line-clamp-2 mt-1 font-medium">
                  {isBengali ? 'হোল্ডিং ট্যাক্স ও রসিদের জন্য জলপাইগুড়ি পুরসভার পোর্টাল' : 'Jalpaiguri Municipality portal for ward holding tax & receipts'}
                </p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between text-[10px] font-bold text-[#007AFF] dark:text-[#38BDF8]">
                <span>{isBengali ? 'অফিসিয়াল সরকারি পোর্টাল' : 'Official Government Portal'}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>

            <div
              onClick={() => navigate('government')}
              className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-3.5 shadow-2xs hover:border-[#007AFF] dark:hover:border-blue-500 hover:shadow-xs active:scale-98 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E0F2FE] dark:bg-[#153448] text-[#0369A1] dark:text-[#70C1FF] uppercase tracking-wider">
                    {isBengali ? 'অফিসিয়াল' : 'Official'}
                  </span>
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                </div>
                <h4 className="font-extrabold text-xs text-[#11241C] dark:text-white leading-snug">
                  {isBengali ? 'জন্ম ও মৃত্যু শংসাপত্র' : 'Birth & Death Certificates'}
                </h4>
                <p className="text-[10px] text-[#55685F] dark:text-[#A2B3AA] line-clamp-2 mt-1 font-medium">
                  {isBengali ? 'জন্ম-মৃত্যু তথ্য পশ্চিমবঙ্গ ডিজিটাল নাগরিক শংসাপত্র' : 'Janma-Mrityu Tathya WB verified digital civic certificates'}
                </p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between text-[10px] font-bold text-[#007AFF] dark:text-[#38BDF8]">
                <span>{isBengali ? 'অফিসিয়াল সরকারি পোর্টাল' : 'Official Government Portal'}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="mt-2.5">
            <button
              onClick={() => navigate('government')}
              className="w-full py-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#0F172A] border border-[#D2CEBE] dark:border-white/10 text-[#007AFF] dark:text-[#38BDF8] font-extrabold text-xs hover:bg-[#E6F4EA] dark:hover:bg-[#1F312A] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Landmark className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#38BDF8]" />
              <span>{isBengali ? 'সকল সরকারি পরিষেবা দেখুন' : 'View All Government Services'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Small Live Map of Jalpaiguri According to User Location */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-sm font-extrabold text-[#11241C] dark:text-white tracking-tight flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#007AFF] dark:text-[#38BDF8]" />
              <span>{isBengali ? 'লাইভ অবস্থান ও মানচিত্র' : 'Live Location & Civic Map'}</span>
            </h3>
            <button
              onClick={() => navigate('maps-explorer')}
              className="text-xs font-bold text-[#007AFF] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{isBengali ? 'সম্পূর্ণ মানচিত্র' : 'Explore Full Map'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <HomeSearchAssistant onSearch={(query) => {
              console.log('Map query submitted:', query);
              setMapSearchQuery(query);
          }} />
          <LiveJalpaiguriMap height={200} showDetails={true} searchQuery={mapSearchQuery} />
        </div>

        {/* Live Traffic & Waterlogging Highlights */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#11241C] dark:text-white tracking-tight flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#007AFF] dark:text-[#38BDF8]" />
                <span>{isBengali ? 'লাইভ ট্রাফিক ও জলজট' : 'Live Traffic & Waterlogging'}</span>
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                <span>{isBengali ? 'লাইভ' : 'Live'}</span>
              </span>
            </div>
            <button
              onClick={() => navigate('alerts')}
              className="text-xs font-bold text-[#007AFF] dark:text-[#38BDF8] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{isBengali ? 'সম্পূর্ণ মানচিত্র' : 'Full Map'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            onClick={() => navigate('alerts')}
            className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs hover:border-[#007AFF] dark:hover:border-blue-500 transition-all cursor-pointer group space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#007AFF] dark:text-[#60A5FA] bg-[#E6F4EA] dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                {isBengali ? 'গুগল ট্রাফিক লেয়ার' : 'Google Traffic Layer'}
              </span>
              <span className="text-[11px] text-[#8C9B93] dark:text-[#73857C] font-medium flex items-center gap-1">
                <span>{isBengali ? 'রিয়েল-টাইম গতি' : 'Real-time Speeds'}</span>
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white group-hover:text-[#007AFF] dark:group-hover:text-[#38BDF8] transition-colors">
              {isBengali ? 'নজরদারিকৃত ট্রানজিট ও নিকাশী পথ' : 'Monitored Transit Corridors & Drainage'}
            </h4>
            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
              {isBengali
                ? 'এনএইচ-২৭ তিস্তা সেতু, দিনবাজার, কদমতলা ও মোহিতনগরে রিয়েল-টাইম ট্রাফিক ও পুরসভার জলজটের তথ্য।'
                : 'Real-time Google Maps traffic on NH-27 Teesta Bridge, Dinbazar, Kadamtala & Mohitnagar. Verified municipal flood & waterlogging telemetry.'}
            </p>
            <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between text-[11px] font-bold text-[#007AFF] dark:text-[#38BDF8]">
              <span>{isBengali ? 'ট্রাফিক ও জলজট ওভারলে দেখুন' : 'Toggle Traffic & Waterlogging Overlays'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Pandal Modals */}
        <PandalDetailsModal
          pandal={selectedPandal}
          isOpen={isPandalDetailsOpen}
          onClose={() => setIsPandalDetailsOpen(false)}
          userLocation={location}
          onOpenReportModal={(pandal) => {
            setSelectedPandal(pandal);
            setIsPandalReportOpen(true);
          }}
        />

        <ReportPandalModal
          pandal={selectedPandal}
          isOpen={isPandalReportOpen}
          onClose={() => setIsPandalReportOpen(false)}
          onSubmitReport={reportPandalInfo}
        />
      </div>
    </div>
  );
};
