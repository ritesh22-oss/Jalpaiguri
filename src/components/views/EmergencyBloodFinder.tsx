import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Search,
  Droplet,
  MapPin,
  Filter,
  Navigation,
  ArrowLeft,
  Phone,
  MessageSquare,
  AlertCircle,
  Plus,
  Info,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Clock,
  ExternalLink,
  Map as MapIcon,
  List as ListIcon
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useLanguage } from '../../context/LanguageContext';
import { BloodGroup, BloodDonor, UserLocation } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { getDistance } from '../../utils/location';
import { collection, query, where, getDocs, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const RADIUS_OPTIONS = [
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 }
];

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const EmergencyBloodFinder: React.FC = () => {
  const { navigate } = useNav();
  const { location: userLocation } = useLocation();
  const { isBengali } = useLanguage();
  const { user } = useAuth();
  
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | 'All'>('All');
  const [radius, setRadius] = useState(10);
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedDonor, setSelectedDonor] = useState<BloodDonor | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Load donors from Firestore
  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      try {
        const donorsRef = collection(db, 'blood_donors');
        let q = query(
          donorsRef,
          where('isVisible', '==', true),
          where('agreedToSearch', '==', true)
        );

        if (selectedGroup !== 'All') {
          q = query(q, where('bloodGroup', '==', selectedGroup));
        }

        const querySnapshot = await getDocs(q);
        const fetchedDonors: BloodDonor[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as BloodDonor;
          
          // Client-side distance filtering
          if (userLocation) {
            const distance = getDistance(
              userLocation.lat,
              userLocation.lng,
              data.lat,
              data.lng
            );
            
            if (distance <= radius) {
              fetchedDonors.push({ ...data, id: doc.id, distanceKm: distance });
            }
          } else {
            fetchedDonors.push({ ...data, id: doc.id });
          }
        });

        // Sort by distance
        fetchedDonors.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
        setDonors(fetchedDonors);
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [selectedGroup, radius, userLocation]);

  // Map Initialization logic
  useEffect(() => {
    if (!mapRef.current || !userLocation || mapLoaded) return;

    const initMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        const map = new Map(mapRef.current as HTMLElement, {
          center: { lat: userLocation.lat, lng: userLocation.lng },
          zoom: 13,
          mapId: 'BLOOD_FINDER_MAP',
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#746855' }]
            }
          ]
        });

        googleMapRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.error("Map initialization failed", err);
        setMapError("Could not load map. Please check your connection.");
      }
    };

    initMap();
  }, [userLocation]);

  // Update Markers when donors or location change
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const addMarkers = async () => {
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      // User's location marker
      if (userLocation) {
        const userPin = new PinElement({
          background: '#2563EB',
          borderColor: '#1D4ED8',
          glyphColor: 'white',
          scale: 1.2
        });

        const userMarker = new AdvancedMarkerElement({
          map: googleMapRef.current,
          position: { lat: userLocation.lat, lng: userLocation.lng },
          title: "My Location",
          content: userPin.element
        });
        
        markersRef.current.push(userMarker as any);
      }

      // Donor markers
      donors.forEach(donor => {
        const donorPin = new PinElement({
          background: '#D9383A',
          borderColor: '#B91C1C',
          glyphColor: 'white',
          scale: 1.0
        });

        const marker = new AdvancedMarkerElement({
          map: googleMapRef.current,
          position: { lat: donor.lat, lng: donor.lng },
          title: `${donor.bloodGroup} - ${donor.name}`,
          content: donorPin.element
        });

        marker.addListener('click', () => {
          setSelectedDonor(donor);
        });

        markersRef.current.push(marker as any);
      });
    };

    addMarkers();
  }, [donors, userLocation, mapLoaded]);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, group: string) => {
    const text = `Hello, I found your contact on MYJPG Blood Help. We have an emergency need for ${group} blood. Are you available to help?`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] flex flex-col select-none transition-colors">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-[#0B132B]/80 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-4 py-3 flex items-center gap-3 shrink-0 z-50">
        <button
          onClick={() => navigate('blood')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#11241C] dark:text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-black text-[#11241C] dark:text-white uppercase tracking-tight">
            {isBengali ? 'জরুরি রক্ত অনুসন্ধানকারী' : 'Emergency Blood Finder'}
          </h1>
          <p className="text-[10px] font-bold text-[#55685F] dark:text-[#A2B3AA] uppercase tracking-wider">
            {isBengali ? 'আশেপাশের রক্তদাতাদের খুঁজুন' : 'Find Donors Nearby'}
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Map Section */}
        <div className="relative h-[200px] w-full bg-gray-100 dark:bg-[#0B132B]">
          {!mapError && (
            <div ref={mapRef} className="w-full h-full" />
          )}

          {/* Quick Stats Overlay */}
          <div className="absolute top-4 left-4 right-4 z-20">
            <div className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-2xl p-3 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Droplet className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nearby Donors</div>
                  <div className="text-sm font-black text-[#11241C] dark:text-white">
                    {donors.length} {selectedGroup !== 'All' ? selectedGroup : ''} Donors
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10" />
                <div className="text-right">
                  <div className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Radius</div>
                  <div className="text-sm font-black text-[#11241C] dark:text-white">{radius} KM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="p-4 space-y-4">
            {loading ? (
              <div className="space-y-4 pt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : donors.length === 0 ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Droplet className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#11241C] dark:text-white">No Donors Found</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] mx-auto">
                    No matching donors found within {radius}km. Try increasing the search radius.
                  </p>
                </div>
                <button 
                  onClick={() => setRadius(prev => Math.min(50, prev + 10))}
                  className="px-6 py-3 bg-blue-600 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Increase Radius to {Math.min(50, radius + 10)} KM
                </button>
              </div>
            ) : (
              donors.map((donor) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={donor.id}
                  onClick={() => setSelectedDonor(donor)}
                  className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs flex flex-col gap-4 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                          <Droplet className="w-6 h-6 fill-current" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#0F172A] uppercase tracking-wider">
                          Live
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#11241C] dark:text-white leading-tight">{donor.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-500 text-white uppercase tracking-tighter">
                            Group {donor.bloodGroup}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">•</span>
                          <span className="text-[10px] font-bold text-[#55685F] dark:text-[#A2B3AA]">{donor.approximateArea}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distance</div>
                      <div className="text-sm font-black text-[#11241C] dark:text-white">
                        {donor.distanceKm ? donor.distanceKm.toFixed(1) : '?'} KM
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#FAF8F5] dark:bg-white/5 rounded-2xl p-2.5 border border-[#E8E4DA] dark:border-white/10">
                      <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Status</div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${donor.availability === 'Available Now' ? 'bg-green-500 animate-pulse' : donor.availability === 'Available Today' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                        <span className="text-[10px] font-black text-[#11241C] dark:text-white uppercase">{donor.availability}</span>
                      </div>
                    </div>
                    <div className="bg-[#FAF8F5] dark:bg-white/5 rounded-2xl p-2.5 border border-[#E8E4DA] dark:border-white/10">
                      <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Verified</div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-black text-[#11241C] dark:text-white uppercase">Identity Verified</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
        </div>
        
        {/* Filters Section (No longer overlay, now part of page flow) */}
        <div className="p-4 pb-10">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-[32px] p-4 shadow-xs">
            <div className="space-y-4">
              {/* Group Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedGroup('All')}
                  className={`shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    selectedGroup === 'All' 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-[#FAF8F5] dark:bg-white/5 border-[#E8E4DA] dark:border-white/10 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  All
                </button>
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setSelectedGroup(bg)}
                    className={`shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      selectedGroup === bg 
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30' 
                        : 'bg-[#FAF8F5] dark:bg-white/5 border-[#E8E4DA] dark:border-white/10 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRadius(opt.value)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        radius === opt.value 
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent' 
                          : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10" />
                <button 
                  onClick={() => navigate('create-blood-request')}
                  className="px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg shadow-red-500/30 active:scale-95 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  Post Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Donor Bottom Sheet / Detail View */}
      <AnimatePresence>
        {selectedDonor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDonor(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0B132B] rounded-t-[40px] z-[70] p-6 shadow-2xl transition-colors"
            >
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6" />
              
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[24px] bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 border-2 border-red-100 dark:border-red-900/30 shadow-inner">
                      <Droplet className="w-8 h-8 fill-current" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#11241C] dark:text-white leading-tight">{selectedDonor.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-red-600 text-white uppercase tracking-wider shadow-sm shadow-red-500/20">
                          Group {selectedGroup === 'All' ? selectedDonor.bloodGroup : selectedGroup}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="text-[9px] font-black uppercase tracking-widest tracking-widest">Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#FAF8F5] dark:bg-white/5 rounded-2xl p-3 border border-[#E8E4DA] dark:border-white/10 text-center min-w-[80px]">
                    <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Distance</div>
                    <div className="text-lg font-black text-[#11241C] dark:text-white">{selectedDonor.distanceKm?.toFixed(1) || '?'} KM</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#FAF8F5] dark:bg-white/5 rounded-2xl p-3 border border-[#E8E4DA] dark:border-white/10">
                    <Clock className="w-4 h-4 text-orange-500 mb-2" />
                    <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Availability</div>
                    <div className="text-[10px] font-black text-[#11241C] dark:text-white uppercase truncate">{selectedDonor.availability}</div>
                  </div>
                  <div className="bg-[#FAF8F5] dark:bg-white/5 rounded-2xl p-3 border border-[#E8E4DA] dark:border-white/10">
                    <Droplet className="w-4 h-4 text-red-500 mb-2" />
                    <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Donations</div>
                    <div className="text-[10px] font-black text-[#11241C] dark:text-white uppercase">{selectedDonor.donationsCount} Times</div>
                  </div>
                  <div className="bg-[#FAF8F5] dark:bg-white/5 rounded-2xl p-3 border border-[#E8E4DA] dark:border-white/10">
                    <Calendar className="w-4 h-4 text-blue-500 mb-2" />
                    <div className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Last Donated</div>
                    <div className="text-[10px] font-black text-[#11241C] dark:text-white uppercase">{selectedDonor.lastDonation || 'Never'}</div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-200 font-medium leading-relaxed italic">
                    "{selectedDonor.note || 'Available to donate in case of genuine emergencies. Please contact only for verified needs.'}"
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-3 pb-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleWhatsApp(selectedDonor.phone, selectedDonor.bloodGroup)}
                      className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 font-black text-xs uppercase tracking-wider hover:bg-blue-400 transition-all duration-300"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleCall(selectedDonor.phone)}
                      className="flex-1 py-4 bg-[#11241C] dark:bg-white text-white dark:text-[#0B132B] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-black/10 font-black text-xs uppercase tracking-wider hover:bg-black dark:hover:bg-gray-100 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </button>
                  </div>
                  
                  <button
                    onClick={() => navigate('donor-details', { donorId: selectedDonor.id, donor: selectedDonor })}
                    className="w-full py-3 bg-gray-100 dark:bg-white/5 text-[#55685F] dark:text-[#A2B3AA] rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  >
                    View Full Donor Profile
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 pb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Secure MYJPG Emergency Link</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
