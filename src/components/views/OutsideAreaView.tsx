import React, { useState } from 'react';
import {
  MapPin,
  RefreshCw,
  Phone,
  ShieldAlert,
  Info,
  ChevronRight,
  ExternalLink,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useSafety } from '../../context/SafetyContext';
import { ViewType } from '../../types';

interface OutsideAreaViewProps {
  onNavigate: (view: ViewType) => void;
}

export const OutsideAreaView: React.FC<OutsideAreaViewProps> = ({ onNavigate }) => {
  const {
    location,
    requestCurrentLocation,
    status,
    errorMessage,
    serviceAreaValidation,
    serviceAreaMode,
    setServiceAreaMode,
    setSimulatedLocation
  } = useLocation();

  const { call112 } = useSafety();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDevControls, setShowDevControls] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await requestCurrentLocation();
    setIsRefreshing(false);
  };

  const detectedCity = location?.city || location?.locality || 'Unknown City';
  const detectedState = location?.state || location?.country || 'Detected Region';
  const distanceText = serviceAreaValidation?.centerDistanceKm
    ? `${serviceAreaValidation.centerDistanceKm} km from Jalpaiguri`
    : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] text-[#11241C] dark:text-white flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto select-none transition-colors">
      {/* Top Header */}
      <div className="pt-4 sm:pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white flex items-center justify-center shadow-xs font-black text-base">
              JC
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#11241C] dark:text-white tracking-tight">
                Jalpaiguri Connect
              </h1>
              <p className="text-xs font-semibold text-[#667085] dark:text-[#A2B3AA]">
                Civic & Community Platform
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('safety-sos')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0F0] dark:bg-red-950/50 border border-[#FECDCA] dark:border-red-800/40 text-[#D92D20] dark:text-red-400 text-xs font-bold rounded-full hover:bg-[#FEE4E2] dark:hover:bg-red-900/50 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#D92D20] dark:text-red-400" />
            <span>SOS Hub</span>
          </button>
        </div>

        {/* Primary Restriction Card */}
        <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6 text-center mt-4 transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-[#FEF3F2] dark:bg-red-950/60 border border-[#FEE4E2] dark:border-red-800/40 text-[#D92D20] dark:text-red-400 mx-auto flex items-center justify-center shadow-xs">
            <MapPin className="w-8 h-8 text-[#D92D20] dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3F2] dark:bg-red-950/60 text-[#B42318] dark:text-red-400 border border-[#FECDCA] dark:border-red-800/40">
              Service Area Restricted
            </span>
            <h2 className="text-xl font-extrabold text-[#11241C] dark:text-white tracking-tight pt-1">
              Jalpaiguri Connect is currently available only in the Jalpaiguri service area.
            </h2>
            <p className="text-sm font-medium text-[#55685F] dark:text-[#A2B3AA] max-w-sm mx-auto leading-relaxed">
              Jalpaiguri Connect is a localized municipal platform built specifically for residents, workers, and civic services within Jalpaiguri.
            </p>
          </div>

          {/* Detected Location Box */}
          <div className="bg-[#FAF8F5] dark:bg-[#121E19] border border-[#E5E1D5] dark:border-white/10 rounded-2xl p-4 text-left space-y-2 transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#73827A] dark:text-[#A2B3AA]">
              Your current location appears to be:
            </p>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-extrabold text-[#11241C] dark:text-white">
                  {detectedCity}
                </p>
                <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA]">
                  {detectedState} {distanceText && `• ${distanceText}`}
                </p>
                {location?.lat && location?.lng && (
                  <p className="text-[11px] font-mono text-[#8C9B93] dark:text-[#A2B3AA] mt-1">
                    GPS: {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E (±{location.accuracy || 20}m)
                  </p>
                )}
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#F2F4F7] dark:bg-white/10 text-[#475467] dark:text-[#A2B3AA]">
                Outside Coverage
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold text-[#8C9B93] dark:text-[#A2B3AA]">
            We're not available in your current location yet.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || status === 'detecting'}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all disabled:opacity-70 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking Real GPS...' : 'Check My Location Again'}</span>
            </button>

            <button
              onClick={call112}
              className="w-full py-3 px-4 rounded-2xl bg-[#FFF0F0] dark:bg-red-950/50 border border-[#FECDCA] dark:border-red-800/40 text-[#D92D20] dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FEE4E2] dark:hover:bg-red-900/50 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#D92D20] dark:text-red-400" />
              <span>National Emergency 112 (Available Nationwide)</span>
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs font-semibold text-[#D92D20] dark:text-red-400 bg-[#FEF3F2] dark:bg-red-950/60 p-2.5 rounded-xl border border-transparent dark:border-red-800/40">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Informative Guidance Card */}
        <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold text-[#11241C] dark:text-white">
            <Info className="w-4 h-4 text-[#063B2C] dark:text-emerald-400" />
            <span>Why is access restricted?</span>
          </div>
          <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
            To prevent misleading emergency response, phantom civic reporting, or inaccurate nearby service dispatch, Jalpaiguri Connect verifies your real device coordinates against the official municipal boundary.
          </p>
          <div className="pt-1 flex items-center justify-between text-xs font-bold text-[#063B2C] dark:text-emerald-400">
            <button
              onClick={() => onNavigate('sexual-violence-support')}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Emergency & Safety Resources</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Developer / Testing Switcher Toggle */}
      <div className="py-6 text-center space-y-3">
        <button
          onClick={() => setShowDevControls(prev => !prev)}
          className="text-xs font-semibold text-[#8C9B93] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white transition-colors cursor-pointer"
        >
          {showDevControls ? 'Hide Developer Test Controls ▲' : 'Developer / Testing Controls ▼'}
        </button>

        {showDevControls && (
          <div className="bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl p-4 text-left space-y-3 text-xs transition-colors">
            <div className="flex items-center justify-between border-b border-[#E8E4DA] dark:border-white/10 pb-2">
              <span className="font-bold text-[#11241C] dark:text-white">Coverage Mode:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setServiceAreaMode('JALPAIGURI_CITY')}
                  className={`px-2 py-1 rounded-md font-bold cursor-pointer ${serviceAreaMode === 'JALPAIGURI_CITY' ? 'bg-[#063B2C] dark:bg-emerald-600 text-white' : 'bg-[#F2F4F7] dark:bg-white/10 text-[#475467] dark:text-[#A2B3AA]'}`}
                >
                  City (Wards 1-25)
                </button>
                <button
                  onClick={() => setServiceAreaMode('JALPAIGURI_DISTRICT')}
                  className={`px-2 py-1 rounded-md font-bold cursor-pointer ${serviceAreaMode === 'JALPAIGURI_DISTRICT' ? 'bg-[#063B2C] dark:bg-emerald-600 text-white' : 'bg-[#F2F4F7] dark:bg-white/10 text-[#475467] dark:text-[#A2B3AA]'}`}
                >
                  District
                </button>
              </div>
            </div>

            <div>
              <p className="font-bold text-[#11241C] dark:text-white mb-1.5">Simulate Coordinates for Testing:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSimulatedLocation('JALPAIGURI')}
                  className="p-2 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 text-[#063B2C] dark:text-emerald-300 font-bold text-center hover:bg-[#CEEAD6] cursor-pointer"
                >
                  ✓ Jalpaiguri (Inside)
                </button>
                <button
                  onClick={() => setSimulatedLocation('CHENNAI')}
                  className="p-2 rounded-xl bg-[#FEF3F2] dark:bg-red-950/60 border border-transparent dark:border-red-800/40 text-[#D92D20] dark:text-red-400 font-bold text-center hover:bg-[#FEE4E2] cursor-pointer"
                >
                  ✕ Chennai (Outside)
                </button>
                <button
                  onClick={() => setSimulatedLocation('KOLKATA')}
                  className="p-2 rounded-xl bg-[#FEF3F2] dark:bg-red-950/60 border border-transparent dark:border-red-800/40 text-[#D92D20] dark:text-red-400 font-bold text-center hover:bg-[#FEE4E2] cursor-pointer"
                >
                  ✕ Kolkata (Outside)
                </button>
                <button
                  onClick={() => setSimulatedLocation('SILIGURI')}
                  className="p-2 rounded-xl bg-[#FEF3F2] dark:bg-red-950/60 border border-transparent dark:border-red-800/40 text-[#D92D20] dark:text-red-400 font-bold text-center hover:bg-[#FEE4E2] cursor-pointer"
                >
                  ✕ Siliguri (Outside)
                </button>
              </div>
            </div>

            <button
              onClick={() => setSimulatedLocation('RESET')}
              className="w-full py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 font-bold text-[#55685F] dark:text-[#A2B3AA] text-center hover:bg-[#F3F0E6] cursor-pointer"
            >
              Reset to Real Device GPS
            </button>
          </div>
        )}

        <p className="text-[11px] font-semibold text-[#8C9B93] dark:text-[#A2B3AA]">
          Jalpaiguri Connect • Official Municipal Service Area Protection
        </p>
      </div>
    </div>
  );
};
