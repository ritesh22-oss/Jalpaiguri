import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  ExternalLink,
  Navigation,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { ExplorePlaceItem } from '../../types';
import { resolvePlaceImage, ResolvedPlaceImage } from '../../utils/placesPhotoClient';
import { getCategoryIllustrationUri } from '../../utils/placeCategoryIllustrations';

interface ExplorePlaceCardProps {
  place: ExplorePlaceItem;
  onSelect: (place: ExplorePlaceItem) => void;
  onAskAI: (place: ExplorePlaceItem) => void;
}

export const ExplorePlaceCard: React.FC<ExplorePlaceCardProps> = ({
  place,
  onSelect,
  onAskAI
}) => {
  const [resolvedImage, setResolvedImage] = useState<ResolvedPlaceImage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedPlaceId, setCopiedPlaceId] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    resolvePlaceImage(place, 600, 360)
      .then((res) => {
        if (!isMounted) return;
        setResolvedImage(res);
      })
      .catch(() => {
        if (!isMounted) return;
        setResolvedImage({
          imageUrl: getCategoryIllustrationUri(place.category),
          sourceType: 'category_illustration',
          badgeLabel: 'Local Illustration',
          attribution: 'Jalpaiguri Municipal Heritage Series',
          isAiGenerated: false
        });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [place]);

  const handleCopyPlaceId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(place.placeId);
    setCopiedPlaceId(true);
    setTimeout(() => setCopiedPlaceId(false), 2000);
  };

  const currentImageUrl = resolvedImage?.imageUrl || getCategoryIllustrationUri(place.category);

  return (
    <article
      onClick={() => onSelect(place)}
      className="group bg-white dark:bg-[#16231E] border border-[#E8E4DA] dark:border-white/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#063B2C] dark:hover:border-[#34D399]/40 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* 1. Guaranteed Place Photo or Authentic Local Bengal Illustration */}
      <div className="relative w-full h-44 sm:h-48 bg-[#F0EBE1] dark:bg-[#101A16] overflow-hidden">
        {loading && !resolvedImage ? (
          // Smooth shimmer skeleton while resolving
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 animate-pulse bg-gradient-to-r from-[#EAE5DA] via-[#F5F1E9] to-[#EAE5DA] dark:from-[#13201B] dark:via-[#1B2C25] dark:to-[#13201B]">
            <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-white/10" />
            <div className="text-[11px] font-medium text-[#73857C] dark:text-[#7A9387]">
              Loading place image…
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={currentImageUrl}
              alt={place.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => {
                // Guaranteed safety net: Switch to Category Vector if network asset fails
                setResolvedImage({
                  imageUrl: getCategoryIllustrationUri(place.category),
                  sourceType: 'category_illustration',
                  badgeLabel: 'Local Illustration',
                  attribution: 'Jalpaiguri Municipal Heritage Series',
                  isAiGenerated: false
                });
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />
            {/* Contrast gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

            {/* Bottom Image Source & Attribution Badge */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-white/95">
              <span className="truncate drop-shadow-md text-[10px] font-medium max-w-[210px]">
                {resolvedImage?.attribution || 'Jalpaiguri Landmark'}
              </span>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-xs backdrop-blur-md ${
                  resolvedImage?.sourceType === 'google'
                    ? 'bg-[#063B2C]/90 text-white'
                    : resolvedImage?.sourceType === 'database'
                    ? 'bg-[#0F766E]/90 text-white'
                    : resolvedImage?.sourceType === 'gemini'
                    ? 'bg-indigo-600/95 text-white flex items-center gap-1'
                    : 'bg-amber-900/90 text-amber-100'
                }`}
              >
                {resolvedImage?.isAiGenerated && <Sparkles className="w-2.5 h-2.5" />}
                {resolvedImage?.badgeLabel || 'Local Illustration'}
              </span>
            </div>
          </div>
        )}

        {/* Top Badges: Category & Service Area */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 dark:bg-[#11241C]/90 text-[#063B2C] dark:text-[#5CE6B0] shadow-xs backdrop-blur-xs border border-white/20">
            {place.category}
          </span>

          {place.distanceText && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs shadow-xs">
              📍 {place.distanceText}
            </span>
          )}
        </div>
      </div>

      {/* 2. Place Information */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Subcategory & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-semibold text-[#55685F] dark:text-[#9FB2A8] truncate">
              {place.subcategory}
            </span>
            <div className="flex items-center gap-1 bg-[#FFF9E6] dark:bg-[#2A2412] text-[#B45309] dark:text-[#FBBF24] px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span>{place.rating.toFixed(1)}</span>
              <span className="text-[10px] opacity-70 font-normal">
                ({place.userRatingCount})
              </span>
            </div>
          </div>

          {/* Place Title */}
          <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white leading-tight group-hover:text-[#063B2C] dark:group-hover:text-[#5CE6B0] transition-colors">
            {place.name}
          </h3>

          {/* Formatted Address */}
          <p className="text-[11px] font-medium text-[#55685F] dark:text-[#A2B3AA] flex items-start gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-[#34D399] shrink-0 mt-0.5" />
            <span>{place.formattedAddress}</span>
          </p>

          {/* Operational Hours / Status */}
          {place.openStatus && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#063B2C] dark:text-[#5CE6B0] font-semibold">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{place.openStatus}</span>
            </div>
          )}

          {/* Place Description Snippet */}
          {place.description && (
            <p className="text-[11px] text-[#55685F] dark:text-[#8BA095] line-clamp-2 leading-relaxed">
              {place.description}
            </p>
          )}

          {/* Google Place ID Pill */}
          <div className="pt-1 flex items-center gap-1.5">
            <button
              onClick={handleCopyPlaceId}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-[9px] font-mono text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#EFECE6] dark:hover:bg-white/10 transition-colors"
              title="Click to copy official Google Place ID"
            >
              {copiedPlaceId ? (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5 opacity-60" />
                  <span>ID: {place.placeId.slice(0, 10)}…</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>Jalpaiguri Area</span>
            </span>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center gap-2">
          {/* Open directly in Google Maps */}
          <a
            href={place.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#063B2C] dark:bg-[#1E4D3B] hover:bg-[#084D3A] dark:hover:bg-[#25634D] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Maps</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
          </a>

          {/* Details / Ask AI */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskAI(place);
            }}
            className="bg-[#FAF8F5] dark:bg-white/5 border border-[#D2CEBE] dark:border-white/15 text-[#063B2C] dark:text-[#5CE6B0] hover:bg-[#E6F4EA] dark:hover:bg-[#1B3629] px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            title="Ask Jalpaigi AI about this place"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </article>
  );
};
