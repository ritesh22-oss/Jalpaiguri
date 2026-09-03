import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
  Compass,
  Building,
  Navigation
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { JALPAIGURI_LOCALITIES, LocalityInfo } from '../../data/jalpaiguriLocalities';
import { validateServiceArea } from '../../utils/serviceArea';
import { ReportMiniMap } from './ReportMiniMap';

export interface ReportLocationData {
  formattedAddress: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  accuracy?: number;
  isGps: boolean;
  isInsideJalpaiguri: boolean;
}

interface ReportLocationSectionProps {
  locationData: ReportLocationData;
  onChangeLocation: (data: ReportLocationData) => void;
}

export const ReportLocationSection: React.FC<ReportLocationSectionProps> = ({
  locationData,
  onChangeLocation
}) => {
  const { location, requestCurrentLocation } = useLocation();
  const [isLocating, setIsLocating] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customStreet, setCustomStreet] = useState('');

  const handleUseGps = async () => {
    setIsLocating(true);
    try {
      const res = await requestCurrentLocation();
      if (res.success && res.location) {
        const lat = res.location.lat;
        const lng = res.location.lng;
        const check = validateServiceArea(lat, lng);
        const roadOrLocality = res.location.road ? `${res.location.road}, ${res.location.locality}` : res.location.name;

        onChangeLocation({
          formattedAddress: roadOrLocality || `${res.location.name}, Jalpaiguri`,
          locality: res.locality || res.location.locality || res.location.name || 'Jalpaiguri',
          city: res.location.city || 'Jalpaiguri',
          district: res.location.district || 'Jalpaiguri',
          state: res.location.state || 'West Bengal',
          lat,
          lng,
          accuracy: res.location.accuracy ? Math.round(res.location.accuracy) : undefined,
          isGps: true,
          isInsideJalpaiguri: check.isInside
        });
      } else {
        alert(res.error || 'Could not retrieve GPS location. Please ensure location permissions are granted.');
      }
    } catch (e) {
      alert('Failed to detect GPS location. Please select your locality manually.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectLocality = (item: LocalityInfo) => {
    const check = validateServiceArea(item.lat, item.lng);
    const street = customStreet.trim() ? `${customStreet.trim()}, ` : '';
    const fullAddress = `${street}${item.name}, Jalpaiguri, WB - ${item.pincode}`;

    onChangeLocation({
      formattedAddress: fullAddress,
      locality: item.name,
      city: 'Jalpaiguri',
      district: 'Jalpaiguri',
      state: 'West Bengal',
      lat: item.lat,
      lng: item.lng,
      accuracy: undefined,
      isGps: false,
      isInsideJalpaiguri: check.isInside
    });
    setIsPickerOpen(false);
    setSearchQuery('');
  };

  const filteredLocalities = JALPAIGURI_LOCALITIES.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.popularLandmarks.some((lm) => lm.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold uppercase tracking-wider text-[#11241C] dark:text-white flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#063B2C] dark:bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">3</span>
          Problem Location <span className="text-rose-500">*</span>
        </label>
        <span className="text-[10px] font-bold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
          Jalpaiguri Wards 1-25
        </span>
      </div>

      {/* Main Location Card */}
      <div className="bg-white dark:bg-[#16241F] border border-[#E4DFD3] dark:border-white/10 rounded-2xl p-4 transition-colors space-y-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800/30 text-[#063B2C] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 stroke-[2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-extrabold text-[#11241C] dark:text-white truncate">
                {locationData.locality || 'Select Location'}
              </h4>
              {locationData.isInsideJalpaiguri ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> In Service Area
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Outside Jalpaiguri
                </span>
              )}
            </div>

            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-1 leading-relaxed line-clamp-2">
              {locationData.formattedAddress || 'No location specified'}
            </p>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-[#8C9B93] dark:text-[#A2B3AA]">
              <span>Coords: {locationData.lat.toFixed(4)}, {locationData.lng.toFixed(4)}</span>
              {locationData.accuracy && (
                <span>GPS Accuracy: ±{locationData.accuracy}m</span>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Mini-Map for Pinpointing Exact Issue Location */}
        <div className="pt-2 border-t border-[#F2EFE8] dark:border-white/5">
          <ReportMiniMap
            currentLat={locationData.lat}
            currentLng={locationData.lng}
            currentLocality={locationData.locality}
            isLocating={isLocating}
            onRequestGps={handleUseGps}
            onPositionChange={(pos) => {
              onChangeLocation({
                formattedAddress: pos.formattedAddress,
                locality: pos.locality,
                city: 'Jalpaiguri',
                district: 'Jalpaiguri',
                state: 'West Bengal',
                lat: pos.lat,
                lng: pos.lng,
                accuracy: undefined,
                isGps: false,
                isInsideJalpaiguri: pos.isInsideJalpaiguri
              });
            }}
          />
        </div>

        {/* Action Buttons: GPS vs Change */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F2EFE8] dark:border-white/5">
          <button
            type="button"
            id="btn-use-gps"
            onClick={handleUseGps}
            disabled={isLocating}
            className="py-2.5 px-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121E19] hover:bg-[#F2EFE8] dark:hover:bg-[#1B2C24] border border-[#E4DFD3] dark:border-white/10 text-[#11241C] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#063B2C] dark:text-emerald-400" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
            )}
            <span>{isLocating ? 'Detecting...' : 'Use Current GPS'}</span>
          </button>

          <button
            type="button"
            id="btn-change-location"
            onClick={() => setIsPickerOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-[#063B2C]/5 dark:bg-emerald-950/40 hover:bg-[#063B2C]/10 dark:hover:bg-emerald-900/40 border border-[#063B2C]/20 dark:border-emerald-700/40 text-[#063B2C] dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Building className="w-3.5 h-3.5" />
            <span>Select Locality</span>
          </button>
        </div>

        {/* Out of Area Warning Banner */}
        {!locationData.isInsideJalpaiguri && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-2 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-950 dark:text-amber-200">
                  Civic reporting is currently available only in Jalpaiguri.
                </p>
                <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  The detected coordinates are outside the official municipal boundary. If you are reporting a problem that occurred in Jalpaiguri, please select the exact Jalpaiguri ward or locality below.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="w-full py-2 bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition-colors"
            >
              Choose Jalpaiguri Ward / Landmark
            </button>
          </div>
        )}
      </div>

      {/* Locality Selector Modal */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#16241F] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#E4DFD3] dark:border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#E4DFD3] dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#11241C] dark:text-white">
                  Select Jalpaiguri Location
                </h3>
                <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                  Official wards, landmarks, and localities
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#121E19] text-[#11241C] dark:text-white flex items-center justify-center hover:bg-[#F2EFE8] dark:hover:bg-[#1B2C24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Optional Specific Street or Landmark input */}
            <div className="p-4 border-b border-[#E4DFD3] dark:border-white/10 space-y-3 bg-[#FAF8F5] dark:bg-[#121E19]">
              <div>
                <label className="text-[11px] font-bold text-[#11241C] dark:text-white block mb-1">
                  Street / House / Pole Details (Optional)
                </label>
                <input
                  type="text"
                  value={customStreet}
                  onChange={(e) => setCustomStreet(e.target.value)}
                  placeholder="e.g. Near Girls High School, Ward 12, Club Road"
                  className="w-full px-3 py-2 bg-white dark:bg-[#16241F] border border-[#D2CEBE] dark:border-white/10 rounded-xl text-xs font-medium text-[#11241C] dark:text-white placeholder:text-[#8C9B93] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
                />
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C9B93]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search locality (Kadamtala, Dinbazar, Pandapara...)"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#16241F] border border-[#D2CEBE] dark:border-white/10 rounded-xl text-xs font-medium text-[#11241C] dark:text-white placeholder:text-[#8C9B93] focus:outline-none focus:border-[#063B2C] dark:focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Localities list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 divide-y divide-[#F2EFE8] dark:divide-white/5">
              {filteredLocalities.map((item) => {
                const isCurrent = locationData.locality === item.name;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectLocality(item)}
                    className={`w-full text-left py-3 px-3 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#E6F4EA] dark:bg-emerald-950/50 text-[#063B2C] dark:text-emerald-400'
                        : 'hover:bg-[#FAF8F5] dark:hover:bg-[#1A2A22] text-[#11241C] dark:text-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#121E19] border border-[#E4DFD3] dark:border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#063B2C] dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{item.name}</span>
                        <span className="text-[10px] font-mono opacity-70">PIN {item.pincode}</span>
                      </div>
                      <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA] mt-0.5 truncate">
                        {item.popularLandmarks.join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredLocalities.length === 0 && (
                <div className="py-8 text-center text-xs text-[#55685F] dark:text-[#A2B3AA]">
                  No matching localities found in Jalpaiguri.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
