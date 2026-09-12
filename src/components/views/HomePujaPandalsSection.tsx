import React from 'react';
import {
  Compass,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Flame,
  Award
} from 'lucide-react';
import { DurgaPandalItem, UserLocation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { calculateHaversineDistance } from '../../utils/serviceArea';

interface HomePujaPandalsSectionProps {
  pandals: DurgaPandalItem[];
  userLocation: UserLocation;
  onSelectPandal: (pandal: DurgaPandalItem) => void;
  onNavigateToAll: () => void;
}

export const HomePujaPandalsSection: React.FC<HomePujaPandalsSectionProps> = ({
  pandals,
  userLocation,
  onSelectPandal,
  onNavigateToAll
}) => {
  const { isBengali } = useLanguage();

  // Filter only verified current season pandals or fallback to available pandals
  const activePandals = pandals.filter(p => p.verificationStatus === 'verified' && p.isCurrentSeason !== false);
  const displayList = activePandals.length > 0 ? activePandals : pandals;

  // Calculate real distance and sort by location distance + popularity score
  const sortedPandals = [...displayList].map(pandal => {
    const distKm = calculateHaversineDistance(
      userLocation.lat,
      userLocation.lng,
      pandal.lat,
      pandal.lng
    );
    return {
      ...pandal,
      distanceKm: distKm
    };
  }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  // Top 4 pandals for horizontal home card section
  const top4Pandals = sortedPandals.slice(0, 4);

  return (
    <section className="space-y-3 py-1.5 px-0.5">
      {/* Festive Background Container */}
      <div className="bg-gradient-to-r from-amber-500/10 via-red-500/5 to-blue-600/10 dark:from-amber-500/15 dark:via-red-950/20 dark:to-blue-950/30 rounded-3xl p-3.5 sm:p-4 border border-amber-500/25 dark:border-amber-500/30 shadow-xs relative overflow-hidden">
        
        {/* Subtle festive ambient warmth glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center justify-between relative z-10 mb-3">
          <div className="flex items-center gap-3">
            {/* Direct Transparent Durga Ma PNG Icon (No background or container box) */}
            <img
              src="/durga-ma-icon.png"
              alt="Durga Ma"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 drop-shadow-md transition-transform hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300/60 dark:border-amber-800/60">
                  {isBengali ? '🪔 শারদোৎসব ২০২৬' : '🪔 Sharadotsav 2026'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight mt-0.5">
                {isBengali ? 'সেরা দুর্গোৎসব মণ্ডপসমূহ' : 'Top Durga Puja Pandals'}
              </h2>
            </div>
          </div>

          <button
            onClick={onNavigateToAll}
            className="text-xs font-bold text-[#007AFF] hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-0.5 bg-white/80 dark:bg-blue-950/70 px-3 py-1.5 rounded-full border border-blue-200/80 dark:border-blue-900/50 shadow-xs transition-all cursor-pointer hover:shadow-sm active:scale-95"
          >
            <span>{isBengali ? 'সব দেখুন' : 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Side-Scrolling Pandal Cards */}
        <div className="flex gap-3 overflow-x-auto pb-1 pt-1 no-scrollbar -mx-3 px-3 scroll-smooth relative z-10">
          {top4Pandals.map((pandal) => {
            const formattedDist = (pandal.distanceKm || 0) < 1 
              ? `${Math.round((pandal.distanceKm || 0) * 1000)} m` 
              : `${(pandal.distanceKm || 0).toFixed(1)} km`;

            return (
              <div
                key={pandal.id}
                onClick={() => onSelectPandal(pandal)}
                className="shrink-0 w-64 sm:w-72 bg-white dark:bg-[#0F172A] rounded-2xl border border-amber-200/60 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-amber-400/80 transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col active:scale-98"
              >
                {/* Card Image Header */}
                <div className="relative h-36 sm:h-40 overflow-hidden bg-gray-900">
                  <img
                    src={pandal.primaryPhoto}
                    alt={pandal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Badge Top Left */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    {pandal.badge && (
                      <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                        {pandal.badge}
                      </span>
                    )}
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                      {pandal.category}
                    </span>
                  </div>

                  {/* Distance Badge Top Right */}
                  <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20 shadow-sm">
                    <Compass className="w-3 h-3 text-amber-400" />
                    <span>{formattedDist}</span>
                  </div>

                  {/* Verified Icon & Pandal Locality at bottom of image */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-white text-xs font-bold">
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px]">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span className="truncate max-w-[140px]">{pandal.locality}</span>
                    </div>
                    {pandal.verificationStatus === 'verified' && (
                      <span className="flex items-center gap-1 bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        <ShieldCheck className="w-3 h-3 text-blue-200" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#007AFF] transition-colors">
                      {isBengali ? (pandal.nameBn || pandal.name) : pandal.name}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                      {isBengali ? (pandal.committeeBn || pandal.committee) : pandal.committee}
                    </p>
                  </div>

                  {/* Theme snippet if available */}
                  {pandal.themeName && (
                    <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/30 text-[11px] text-gray-800 dark:text-gray-200 line-clamp-1 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="truncate">"{pandal.themeName}"</span>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="pt-1.5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 text-[11px]">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      {pandal.locality}
                    </span>
                    <span className="font-bold text-[#007AFF] dark:text-blue-400 flex items-center gap-0.5">
                      <span>{isBengali ? 'দিকনির্দেশ ও বিস্তারিত' : 'View & Route'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
