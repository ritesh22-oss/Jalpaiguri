import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Mic,
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
  Check
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLocation } from '../../context/LocationContext';
import { JalpaiguriLogo } from '../common/JalpaiguriLogo';
import { LiveJalpaiguriMap } from '../common/LiveJalpaiguriMap';
import { UNIFIED_NEARBY_DIRECTORY } from '../../data/nearbyServicesDirectory';
import { calculateHaversineDistance, formatDistanceString } from '../../data/jalpaiguriLocalities';
import { NearbyCategoryType } from '../../types';

export const HomeView: React.FC = () => {
  const { navigate, setIsAssistantOpen } = useNav();
  const { user } = useAuth();
  const { workers, doctors, localAlerts, civicReports, isRealtimeConnected, refreshData } = useApp();
  const { location, status, setIsLocationSelectorOpen, requestCurrentLocation } = useLocation();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const placeholders = [
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
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = user?.name ? user.name.split(' ')[0] : 'Citizen';

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
    { id: 'srv-workers', label: 'Workers', icon: <Wrench className="w-5 h-5 text-[#063B2C]" />, view: 'nearby' as const, cat: 'Workers' as NearbyCategoryType, bg: 'bg-[#E6F4EA]' },
    { id: 'srv-medical', label: 'Medical', icon: <Stethoscope className="w-5 h-5 text-[#0A58CA]" />, view: 'nearby' as const, cat: 'Medical' as NearbyCategoryType, bg: 'bg-[#EBF2FC]' },
    { id: 'srv-blood', label: 'Blood', icon: <Droplet className="w-5 h-5 text-[#D9383A]" />, view: 'nearby' as const, cat: 'Blood' as NearbyCategoryType, bg: 'bg-[#FFEBEA]' },
    { id: 'srv-jobs', label: 'Jobs', icon: <Briefcase className="w-5 h-5 text-[#854D0E]" />, view: 'nearby' as const, cat: 'Jobs' as NearbyCategoryType, bg: 'bg-[#FEF9C3]' },
    { id: 'srv-vehicle', label: 'Vehicle', icon: <Car className="w-5 h-5 text-[#475569]" />, view: 'nearby' as const, cat: 'Vehicle' as NearbyCategoryType, bg: 'bg-[#F1F5F9]' },
    { id: 'srv-animal', label: 'Animal Help', icon: <PawPrint className="w-5 h-5 text-[#15803D]" />, view: 'nearby' as const, cat: 'Animal' as NearbyCategoryType, bg: 'bg-[#DCFCE7]' },
    { id: 'srv-pharmacy', label: 'Pharmacies', icon: <Pill className="w-5 h-5 text-[#0891B2]" />, view: 'medical' as const, cat: 'Medical' as NearbyCategoryType, bg: 'bg-[#CFFAFE]' },
    { id: 'srv-rentals', label: 'Rentals', icon: <HomeIcon className="w-5 h-5 text-[#7C3AED]" />, view: 'nearby' as const, cat: 'Rentals' as NearbyCategoryType, bg: 'bg-[#F3E8FF]' },
    { id: 'srv-businesses', label: 'Shops', icon: <Store className="w-5 h-5 text-[#BE123C]" />, view: 'nearby' as const, cat: 'Shops' as NearbyCategoryType, bg: 'bg-[#FFE4E6]' },
    { id: 'srv-govt', label: 'Government', icon: <Landmark className="w-5 h-5 text-[#334155]" />, view: 'government' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-[#F1F5F9]' },
    { id: 'srv-lostfound', label: 'Lost & Found', icon: <HelpCircle className="w-5 h-5 text-[#D97706]" />, view: 'lost-found' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-[#FEF3C7]' },
    { id: 'srv-report', label: 'Report Issue', icon: <AlertTriangle className="w-5 h-5 text-[#D9383A]" />, view: 'report-problem' as const, cat: 'Services' as NearbyCategoryType, bg: 'bg-[#FEE2E2]' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      {/* Top Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-[#E8E4DA] sticky top-0 z-20 shadow-xs space-y-3">
        {/* User Greeting & Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <JalpaiguriLogo size="sm" showText={false} />
            <div>
              <h2 className="text-base font-extrabold text-[#11241C] tracking-tight flex items-center gap-1.5">
                <span>{greeting}, {userName}</span>
                <span>👋</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  onClick={() => setIsLocationSelectorOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#063B2C] cursor-pointer hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#063B2C] shrink-0" />
                  <span className="truncate max-w-[150px]">{location.name || `${location.locality}, ${location.city || ''}`}</span>
                </div>
                <div
                  onClick={() => refreshData()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#063B2C] text-[10px] font-bold cursor-pointer hover:bg-[#C8E6C9] transition-colors"
                  title="Real-time data stream active. Tap to sync."
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="w-9 h-9 rounded-full bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center hover:bg-[#C8E6C9] active:scale-95 transition-all shadow-xs cursor-pointer"
              title="AI Jalpaigi Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            {user ? (
              <div
                onClick={() => navigate('profile')}
                className="w-9 h-9 rounded-full bg-[#063B2C] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-[#A7D7B9]"
                title="View Profile"
              >
                {user.name ? user.name.charAt(0) : 'J'}
              </div>
            ) : (
              <button
                onClick={() => navigate('auth')}
                className="text-xs font-extrabold text-white bg-[#063B2C] px-3.5 py-1.5 rounded-full shadow-xs hover:bg-[#084D3A] cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* PROMINENT LOCATION SELECTOR BAR */}
        <div className="bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#063B2C]" />
              <span className="text-xs font-extrabold text-[#11241C]">
                Your Location
              </span>
            </div>

            <button
              onClick={() => setIsLocationSelectorOpen(true)}
              className="text-[11px] font-extrabold text-[#063B2C] hover:underline cursor-pointer"
            >
              Change Location
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E8E4DA]/60">
            <div className="flex items-center gap-1.5 truncate">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-bold text-[#11241C] truncate">
                📍 {location.name}
              </span>
            </div>

            <button
              onClick={handleUseCurrentLocation}
              disabled={isDetectingLocation}
              className="bg-white border border-[#D2CEBE] hover:border-[#063B2C] active:scale-95 transition-all text-[#063B2C] px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isDetectingLocation ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3" />
                  <span>Use GPS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* "What do you need today?" & Search Bar */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-extrabold text-[#55685F] uppercase tracking-wider px-0.5">
            What do you need today?
          </h3>
          <div
            onClick={() => navigate('nearby')}
            className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs cursor-pointer hover:border-[#063B2C] transition-all"
          >
            <Search className="w-4 h-4 text-[#55685F]" />
            <span className="text-xs font-medium text-[#73827B] flex-1">
              {placeholders[placeholderIndex]}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAssistantOpen(true);
              }}
              className="text-[#55685F] hover:text-[#063B2C]"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Urgent Help Card */}
        <div className="bg-gradient-to-r from-[#FFEBEA] to-[#FFF5F5] border border-[#FFCCD0] rounded-3xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D9383A] text-white flex items-center justify-center shadow-sm shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#8A1A1C] tracking-tight">
                Need urgent help?
              </h3>
              <p className="text-[11px] text-[#632021] font-medium">
                Ambulance, Hospital, Blood, Police & Fire
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('blood')}
            className="bg-[#D9383A] hover:bg-[#B92628] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Emergency
          </button>
        </div>

        {/* 2 NEW CORE FEATURES: GEMINI CHATBOT & GOOGLE MAPS GROUNDING */}
        <div className="grid grid-cols-2 gap-3">
          {/* Feature 1: Gemini AI Chat */}
          <div
            onClick={() => navigate('ai-chat')}
            className="bg-gradient-to-br from-[#063B2C] to-[#0A58CA] text-white rounded-3xl p-4 shadow-sm hover:shadow-md active:scale-98 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-emerald-300">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </div>
                <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini
                </span>
              </div>
              <h3 className="text-sm font-extrabold mt-2.5 leading-snug">
                Jalpaigi AI Chat
              </h3>
              <p className="text-[11px] text-emerald-100 mt-0.5 leading-tight">
                Multi-turn civic helper with local insights & memory.
              </p>
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold text-emerald-200">
              <span>Start Chat</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2: Google Maps Grounding */}
          <div
            onClick={() => navigate('maps-explorer')}
            className="bg-white border border-[#A7D7B9] rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-[#063B2C] active:scale-98 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-2xl bg-[#E6F4EA] flex items-center justify-center text-[#063B2C]">
                  <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[9px] font-bold bg-[#E6F4EA] text-[#063B2C] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Maps Live
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-[#11241C] mt-2.5 leading-snug">
                Maps Grounding
              </h3>
              <p className="text-[11px] text-[#55685F] mt-0.5 leading-tight">
                Verified clinics, stores, transport & tourist spots.
              </p>
            </div>

            <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-xs font-bold text-[#063B2C]">
              <span>Explore Places</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* NEARBY FOR YOU: Horizontally scrollable cards with Category · Distance */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h3 className="text-sm font-extrabold text-[#11241C] tracking-tight">
                Nearby For You
              </h3>
              <p className="text-[11px] font-semibold text-[#55685F]">
                Sorted by distance from {location.locality}
              </p>
            </div>
            <button
              onClick={() => navigate('nearby')}
              className="text-xs font-bold text-[#063B2C] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Explore all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
            {nearbyFeatured.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('nearby', { category: item.category })}
                className="w-64 bg-white rounded-2xl p-3.5 border border-[#E8E4DA] shadow-xs hover:shadow-md hover:border-[#063B2C] transition-all cursor-pointer flex flex-col justify-between shrink-0"
              >
                <div>
                  {/* Category & Distance Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#E6F4EA] text-[#063B2C] uppercase">
                      {item.subcategory}
                    </span>
                    <span className="text-[11px] font-black text-[#063B2C] flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {item.distanceText}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-[#11241C] line-clamp-1 leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#55685F] line-clamp-1 mt-0.5">
                    📍 {item.area}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#F0ECE1] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#11241C]">
                    {item.startingPrice || item.salary || item.openStatus || 'Available'}
                  </span>
                  <span className="text-[11px] font-extrabold text-[#063B2C] flex items-center gap-0.5">
                    <span>View</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 12 Quick Services Icon Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-[#11241C] tracking-tight">
              City Services
            </h3>
            <button
              onClick={() => navigate('nearby')}
              className="text-xs font-bold text-[#063B2C] hover:underline cursor-pointer"
            >
              View all
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
                className="bg-white border border-[#E8E4DA] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs hover:border-[#063B2C] hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${srv.bg} flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105`}
                >
                  {srv.icon}
                </div>
                <span className="text-[11px] font-bold text-[#11241C] leading-tight line-clamp-1">
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
              <Landmark className="w-4 h-4 text-[#063B2C]" />
              <h3 className="text-sm font-extrabold text-[#11241C] tracking-tight">
                Popular Government Services
              </h3>
            </div>
            <button
              onClick={() => navigate('government')}
              className="text-xs font-bold text-[#063B2C] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Exactly 2 Government Service Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => navigate('government')}
              className="bg-white border border-[#E8E4DA] rounded-2xl p-3.5 shadow-2xs hover:border-[#063B2C] hover:shadow-xs active:scale-98 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E6F4EA] text-[#063B2C] uppercase tracking-wider">
                    Pay Online
                  </span>
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <h4 className="font-extrabold text-xs text-[#11241C] leading-snug">
                  Property Tax & Mutation
                </h4>
                <p className="text-[10px] text-[#55685F] line-clamp-2 mt-1 font-medium">
                  Jalpaiguri Municipality portal for ward holding tax & receipts
                </p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-[#F0ECE1] flex items-center justify-between text-[10px] font-bold text-[#063B2C]">
                <span>Official Government Portal</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>

            <div
              onClick={() => navigate('government')}
              className="bg-white border border-[#E8E4DA] rounded-2xl p-3.5 shadow-2xs hover:border-[#063B2C] hover:shadow-xs active:scale-98 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#E0F2FE] text-[#0369A1] uppercase tracking-wider">
                    Official
                  </span>
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <h4 className="font-extrabold text-xs text-[#11241C] leading-snug">
                  Birth & Death Certificates
                </h4>
                <p className="text-[10px] text-[#55685F] line-clamp-2 mt-1 font-medium">
                  Janma-Mrityu Tathya WB verified digital civic certificates
                </p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-[#F0ECE1] flex items-center justify-between text-[10px] font-bold text-[#063B2C]">
                <span>Official Government Portal</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="mt-2.5">
            <button
              onClick={() => navigate('government')}
              className="w-full py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D2CEBE] text-[#063B2C] font-extrabold text-xs hover:bg-[#E6F4EA] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Landmark className="w-3.5 h-3.5 text-[#063B2C]" />
              <span>View All Government Services</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Small Live Map of Jalpaiguri According to User Location */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-sm font-extrabold text-[#11241C] tracking-tight flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#063B2C]" />
              <span>Live Location & Civic Map</span>
            </h3>
            <button
              onClick={() => navigate('maps-explorer')}
              className="text-xs font-bold text-[#063B2C] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Explore Full Map</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <LiveJalpaiguriMap height={200} showDetails={true} />
        </div>

        {/* Live Local Alerts */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-[#11241C] tracking-tight flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#D9383A]" />
              <span>Local Updates</span>
            </h3>
            <button
              onClick={() => navigate('alerts')}
              className="text-xs font-bold text-[#063B2C] hover:underline cursor-pointer"
            >
              Open Map
            </button>
          </div>

          {localAlerts.length > 0 ? (
            <div
              onClick={() => navigate('alerts')}
              className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs hover:border-[#063B2C] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[#D9383A] bg-[#FFEBEA] px-2.5 py-0.5 rounded-full">
                  {localAlerts[0].category}
                </span>
                <span className="text-[#8C9B93] font-medium">{localAlerts[0].timeAgo}</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#11241C]">
                {localAlerts[0].title}
              </h4>
              <p className="text-xs text-[#55685F] mt-1 line-clamp-2">
                {localAlerts[0].description} ({localAlerts[0].confirmedCount} citizens confirmed).
              </p>
            </div>
          ) : (
            <div
              onClick={() => navigate('alerts')}
              className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs hover:border-[#063B2C] transition-all cursor-pointer text-center"
            >
              <p className="text-xs font-semibold text-[#55685F]">
                No active traffic or weather hazards reported right now in Jalpaiguri.
              </p>
              <span className="text-[11px] font-bold text-[#063B2C] underline mt-1 inline-block">
                View Community Map & Report
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
