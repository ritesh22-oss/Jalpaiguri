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
  Clock,
  Camera
} from 'lucide-react';
import { ExplorePlaceItem } from '../../types';
import { resolvePlaceImage, ResolvedPlaceImage } from '../../utils/placesPhotoClient';
import { getCategoryIllustrationUri } from '../../utils/placeCategoryIllustrations';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';

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
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

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
          badgeLabel: 'Stock Photo',
          attribution: 'Unsplash Photorealistic Collection',
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

  const currentImageUrl = resolvedImage?.imageUrl || getCategoryIllustrationUri(place.category);

  return (
    <article
      onClick={() => onSelect(place)}
      className="group bg-white dark:bg-[#121E2C] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#007AFF] dark:hover:border-blue-500/40 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* 1. Guaranteed Place Photo or Authentic Local Bengal Illustration */}
      <div className="relative w-full h-44 sm:h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {loading && !resolvedImage ? (
          // Smooth shimmer skeleton while resolving
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
            <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-white/10" />
            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
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
                  badgeLabel: 'Stock Photo',
                  attribution: 'Unsplash Photorealistic Collection',
                  isAiGenerated: false
                });
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />
            {/* Contrast gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Top Badges: Category & Service Area */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 dark:bg-[#121E2C]/90 text-[#007AFF] dark:text-blue-300 shadow-xs backdrop-blur-xs border border-white/20">
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
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 truncate">
              {place.subcategory}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span>{place.rating.toFixed(1)}</span>
              <span className="text-[10px] opacity-70 font-normal">
                ({place.userRatingCount})
              </span>
            </div>
          </div>

          {/* Place Title */}
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight group-hover:text-[#007AFF] dark:group-hover:text-blue-400 transition-colors">
            {place.name}
          </h3>

          {/* Formatted Address */}
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-start gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400 shrink-0 mt-0.5" />
            <span>{place.formattedAddress}</span>
          </p>

          {/* Operational Hours / Status */}
          {place.openStatus && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#007AFF] dark:text-blue-400 font-semibold">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{place.openStatus}</span>
            </div>
          )}

          {/* Place Description Snippet */}
          {place.description && (
            <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {place.description}
            </p>
          )}
        </div>

        {/* 3. Action Buttons */}
        <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex items-center gap-2">
          {/* Open directly in Google Maps */}
          <a
            href={place.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#007AFF] hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
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
            className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 text-[#007AFF] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            title="Ask JPG AI about this place"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Upload Place Photo Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsUploadOpen(true);
            }}
            className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            title="Upload photo from camera or gallery"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      <UploadPlacePhotoModal
        placeId={place.placeId}
        placeName={place.name}
        category={place.category}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={(url) => {
          setResolvedImage({
            imageUrl: url,
            sourceType: 'admin_approved',
            badgeLabel: 'Community Photo',
            attribution: 'Local Jalpaiguri Contributor',
            isAiGenerated: false
          });
        }}
      />
    </article>
  );
};
