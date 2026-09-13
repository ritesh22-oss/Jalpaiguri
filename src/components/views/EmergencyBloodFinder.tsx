import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
  CheckCircle,
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
import { db, auth } from '../../lib/firebase';
import { demoDonors } from '../../data/demoDonors';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female' | 'Other'>('All');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 99]);
  const [selectedAvailability, setSelectedAvailability] = useState<'All' | 'Available Now' | 'Available Today' | 'Recently active'>('All');
  const [radius, setRadius] = useState(10);
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Derived active filters
  const activeFilters = useMemo(() => {
    const filters = [];
    if (selectedGroup !== 'All') filters.push({ label: `Group: ${selectedGroup}`, key: 'group' });
    if (selectedGender !== 'All') filters.push({ label: `Gender: ${selectedGender}`, key: 'gender' });
    if (selectedAvailability !== 'All') filters.push({ label: selectedAvailability, key: 'availability' });
    if (radius !== 10) filters.push({ label: `Within ${radius} km`, key: 'radius' });
    return filters;
  }, [selectedGroup, selectedGender, selectedAvailability, radius]);
  
  const clearFilters = () => {
      setSelectedGroup('All');
      setSelectedGender('All');
      setAgeRange([18, 99]);
      setSelectedAvailability('All');
      setRadius(10);
  };

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

        const querySnapshot = await getDocs(q).catch((error) => {
          handleFirestoreError(error, OperationType.GET, 'blood_donors');
          return { docs: [] } as any; 
        });
        let fetchedDonors: BloodDonor[] = [];
        
        // Add Demo donors first for testing purposes
        const allDonors = [...demoDonors, ...querySnapshot.docs.map(doc => ({ ...doc.data() as BloodDonor, id: doc.id }))];
        
        allDonors.forEach((data) => {
          
          // Apply filters
          if (selectedGroup !== 'All' && data.bloodGroup !== selectedGroup) return;
          if (selectedGender !== 'All' && data.gender !== selectedGender) return;
          if ((data.age || 0) < ageRange[0] || (data.age || 0) > ageRange[1]) return;
          if (selectedAvailability !== 'All' && data.availability !== selectedAvailability) return;
          
          // Distance filtering
          if (userLocation) {
            const distance = getDistance(
              userLocation.lat,
              userLocation.lng,
              data.lat,
              data.lng
            );
            
            if (distance <= radius) {
              fetchedDonors.push({ ...data, distanceKm: distance });
            }
          } else {
            fetchedDonors.push({ ...data });
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
  }, [selectedGroup, selectedGender, ageRange, selectedAvailability, radius, userLocation, user]);

  // Map Initialization
  useEffect(() => {
    if (!mapRef.current || !userLocation || mapLoaded) return;
    const initMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const map = new Map(mapRef.current as HTMLElement, {
          center: { lat: userLocation.lat, lng: userLocation.lng },
          zoom: 13,
          mapId: 'BLOOD_FINDER_MAP',
          disableDefaultUI: true,
        });
        googleMapRef.current = map;
        setMapLoaded(true);
      } catch (err) { setMapError("Could not load map."); }
    };
    initMap();
  }, [userLocation, mapLoaded]);

  // Marker Updates
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    const addMarkers = async () => {
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
        donors.forEach(donor => {
            const donorPin = new PinElement({ background: donor.isDemo ? '#4A90E2' : '#D9383A', scale: 0.8 });
            const marker = new AdvancedMarkerElement({
                map: googleMapRef.current,
                position: { lat: donor.lat, lng: donor.lng },
                content: donorPin.element
            });
            markersRef.current.push(marker as any);
        });
    };
    addMarkers();
  }, [donors, mapLoaded]);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string, group: string) => {
    const text = `Hello, I found your contact on MYJPG Blood Help. We have an emergency need for ${group} blood. Are you available to help?`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="w-full h-screen bg-[#FAF8F5] dark:bg-[#0B132B] flex flex-col select-none transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-4 py-3 flex items-center gap-3 shrink-0 z-50">
        <button onClick={() => navigate('blood')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#11241C] dark:text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-black text-[#11241C] dark:text-white uppercase tracking-tight flex items-center gap-2">
            Blood Donor Finder
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded font-bold uppercase">Live</span>
          </h1>
          <p className="text-[10px] font-bold text-[#55685F] dark:text-[#A2B3AA] uppercase tracking-wider">Jalpaiguri District • Verified Donors</p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0F172A] border-b border-[#E8E4DA] dark:border-white/10 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveModal('group')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${selectedGroup !== 'All' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}>
            Group: {selectedGroup}
        </button>
        <button onClick={() => setActiveModal('gender')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${selectedGender !== 'All' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}>
            Gender: {selectedGender}
        </button>
        <button onClick={() => setActiveModal('age')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${ageRange[0] !== 18 || ageRange[1] !== 99 ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}>
            Age: {ageRange[0]}-{ageRange[1]}
        </button>
        <button onClick={() => setActiveModal('availability')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${selectedAvailability !== 'All' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}>
            {selectedAvailability === 'All' ? 'Availability' : selectedAvailability}
        </button>
      </div>

      {/* Scrollable Container */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          
          {/* Urgent Alert Banner */}
          <div className="bg-red-600 rounded-3xl p-5 shadow-lg flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wide">Emergency Assistance</h3>
                  <h2 className="text-sm font-black">Need Blood Urgently?</h2>
                  <p className="text-[10px] mt-1 opacity-90">Broadcast critical alert to nearest active donors</p>
              </div>
              <button 
                onClick={() => navigate('create-blood-request')}
                className="px-4 py-2 bg-white text-red-600 rounded-2xl font-black text-xs uppercase"
              >
                Request
              </button>
          </div>

          <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex justify-between items-center">
            <span>Available Donors Nearby ({donors.length})</span>
            <button onClick={clearFilters} className="text-red-600 font-bold">Clear</button>
          </div>
          
          <div className="space-y-4">
            {donors.map((donor) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={donor.id}
                className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm hover:border-red-200 dark:hover:border-red-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-500/20">
                    {donor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                      {donor.name}
                      <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      {donor.gender} • {donor.age} yrs • {donor.approximateArea || 'Area N/A'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5"/> {donor.distanceKm?.toFixed(1) || '0.0'} KM away
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black text-xs border border-red-100 dark:border-red-900/30">
                    {donor.bloodGroup}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                  <span className="truncate">{donor.note || 'Ready to help.'}</span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {donor.availability}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleCall(donor.phone)}
                    className="flex-1 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center gap-1.5 font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                  <button
                    onClick={() => handleWhatsApp(donor.phone, donor.bloodGroup)}
                    className="flex-1 py-2 rounded-xl bg-green-500 text-white flex items-center justify-center gap-1.5 font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Register CTA */}
           <div className="bg-[#11241C] dark:bg-[#0F172A] rounded-3xl p-6 shadow-xl text-white relative overflow-hidden mb-10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Droplet className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Be a hero</div>
                    <h3 className="text-sm font-black mt-1">Save Lives in Jalpaiguri</h3>
                    <p className="text-[10px] mt-2 opacity-80 mb-5">Join 1,200+ local donors who stepped up for medical emergencies.</p>
                    <button 
                        onClick={() => navigate('donor-settings')}
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase"
                    >
                        Register as a Blood Donor →
                    </button>
                </div>
           </div>
        </div>
      </main>
      
      {/* Bottom Sheet Modals */}
      <AnimatePresence>
          {activeModal === 'group' && (
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 bg-white dark:bg-[#0F172A] z-[100] p-6 space-y-6 rounded-t-3xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-[#11241C] dark:text-white">Blood Group</h2>
                    <button onClick={() => setActiveModal(null)} className="text-gray-500 font-bold">Close</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                      {['All', ...BLOOD_GROUPS].map(g => (
                          <button 
                            key={g} 
                            onClick={() => { setSelectedGroup(g as any); setActiveModal(null); }} 
                            className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedGroup === g ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-white/5 text-[#11241C] dark:text-white border-gray-200 dark:border-white/10'}`}
                          >
                              {g}
                          </button>
                      ))}
                  </div>
              </motion.div>
          )}
          {activeModal === 'gender' && (
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 bg-white dark:bg-[#0F172A] z-[100] p-6 space-y-6 rounded-t-3xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-[#11241C] dark:text-white">Gender</h2>
                    <button onClick={() => setActiveModal(null)} className="text-gray-500 font-bold">Close</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      {['All', 'Male', 'Female', 'Other'].map(g => (
                          <button 
                            key={g} 
                            onClick={() => { setSelectedGender(g as any); setActiveModal(null); }} 
                            className={`py-4 rounded-xl border-2 font-bold text-sm transition-all ${selectedGender === g ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-white/5 text-[#11241C] dark:text-white border-gray-200 dark:border-white/10'}`}
                          >
                              {g}
                          </button>
                      ))}
                  </div>
              </motion.div>
          )}
          {activeModal === 'age' && (
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 bg-white dark:bg-[#0F172A] z-[100] p-6 space-y-6 rounded-t-3xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-[#11241C] dark:text-white">Age Range</h2>
                    <button onClick={() => setActiveModal(null)} className="text-gray-500 font-bold">Close</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500">Min Age</label>
                        <input type="number" value={ageRange[0]} onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])} className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500">Max Age</label>
                        <input type="number" value={ageRange[1]} onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])} className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10" />
                      </div>
                  </div>
              </motion.div>
          )}
          {activeModal === 'availability' && (
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 bg-white dark:bg-[#0F172A] z-[100] p-6 space-y-6 rounded-t-3xl">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-[#11241C] dark:text-white">Availability</h2>
                    <button onClick={() => setActiveModal(null)} className="text-gray-500 font-bold">Close</button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                      {['All', 'Available Now', 'Available Today', 'Recently active'].map(a => (
                          <button 
                            key={a} 
                            onClick={() => { setSelectedAvailability(a as any); setActiveModal(null); }} 
                            className={`py-4 px-4 rounded-xl border-2 font-bold text-sm text-left transition-all ${selectedAvailability === a ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-white/5 text-[#11241C] dark:text-white border-gray-200 dark:border-white/10'}`}
                          >
                              {a}
                          </button>
                      ))}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
