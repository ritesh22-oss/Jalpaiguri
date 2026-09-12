import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Landmark,
  Building2,
  Search,
  MapPin,
  Clock,
  Phone,
  Globe,
  Navigation,
  CheckCircle2,
  Filter,
  ExternalLink,
  ChevronLeft,
  X,
  CreditCard,
  ShieldCheck,
  Calendar,
  UserCheck,
  SlidersHorizontal,
  Compass,
  Map,
  List,
  Info,
  DollarSign,
  Briefcase,
  AlertCircle,
  Camera
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNav } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  BankEntity,
  VERIFIED_JALPAIGURI_BANKS_AND_ATMS,
  isOfficialBankUrl,
  BankType
} from '../../data/banksData';
import { calculateHaversineDistance, formatDistanceString } from '../../data/jalpaiguriLocalities';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';
import { getAdminPlaceThumbnails } from '../../utils/placesPhotoClient';

type TabType = 'BANKS' | 'ATMs' | 'ALL';
type SubViewMode = 'list' | 'map';
type SortOption = 'nearest' | 'bank' | 'open' | 'cdm';

export const BanksAtmsView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { location } = useLocation();
  const { isBengali } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [viewMode, setViewMode] = useState<SubViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('nearest');
  const [selectedEntity, setSelectedEntity] = useState<BankEntity | null>(null);
  const [uploadEntity, setUploadEntity] = useState<BankEntity | null>(null);
  const [customThumbs, setCustomThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
      setCustomThumbs(stored);
    } catch {}
  }, []);

  // External Website Redirect Confirmation Modal State
  const [redirectModalUrl, setRedirectModalUrl] = useState<string | null>(null);
  const [redirectModalTitle, setRedirectModalTitle] = useState<string>('');

  // Leaflet Map Ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Calculate distances & filter items
  const processedData = useMemo(() => {
    return VERIFIED_JALPAIGURI_BANKS_AND_ATMS.map((item) => {
      const dist = calculateHaversineDistance(location.lat, location.lng, item.latitude, item.longitude);
      return {
        ...item,
        distanceKm: dist,
        distanceText: formatDistanceString(dist)
      };
    });
  }, [location.lat, location.lng]);

  const filteredItems = useMemo(() => {
    let result = processedData;

    // Filter by Tab
    if (activeTab === 'BANKS') {
      result = result.filter((item) => item.type === 'BANK');
    } else if (activeTab === 'ATMs') {
      result = result.filter((item) => item.type === 'ATM');
    }

    // Filter by Selected Filter Chip
    if (selectedFilter === 'Government Bank') {
      result = result.filter((item) => item.category === 'Government Bank');
    } else if (selectedFilter === 'Private Bank') {
      result = result.filter((item) => item.category === 'Private Bank');
    } else if (selectedFilter === 'Small Finance Bank') {
      result = result.filter((item) => item.category === 'Small Finance Bank');
    } else if (selectedFilter === 'Cash Deposit') {
      result = result.filter((item) => item.cashDeposit);
    } else if (selectedFilter === '24×7 ATM') {
      result = result.filter((item) => item.atm24x7 || item.is24x7);
    } else if (selectedFilter === 'Locker') {
      result = result.filter((item) => item.services.includes('Locker Facility') || item.services.includes('Locker'));
    } else if (selectedFilter === 'Loans') {
      result = result.filter((item) => item.services.some(s => s.toLowerCase().includes('loan')));
    } else if (selectedFilter === 'Forex') {
      result = result.filter((item) => item.services.some(s => s.toLowerCase().includes('forex')));
    } else if (selectedFilter === 'Open Now') {
      result = result.filter((item) => item.isOpenNow);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.bankName.toLowerCase().includes(q) ||
          item.branchName.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q) ||
          item.locality.toLowerCase().includes(q) ||
          (item.ifsc && item.ifsc.toLowerCase().includes(q)) ||
          item.services.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort Items
    if (sortBy === 'nearest') {
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'bank') {
      result.sort((a, b) => a.bankName.localeCompare(b.bankName));
    } else if (sortBy === 'open') {
      result.sort((a, b) => (b.isOpenNow ? 1 : 0) - (a.isOpenNow ? 1 : 0));
    } else if (sortBy === 'cdm') {
      result.sort((a, b) => (b.cashDeposit ? 1 : 0) - (a.cashDeposit ? 1 : 0));
    }

    return result;
  }, [processedData, activeTab, selectedFilter, searchQuery, sortBy]);

  // Leaflet Map Initialization & Marker Rendering
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    let isSubscribed = true;

    // Always re-initialize map cleanly for the current container
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [location.lat, location.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 2
    }).addTo(map);

    mapInstanceRef.current = map;

    // Clear markers array
    markersRef.current.forEach((m) => {
      try { m.remove(); } catch {}
    });
    markersRef.current = [];

    // User Location Marker
    const userIcon = L.divIcon({
      className: 'user-pin',
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#007AFF;border:3px solid #ffffff;box-shadow:0 0 10px rgba(0,122,255,0.5);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    const uMarker = L.marker([location.lat, location.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<b>${isBengali ? 'আপনার অবস্থান' : 'Your Current Location'}</b>`);
    markersRef.current.push(uMarker);

    // Entity Markers (Branches & ATMs)
    filteredItems.forEach((item) => {
      const isBank = item.type === 'BANK';
      const iconHtml = isBank
        ? `<div style="background:#007AFF;color:#ffffff;border-radius:12px;padding:6px;box-shadow:0 4px 10px rgba(0,0,0,0.25);border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">🏦</div>`
        : `<div style="background:#0D9488;color:#ffffff;border-radius:12px;padding:6px;box-shadow:0 4px 10px rgba(0,0,0,0.25);border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">🏧</div>`;

      const customIcon = L.divIcon({
        className: 'entity-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedEntity(item);
      });

      markersRef.current.push(marker);
    });

    if (filteredItems.length > 0 && isSubscribed) {
      try {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.15));
      } catch {}
    }

    setTimeout(() => {
      if (isSubscribed && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {}
      }
    }, 100);

    return () => {
      isSubscribed = false;
      markersRef.current.forEach((m) => {
        try { m.remove(); } catch {}
      });
      markersRef.current = [];

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode, filteredItems, location.lat, location.lng, isBengali]);

  const handleGetDirections = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(
      name
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenExternal = (url: string, title: string) => {
    if (!url) return;
    if (isOfficialBankUrl(url)) {
      setRedirectModalUrl(url);
      setRedirectModalTitle(title);
    } else {
      alert(isBengali ? 'অননুমোদিত ব্যাংক লিংক।' : 'Unverified bank link prevented for safety.');
    }
  };

  const filterChips = [
    'All',
    'Government Bank',
    'Private Bank',
    'Small Finance Bank',
    'Open Now',
    '24×7 ATM',
    'Cash Deposit',
    'Locker',
    'Loans',
    'Forex'
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] pb-28 select-none transition-colors">
      {/* Top Header */}
      <div className="w-full bg-white dark:bg-[#121E2C] border-b border-gray-100 dark:border-white/10 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 pt-3 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              id="btn-banks-back"
              onClick={goBack}
              className="p-1.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <Landmark className="w-5 h-5 text-[#007AFF] dark:text-blue-400" />
                <span>{isBengali ? 'ব্যাঙ্ক ও এটিএম নির্দেশিকা' : 'Banks & ATMs Jalpaiguri'}</span>
              </h1>
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {isBengali ? 'জলপাইগুড়ির সমস্ত ভেরিফায়েড ব্যাঙ্ক ও এটিএম' : 'Verified Branches & 24x7 ATMs'}
              </p>
            </div>
          </div>

          {/* Toggle View Mode: List / Map */}
          <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/10">
            <button
              id="btn-view-list"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-[#007AFF] text-white shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{isBengali ? 'তালিকা' : 'List'}</span>
            </button>
            <button
              id="btn-view-map"
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'map'
                  ? 'bg-[#007AFF] text-white shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{isBengali ? 'ম্যাপ' : 'Map'}</span>
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            id="input-banks-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isBengali
                ? 'SBI, HDFC, Axis, কদমতলা, দিনবাজার বা এটিএম খুঁজুন...'
                : 'Search SBI, HDFC, Axis, Kadamtala, Dinbazar, ATM...'
            }
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#007AFF] dark:focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Category Tabs: BANKS | ATMs | ALL */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-gray-100/90 dark:bg-white/5 border border-gray-200/60 dark:border-white/10">
          <button
            id="tab-banks-all"
            onClick={() => setActiveTab('ALL')}
            className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'ALL'
                ? 'bg-white dark:bg-blue-900/60 text-[#007AFF] dark:text-blue-300 shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <span>{isBengali ? 'সবগুলো' : 'All'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950/80 font-extrabold">
              {processedData.length}
            </span>
          </button>
          <button
            id="tab-banks-only"
            onClick={() => setActiveTab('BANKS')}
            className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'BANKS'
                ? 'bg-[#007AFF] text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isBengali ? 'ব্যাঙ্ক' : 'Banks'}</span>
          </button>
          <button
            id="tab-atms-only"
            onClick={() => setActiveTab('ATMs')}
            className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'ATMs'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{isBengali ? 'এটিএম' : 'ATMs'}</span>
          </button>
        </div>

        {/* Filter Chips Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 shrink-0 uppercase tracking-wider pr-1">
            <Filter className="w-3 h-3" />
            <span>{isBengali ? 'ফিল্টার' : 'Filter'}</span>
          </div>
          {filterChips.map((chip) => {
            const isSelected = selectedFilter === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedFilter(chip)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-2xs'
                    : 'bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-[#007AFF]'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Results Header Count & Sort options */}
        <div className="flex items-center justify-between text-xs font-extrabold text-gray-500 dark:text-gray-400 px-0.5">
          <span>
            {isBengali
              ? `${filteredItems.length} টি ভেরিফায়েড কেন্দ্র পাওয়া গেছে`
              : `Found ${filteredItems.length} verified branches & ATMs`}
          </span>

          <div className="flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              id="select-banks-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-bold text-[#007AFF] dark:text-blue-400 focus:outline-none cursor-pointer"
            >
              <option value="nearest">{isBengali ? 'নিকটতম (GPS)' : 'Nearest'}</option>
              <option value="bank">{isBengali ? 'ব্যাঙ্ক নাম' : 'Bank Name'}</option>
              <option value="open">{isBengali ? 'খোলা আছে' : 'Open Now'}</option>
              <option value="cdm">{isBengali ? 'ক্যাশ ডিপোজিট' : 'Cash Deposit'}</option>
            </select>
          </div>
        </div>

        {/* MAP VIEW */}
        {viewMode === 'map' && (
          <div className="space-y-3">
            <div
              ref={mapContainerRef}
              className="w-full h-80 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden relative z-10"
            />
            {selectedEntity ? (
              <div className="bg-white dark:bg-[#121E2C] border border-blue-200 dark:border-blue-800/80 rounded-2xl p-4 shadow-md space-y-3 relative">
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-2.5 pr-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-[#007AFF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                    {selectedEntity.type === 'BANK' ? <Building2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#007AFF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.2 rounded-md">
                      {selectedEntity.bankName}
                    </span>
                    <h3 className="font-black text-sm text-gray-900 dark:text-white mt-0.5">
                      {selectedEntity.branchName}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">
                      📍 {selectedEntity.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-white/10">
                  <span className="font-extrabold text-[#007AFF]">📏 {selectedEntity.distanceText}</span>
                  <button
                    onClick={() => handleGetDirections(selectedEntity.latitude, selectedEntity.longitude, `${selectedEntity.bankName} ${selectedEntity.branchName}`)}
                    className="py-1.5 px-3 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center gap-1 shadow-2xs hover:bg-blue-600 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'দিকনির্দেশ পান' : 'Get Directions'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center text-gray-500 font-medium">
                {isBengali ? 'ম্যাপের পিন চেপে বিস্তারিত কার্ড দেখুন।' : 'Tap any map marker to view branch / ATM card.'}
              </p>
            )}
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className={filteredItems.length === 0 ? "space-y-3.5" : "grid grid-cols-1 md:grid-cols-2 gap-3.5"}>
            {filteredItems.length === 0 ? (
              /* EMPTY STATE */
              <div className="bg-white dark:bg-[#121E2C] border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-4 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#007AFF] dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/40">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-gray-900 dark:text-white">
                    {isBengali ? 'কোনো ভেরিফায়েড ব্যাঙ্ক বা এটিএম পাওয়া যায়নি' : 'No verified bank or ATM found nearby.'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                    {isBengali
                      ? 'অন্য ফিল্টার ব্যবহার করুন অথবা ম্যাপ ভিউ খুলুন।'
                      : 'Try resetting your search query, or explore using Map View.'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    id="btn-empty-reset"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedFilter('All');
                      setActiveTab('ALL');
                    }}
                    className="py-2 px-4 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-bold text-xs hover:bg-gray-200 cursor-pointer"
                  >
                    {isBengali ? 'পুনরায় খুঁজুন' : 'Search Again'}
                  </button>
                  <button
                    id="btn-empty-open-map"
                    onClick={() => setViewMode('map')}
                    className="py-2 px-4 rounded-xl bg-[#007AFF] text-white font-bold text-xs shadow-2xs hover:bg-blue-600 cursor-pointer flex items-center gap-1"
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'ম্যাপ খুলুন' : 'Open Map'}</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isBank = item.type === 'BANK';
                return (
                  <div
                    key={item.id}
                    id={`card-bank-${item.id}`}
                    className="bg-white dark:bg-[#121E2C] border border-gray-200/90 dark:border-white/10 rounded-2xl p-4 shadow-2xs hover:border-[#007AFF] dark:hover:border-blue-500 transition-all space-y-3.5"
                  >
                    {/* Top Row: Bank Badge, Type & Verification */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {(() => {
                          const approvedThumbs = getAdminPlaceThumbnails(item.id);
                          const activeThumb = approvedThumbs.length > 0 ? approvedThumbs[0] : customThumbs[item.id];
                          if (activeThumb) {
                            return (
                              <img
                                src={activeThumb}
                                alt={item.branchName}
                                className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            );
                          }
                          return (
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                isBank
                                  ? 'bg-blue-50 dark:bg-blue-950/80 text-[#007AFF] dark:text-blue-400 border-blue-100 dark:border-blue-900/40'
                                  : 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40'
                              }`}
                            >
                              {isBank ? <Building2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                            </div>
                          );
                        })()}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#007AFF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.2 rounded-md">
                              {item.bankName}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.2 rounded-md">
                              {item.category}
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-gray-900 dark:text-white truncate mt-0.5">
                            {item.branchName}
                          </h3>
                        </div>
                      </div>

                      {/* Distance Badge & Upload Action */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setUploadEntity(item)}
                          className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                          title="Upload branch or ATM photo"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#007AFF] dark:text-blue-300 text-xs font-black border border-blue-100 dark:border-blue-900/40">
                          <Navigation className="w-3 h-3" />
                          <span>{item.distanceText}</span>
                        </span>
                      </div>
                    </div>

                    {/* Address & Timings */}
                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-start gap-1.5 leading-snug">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>{item.address}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {item.workingDays} • {item.openingHours}
                          </span>
                        </div>
                        {item.isOpenNow && (
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                            🟢 {isBengali ? 'এখন খোলা' : 'Open Now'}
                          </span>
                        )}
                        {item.is24x7 && (
                          <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800/40">
                            🟢 {isBengali ? '২৪x৭ খোলা' : 'Open 24/7'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Approved Community Gallery */}
                    {(() => {
                      const approvedThumbs = getAdminPlaceThumbnails(item.id);
                      if (approvedThumbs.length > 0) {
                        return (
                          <div className="space-y-1 pt-1.5 border-t border-gray-100 dark:border-white/5">
                            <span className="text-[9px] uppercase font-black tracking-wider text-gray-400">Verified Photos ({approvedThumbs.length})</span>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                              {approvedThumbs.map((url, uidx) => (
                                <img
                                  key={uidx}
                                  src={url}
                                  alt="curated thumb"
                                  className="w-12 h-12 rounded-xl object-cover border border-[#E8E4DA] dark:border-white/10 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Technical Codes: IFSC, MICR, Branch Code (if available) */}
                    {(item.ifsc || item.branchCode) && (
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                        {item.ifsc && (
                          <div>
                            <span className="text-[9px] font-bold uppercase text-gray-400 block">
                              IFSC Code
                            </span>
                            <span className="font-extrabold text-gray-800 dark:text-gray-200">
                              {item.ifsc}
                            </span>
                          </div>
                        )}
                        {item.branchCode && (
                          <div>
                            <span className="text-[9px] font-bold uppercase text-gray-400 block">
                              Branch Code
                            </span>
                            <span className="font-extrabold text-gray-800 dark:text-gray-200">
                              {item.branchCode}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Services Chips */}
                    {item.services && item.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {item.services.map((srv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                          >
                            ✓ {srv}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Branch Manager Info Section */}
                    {isBank && (
                      <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[#007AFF] dark:text-blue-400 shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase">
                              {isBengali ? 'শাখা প্রবন্ধক' : 'Branch Manager'}
                            </span>
                            <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px]">
                              {item.managerName
                                ? item.managerName
                                : (isBengali
                                    ? 'শাখা ব্যবস্থাপকের তথ্য সর্বজনীনভাবে উপলভ্য নয়।'
                                    : 'Branch manager information not publicly available.')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Customer Care Phone Contact */}
                    {item.customerCare && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-xs">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block uppercase">
                              {isBengali ? 'কাস্টমার কেয়ার' : 'Customer Care / Helpdesk'}
                            </span>
                            <span className="font-black text-blue-800 dark:text-blue-300 text-xs">
                              {item.customerCare}
                            </span>
                          </div>
                        </div>
                        <a
                          href={`tel:${item.customerCare.split('/')[0].trim()}`}
                          className="py-1.5 px-3 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-2xs hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{isBengali ? 'কল করুন' : 'Call Helpdesk'}</span>
                        </a>
                      </div>
                    )}

                    {/* Action Buttons: Get Directions | Official Website | Official Locator */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-white/10">
                      <button
                        onClick={() => handleGetDirections(item.latitude, item.longitude, `${item.bankName} ${item.branchName}`)}
                        className="py-2 px-3 rounded-xl bg-[#007AFF] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-blue-600 active:scale-98 transition-all cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{isBengali ? 'দিকনির্দেশ' : 'Get Directions'}</span>
                      </button>

                      {item.officialWebsite && (
                        <button
                          onClick={() => handleOpenExternal(item.officialWebsite, item.bankName)}
                          className="py-2 px-3 rounded-xl bg-gray-100 dark:bg-white/10 text-[#007AFF] dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 active:scale-98 transition-all cursor-pointer border border-gray-200 dark:border-white/10"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{isBengali ? 'অফিসিয়াল ওয়েবসাইট' : 'Official Website'}</span>
                        </button>
                      )}
                    </div>

                    {/* Footer Verification Stamp */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-1">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isBengali ? 'সঠিক ভেরিফায়েড ডেটা' : 'Verified Official Data'}</span>
                      </div>
                      <span>
                        {isBengali ? `সর্বশেষ ভেরিফায়েড: ${item.lastVerified}` : `Last verified: ${item.lastVerified}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* EXTERNAL REDIRECT CONFIRMATION MODAL */}
      {redirectModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121E2C] border border-gray-200 dark:border-white/10 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-[#007AFF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {isBengali ? 'অফিসিয়াল ওয়েবসাইটে প্রবেশ করছেন' : 'Leaving MYJPG Portal'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {redirectModalTitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5 font-medium">
              {isBengali
                ? `আপনি MYJPG থেকে বেরিয়ে ব্যাঙ্কটির অফিসিয়াল সিকিউর পোর্টালে যাচ্ছেন:\n${redirectModalUrl}`
                : `You are leaving MYJPG and opening the official bank website:\n${redirectModalUrl}`}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setRedirectModalUrl(null)}
                className="py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 cursor-pointer"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  const target = redirectModalUrl;
                  setRedirectModalUrl(null);
                  window.open(target, '_blank', 'noopener,noreferrer');
                }}
                className="py-2.5 px-3 rounded-xl bg-[#007AFF] text-white font-bold text-xs shadow-2xs hover:bg-blue-600 cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{isBengali ? 'চালিয়ে যান' : 'Continue ↗'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadEntity && (
        <UploadPlacePhotoModal
          placeId={uploadEntity.id}
          placeName={`${uploadEntity.bankName} - ${uploadEntity.branchName}`}
          category={uploadEntity.type === 'BANK' ? 'Financial - Bank' : 'Financial - ATM'}
          isOpen={!!uploadEntity}
          onClose={() => setUploadEntity(null)}
          onUploaded={(url) => {
            setCustomThumbs(prev => ({ ...prev, [uploadEntity.id]: url }));
          }}
        />
      )}
    </div>
  );
};
