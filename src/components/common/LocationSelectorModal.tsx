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
  Loader2
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
    requestCurrentLocation,
    setManualLocation,
    localities
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isLocationSelectorOpen) return null;

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    const res = await requestCurrentLocation();
    setIsDetecting(false);
    if (res.success) {
      setTimeout(() => {
        setIsLocationSelectorOpen(false);
      }, 500);
    }
  };

  const filteredLocalities = localities.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.popularLandmarks.some((lm) => lm.toLowerCase().includes(searchQuery.toLowerCase())) ||
      loc.pincode.includes(searchQuery)
  );

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
        className="w-full max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E8E4DA] animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                Find workers, doctors & services near you
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Current Location Action Banner */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E4DA] shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#55685F] block mb-0.5">
                  Your Selected Location
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <p className="text-sm font-extrabold text-[#11241C] truncate max-w-[240px]">
                    {location.name}
                  </p>
                </div>
              </div>

              {location.isApproximate ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Manual Area
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  GPS Detected
                </span>
              )}
            </div>

            {/* Use Current GPS Location Button */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isDetecting}
              className="w-full bg-[#063B2C] text-white hover:bg-[#084D3A] active:scale-[0.99] transition-all py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-75"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Detecting GPS Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-emerald-300" />
                  <span>Use Current GPS Location</span>
                </>
              )}
            </button>

            {/* Error or Notice State */}
            {status === 'permission_denied' && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Location Permission Denied:</span>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Please allow location in browser settings or choose your locality from the list below.
                  </p>
                </div>
              </div>
            )}

            {status === 'timeout' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px]">GPS signal took too long. Select your locality from the list below.</p>
              </div>
            )}

            {status === 'found' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-xs text-emerald-800 flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>GPS Location synced successfully!</span>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#55685F] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search Kadamtala, Dinbazar, Hospital Road..."
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

          {/* Localities List */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#55685F] px-1 block">
              Jalpaiguri Localities & Wards ({filteredLocalities.length})
            </span>

            <div className="bg-white rounded-2xl border border-[#E8E4DA] divide-y divide-[#F0ECE1] overflow-hidden shadow-xs">
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
                  <p className="font-bold text-[#11241C]">No matching locality found</p>
                  <p className="mt-1 text-[11px]">
                    Try typing Kadamtala, Dinbazar, Hakimpara, or Hospital Road.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
