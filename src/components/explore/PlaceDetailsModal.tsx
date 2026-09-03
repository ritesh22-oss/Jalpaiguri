import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Star,
  ExternalLink,
  Navigation,
  Sparkles,
  Phone,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  CameraOff,
  Compass,
  Share2
} from 'lucide-react';
import { ExplorePlaceItem } from '../../types';
import { resolvePlaceImage, ResolvedPlaceImage } from '../../utils/placesPhotoClient';
import { getCategoryIllustrationUri } from '../../utils/placeCategoryIllustrations';

interface PlaceDetailsModalProps {
  place: ExplorePlaceItem | null;
  onClose: () => void;
  onAskAI: (place: ExplorePlaceItem) => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  place,
  onClose,
  onAskAI
}) => {
  const [resolvedImage, setResolvedImage] = useState<ResolvedPlaceImage | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  useEffect(() => {
    if (!place) return;
    let isMounted = true;
    setLoadingPhoto(true);

    resolvePlaceImage(place, 800, 500)
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
        if (isMounted) setLoadingPhoto(false);
      });

    return () => {
      isMounted = false;
    };
  }, [place]);

  if (!place) return null;

  const handleCopyPlaceId = () => {
    navigator.clipboard.writeText(place.placeId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: place.name,
          text: `${place.name} - Verified location in Jalpaiguri on Jalpaiguri Connect`,
          url: place.googleMapsUri
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${place.name}: ${place.googleMapsUri}`);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2000);
    }
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&destination_place_id=${place.placeId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#14221C] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8E4DA] dark:border-white/10 animate-in slide-in-from-bottom-6 duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header Bar with Close Button */}
        <div className="relative w-full h-52 sm:h-60 bg-[#EFEBE3] dark:bg-[#0E1713] shrink-0">
          {loadingPhoto && !resolvedImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2 animate-pulse bg-gradient-to-r from-[#E8E3D7] via-[#F4EFE5] to-[#E8E3D7] dark:from-[#13201A] dark:via-[#1D2F27] dark:to-[#13201A]">
              <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-white/10" />
              <p className="text-xs text-[#55685F] dark:text-[#8FA59A]">Loading Place Photo…</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={resolvedImage?.imageUrl || getCategoryIllustrationUri(place.category)}
                alt={place.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => {
                  setResolvedImage({
                    imageUrl: getCategoryIllustrationUri(place.category),
                    sourceType: 'category_illustration',
                    badgeLabel: 'Local Illustration',
                    attribution: 'Jalpaiguri Municipal Heritage Series',
                    isAiGenerated: false
                  });
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white/95">
                <span className="truncate max-w-[280px]">
                  {resolvedImage?.attribution || 'Jalpaiguri Landmark'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-xs backdrop-blur-md ${
                    resolvedImage?.sourceType === 'google'
                      ? 'bg-[#063B2C]/90 text-white'
                      : resolvedImage?.sourceType === 'database'
                      ? 'bg-[#0F766E]/90 text-white'
                      : resolvedImage?.sourceType === 'gemini'
                      ? 'bg-indigo-600/95 text-white flex items-center gap-1'
                      : 'bg-amber-900/90 text-amber-100'
                  }`}
                >
                  {resolvedImage?.isAiGenerated && <Sparkles className="w-3 h-3" />}
                  {resolvedImage?.badgeLabel || 'Local Illustration'}
                </span>
              </div>
            </div>
          )}

          {/* Close & Share Top Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
              title="Share Place"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
              title="Close Details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Pill on Top Left */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#063B2C] text-white shadow-md border border-white/20">
              {place.category}
            </span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-[#11241C] dark:text-white">
          {/* Header Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mb-1">
              <span>{place.subcategory}</span>
              <span>•</span>
              <div className="flex items-center gap-1 text-[#B45309] dark:text-[#FBBF24]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold">{place.rating.toFixed(1)}</span>
                <span className="text-[#55685F] dark:text-[#8BA095]">
                  ({place.userRatingCount} reviews)
                </span>
              </div>
            </div>

            <h2 className="text-xl font-extrabold leading-snug">
              {place.name}
            </h2>
          </div>

          {/* Place ID Badge with Copy */}
          <div className="bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#55685F] dark:text-[#A2B3AA]">
                  Google Place ID
                </p>
                <p className="text-xs font-mono font-semibold text-[#11241C] dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {place.placeId}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyPlaceId}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-[#D2CEBE] dark:border-white/20 text-xs font-semibold text-[#11241C] dark:text-white hover:bg-[#EFECE6] dark:hover:bg-white/20 flex items-center gap-1 cursor-pointer"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Info Grid */}
          <div className="space-y-2.5 text-xs">
            {/* Address */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
              <MapPin className="w-4 h-4 text-[#063B2C] dark:text-[#34D399] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Address in Jalpaiguri</span>
                <span className="text-[#55685F] dark:text-[#A2B3AA]">
                  {place.formattedAddress}
                </span>
                {place.distanceText && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-[#063B2C] dark:text-[#5CE6B0]">
                    Distance: {place.distanceText}
                  </span>
                )}
              </div>
            </div>

            {/* Hours & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {place.openStatus && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <Clock className="w-4 h-4 text-[#063B2C] dark:text-[#34D399] shrink-0" />
                  <div>
                    <span className="font-bold text-[11px] block">Timing</span>
                    <span className="text-[#55685F] dark:text-[#A2B3AA]">
                      {place.openStatus}
                    </span>
                  </div>
                </div>
              )}

              {place.phone && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10">
                  <Phone className="w-4 h-4 text-[#063B2C] dark:text-[#34D399] shrink-0" />
                  <div>
                    <span className="font-bold text-[11px] block">Helpline / Contact</span>
                    <a
                      href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                      className="text-[#063B2C] dark:text-[#5CE6B0] font-bold hover:underline"
                    >
                      {place.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {place.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#55685F] dark:text-[#A2B3AA]">
                About this Place
              </h4>
              <p className="text-xs text-[#55685F] dark:text-[#C5D5CC] leading-relaxed">
                {place.description}
              </p>
            </div>
          )}

          {/* Key Features / Badges */}
          {place.features && place.features.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#55685F] dark:text-[#A2B3AA]">
                Highlights & Facilities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {place.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E6F4EA] dark:bg-[#1A382B] text-[#063B2C] dark:text-[#5CE6B0]"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Jalpaiguri Coverage Guarantee */}
          <div className="p-3 rounded-xl bg-[#E6F4EA]/60 dark:bg-[#163326]/60 border border-[#A7D7B9] dark:border-emerald-800/40 flex items-center gap-2 text-xs text-[#063B2C] dark:text-[#74E8BA]">
            <Compass className="w-4 h-4 shrink-0" />
            <span>
              Geospatially validated inside supported <strong>Jalpaiguri Service Area</strong>.
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 border-t border-[#E8E4DA] dark:border-white/10 bg-[#FAF8F5] dark:bg-[#101A16] flex flex-col sm:flex-row gap-2 shrink-0">
          <a
            href={place.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#063B2C] dark:bg-[#1E4D3B] hover:bg-[#084D3A] dark:hover:bg-[#25634D] text-white py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
          >
            <Navigation className="w-4 h-4" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-75 ml-auto" />
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-white/10 border border-[#D2CEBE] dark:border-white/20 text-[#11241C] dark:text-white hover:bg-[#EFECE6] dark:hover:bg-white/20 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
          >
            <Compass className="w-4 h-4 text-[#063B2C] dark:text-[#34D399]" />
            <span>Directions</span>
          </a>

          <button
            onClick={() => {
              onClose();
              onAskAI(place);
            }}
            className="bg-[#E6F4EA] dark:bg-[#1E3B2E] text-[#063B2C] dark:text-[#5CE6B0] hover:bg-[#D4EDDA] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
