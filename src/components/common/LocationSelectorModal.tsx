import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Check,
  AlertCircle,
  Clock,
  Compass,
  Building2,
  Home,
  Heart,
  Train,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Activity,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { LocalityInfo } from '../../data/jalpaiguriLocalities';

export const LocationSelectorModal: React.FC = () => {
  const {
    location,
    status,
    errorMessage,
    isLocationSelectorOpen,
    setIsLocationSelectorOpen,
    isLiveTracking,
    startLiveTracking,
    stopLiveTracking,
    requestCurrentLocation,
    setManualLocation,
    localities,
    isWithinServiceRegion,
    distanceToServiceRegionKm
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'jalpaiguri' | 'major-cities'>('jalpaiguri');

  if (!isLocationSelectorOpen) return null;

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    await requestCurrentLocation();
    setIsDetecting(false);
  };

  const toggleLiveTracking = () => {
    if (isLiveTracking) {
      stopLiveTracking();
    } else {
      startLiveTracking();
    }
  };

  const filteredLocalities = localities.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.popularLandmarks.some((lm) => lm.toLowerCase().includes(searchQuery.toLowerCase())) ||
      loc.pincode.includes(searchQuery)
  );

  const majorCities = [
    { name: 'Chennai, Tamil Nadu', locality: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Bengaluru, Karnataka', locality: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Kolkata, West Bengal', locality: 'Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Siliguri, West Bengal', locality: 'Siliguri', city: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953 },
    { name: 'Delhi / NCR', locality: 'New Delhi', city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai, Maharashtra', locality: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 }
  ];

  const getLocalityIcon = (type: LocalityInfo['type']) => {
    switch (type) {
      case 'commercial':
        return <Building2 className="w-4 h-4 text-emerald-700" />;
      case 'residential':
        return <Home className="w-4 h-4 text-amber-700" />;
      case 'healthcare':
        return <Heart className="w-4 h-4 text-rose-600" />;
      case 'transport':
        return <Train className="w-4 h-4 text-blue-600" />;
      case 'civic':
        return <Compass className="w-4 h-4 text-purple-600" />;
      default:
        return <MapPin className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-[#E8E4DA] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-[#E8E4DA] bg-white rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#11241C] tracking-tight">
                Select Your Location
              </h2>
              <p className="text-xs text-[#55685F]">
                Used for real-time proximity & civic services
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationSelectorOpen(false)}
            className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-[#F0ECE1] flex items-center justify-center text-[#55685F] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Step 1: Detect Real Device Location Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E4DA] shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#55685F] block mb-0.5">
                  Current Active Location
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <p className="text-sm font-extrabold text-[#11241C] truncate max-w-[220px]">
                    {location.name}
                  </p>
                </div>
                {location.lat && location.lng && (
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    Coordinates: {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                  </p>
                )}
              </div>

              {location.locationSource === 'gps' ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Real GPS
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Manual Area
                </span>
              )}
            </div>

            {/* GPS Accuracy Details if Available */}
            {location.accuracy && (
              <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GPS Precision: ±{location.accuracy}m</span>
                </div>
                {location.city && (
                  <span className="font-semibold text-emerald-900">{location.city}</span>
                )}
              </div>
            )}

            {/* Regional Status Indicator */}
            {!isWithinServiceRegion && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold">Detected Outside Jalpaiguri District:</span>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    You are currently {Math.round(distanceToServiceRegionKm).toLocaleString()} km from Jalpaiguri. Nearby distances will reflect your real GPS position, while civic municipal portals remain available remotely.
                  </p>
                </div>
              </div>
            )}

            {/* Primary Action Button: "Use Current Location" */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isDetecting}
                className="w-full bg-[#063B2C] text-white hover:bg-[#084D3A] active:scale-[0.99] transition-all py-3 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-75"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting your location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-emerald-300" />
                    <span>📍 Use Current Location</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleLiveTracking}
                className={`w-full py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isLiveTracking
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Activity className={`w-4 h-4 ${isLiveTracking ? 'animate-pulse text-white' : 'text-gray-500'}`} />
                <span>{isLiveTracking ? 'Live Tracking ON' : 'Start Live GPS'}</span>
              </button>
            </div>

            {/* Permission Denied State */}
            {status === 'permission_denied' && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Location permission is turned off</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-snug">
                  Please enable location access in your browser or device settings to use real-time GPS. You can also pick any locality manually below.
                </p>
              </div>
            )}

            {/* Timeout or Error State */}
            {(status === 'timeout' || status === 'unavailable' || status === 'error') && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Couldn't detect your location</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  {errorMessage || 'Signal timed out. Please tap Try Again or choose a location manually.'}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleUseCurrentLocation}
                    className="px-3 py-1 bg-amber-200 text-amber-900 font-bold rounded-lg text-xs hover:bg-amber-300 cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setActiveTab('jalpaiguri')}
                    className="px-3 py-1 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Choose Manually
                  </button>
                </div>
              </div>
            )}

            {/* Success Detected Feedback */}
            {status === 'found' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Location detected: {location.name}</span>
                </div>
                <button
                  onClick={() => setIsLocationSelectorOpen(false)}
                  className="px-2.5 py-1 bg-[#063B2C] text-white font-extrabold text-[10px] rounded-lg cursor-pointer"
                >
                  Use This Location
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Manual Location Selection Option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#55685F]">
                Or Choose Location Manually
              </span>
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E8E4DA]">
                <button
                  onClick={() => setActiveTab('jalpaiguri')}
                  className={`px-2 py-0.5 text-[11px] font-extrabold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'jalpaiguri' ? 'bg-[#063B2C] text-white' : 'text-[#55685F]'
                  }`}
                >
                  Jalpaiguri
                </button>
                <button
                  onClick={() => setActiveTab('major-cities')}
                  className={`px-2 py-0.5 text-[11px] font-extrabold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'major-cities' ? 'bg-[#063B2C] text-white' : 'text-[#55685F]'
                  }`}
                >
                  Other Cities
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#55685F] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder={activeTab === 'jalpaiguri' ? 'Search Kadamtala, Dinbazar, Hospital Road...' : 'Search Chennai, Bengaluru, Kolkata...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#D2CEBE] rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-[#11241C] placeholder:text-[#8C9B93] focus:border-[#063B2C] focus:outline-none shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-[#55685F] hover:text-[#11241C]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List Selection */}
            {activeTab === 'jalpaiguri' ? (
              <div className="bg-white rounded-2xl border border-[#E8E4DA] divide-y divide-[#F0ECE1] overflow-hidden shadow-xs max-h-56 overflow-y-auto">
                {filteredLocalities.map((loc) => {
                  const isSelected = location.locality === loc.shortName;

                  return (
                    <div
                      key={loc.id}
                      onClick={() => setManualLocation(loc)}
                      className={`p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#E6F4EA]/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] flex items-center justify-center border border-[#E8E4DA]">
                          {getLocalityIcon(loc.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-extrabold text-[#11241C]">
                              {loc.name}
                            </h4>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#063B2C] text-white">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#55685F] line-clamp-1">
                            {loc.popularLandmarks.join(' • ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#55685F]">
                        <span className="text-[11px] font-bold text-[#063B2C] bg-[#E6F4EA] px-2 py-0.5 rounded-full">
                          {loc.pincode}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
                      </div>
                    </div>
                  );
                })}

                {filteredLocalities.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#55685F]">
                    <p className="font-bold text-[#11241C]">No matching Jalpaiguri locality found</p>
                    <p className="mt-1 text-[11px]">
                      Try Kadamtala, Dinbazar, Hakimpara, or Mohitnagar.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8E4DA] divide-y divide-[#F0ECE1] overflow-hidden shadow-xs">
                {majorCities
                  .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((city) => (
                    <div
                      key={city.name}
                      onClick={() => setManualLocation(city)}
                      className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          📍
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#11241C]">
                            {city.name}
                          </h4>
                          <p className="text-[10px] text-gray-500">
                            Coordinates: {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
