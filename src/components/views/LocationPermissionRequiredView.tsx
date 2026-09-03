import React, { useState } from 'react';
import {
  MapPinOff,
  RefreshCw,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useSafety } from '../../context/SafetyContext';
import { ViewType } from '../../types';

interface LocationPermissionRequiredViewProps {
  onNavigate: (view: ViewType) => void;
}

export const LocationPermissionRequiredView: React.FC<LocationPermissionRequiredViewProps> = ({ onNavigate }) => {
  const {
    requestCurrentLocation,
    status,
    errorMessage,
    setSimulatedLocation
  } = useLocation();

  const { call112 } = useSafety();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDevControls, setShowDevControls] = useState(false);

  const handleAllowAndRetry = async () => {
    setIsRetrying(true);
    await requestCurrentLocation();
    setIsRetrying(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] text-[#11241C] dark:text-white flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto select-none transition-colors">
      {/* Header */}
      <div className="pt-4 sm:pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white flex items-center justify-center font-black text-base">
              JC
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#11241C] dark:text-white tracking-tight">
                Jalpaiguri Connect
              </h1>
              <p className="text-xs font-semibold text-[#667085] dark:text-[#A2B3AA]">
                Verification Required
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('safety-sos')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0F0] dark:bg-red-950/50 border border-[#FECDCA] dark:border-red-800/40 text-[#D92D20] dark:text-red-400 text-xs font-bold rounded-full hover:bg-[#FEE4E2] dark:hover:bg-red-900/50 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#D92D20] dark:text-red-400" />
            <span>SOS Hub</span>
          </button>
        </div>

        {/* Permission Request Card */}
        <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6 text-center mt-4 transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-[#FEF3F2] dark:bg-red-950/60 border border-[#FECDCA] dark:border-red-800/40 text-[#B42318] dark:text-red-400 mx-auto flex items-center justify-center shadow-xs">
            <MapPinOff className="w-8 h-8 text-[#B42318] dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3F2] dark:bg-red-950/60 text-[#B42318] dark:text-red-400 border border-[#FECDCA] dark:border-red-800/40">
              <Lock className="w-3 h-3 text-[#B42318] dark:text-red-400" />
              Location Access Required
            </span>
            <h2 className="text-xl font-extrabold text-[#11241C] dark:text-white tracking-tight pt-1">
              Location permission is required to verify whether Jalpaiguri Connect is available in your area.
            </h2>
            <p className="text-sm font-medium text-[#55685F] dark:text-[#A2B3AA] max-w-sm mx-auto leading-relaxed">
              Jalpaiguri Connect is strictly configured for users in the Jalpaiguri service area. Real device GPS is used to verify geographic eligibility.
            </p>
          </div>

          {/* How to Enable instructions */}
          <div className="bg-[#FAF8F5] dark:bg-[#121E19] border border-[#E5E1D5] dark:border-white/10 rounded-2xl p-4 text-left space-y-2.5 transition-colors">
            <p className="text-xs font-bold text-[#11241C] dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#063B2C] dark:text-emerald-400" />
              How to enable location in your browser:
            </p>
            <ul className="text-xs text-[#55685F] dark:text-[#A2B3AA] space-y-1.5 list-disc pl-4 font-medium">
              <li>Tap the <strong className="text-[#11241C] dark:text-white">tune / lock icon</strong> next to the address bar above.</li>
              <li>Toggle <strong className="text-[#11241C] dark:text-white">Location</strong> to <strong className="text-[#063B2C] dark:text-emerald-400">Allow</strong>.</li>
              <li>Tap <strong className="text-[#11241C] dark:text-white">Try Again</strong> below.</li>
            </ul>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FEF3F2] dark:bg-red-950/60 border border-[#FEE4E2] dark:border-red-800/40 text-left">
              <AlertTriangle className="w-4 h-4 text-[#D92D20] dark:text-red-400 shrink-0" />
              <p className="text-xs font-semibold text-[#D92D20] dark:text-red-400">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAllowAndRetry}
              disabled={isRetrying}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all disabled:opacity-70 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Checking GPS Signal...' : 'Allow Location & Try Again'}</span>
            </button>

            <button
              onClick={call112}
              className="w-full py-3 px-4 rounded-2xl bg-[#FFF0F0] dark:bg-red-950/50 border border-[#FECDCA] dark:border-red-800/40 text-[#D92D20] dark:text-red-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#FEE4E2] dark:hover:bg-red-900/50 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#D92D20] dark:text-red-400" />
              <span>Call 112 (National Emergency Services)</span>
            </button>
          </div>
        </div>

        {/* Resources card */}
        <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#11241C] dark:text-white">Safety and Emergency Resources</span>
            <button
              onClick={() => onNavigate('sexual-violence-support')}
              className="text-xs font-bold text-[#063B2C] dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View Helplines</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
            Official national emergency numbers (112, 1091, 1098, 181) operate 24/7 independently of local area service availability.
          </p>
        </div>
      </div>

      {/* Developer testing toggle */}
      <div className="py-6 text-center space-y-3">
        <button
          onClick={() => setShowDevControls(prev => !prev)}
          className="text-xs font-semibold text-[#8C9B93] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white transition-colors cursor-pointer"
        >
          {showDevControls ? 'Hide Developer Test Controls ▲' : 'Developer / Testing Controls ▼'}
        </button>

        {showDevControls && (
          <div className="bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl p-4 text-left space-y-3 text-xs transition-colors">
            <p className="font-bold text-[#11241C] dark:text-white">Simulate Location for Testing:</p>
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
            </div>
            <button
              onClick={() => setSimulatedLocation('RESET')}
              className="w-full py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 font-bold text-[#55685F] dark:text-[#A2B3AA] text-center hover:bg-[#F3F0E6] cursor-pointer"
            >
              Retry Real Device GPS
            </button>
          </div>
        )}

        <p className="text-[11px] font-semibold text-[#8C9B93] dark:text-[#A2B3AA]">
          Jalpaiguri Connect • GPS-Verified Civic Protection
        </p>
      </div>
    </div>
  );
};
