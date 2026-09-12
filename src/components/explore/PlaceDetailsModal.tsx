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
  Share2,
  Camera
} from 'lucide-react';
import { ExplorePlaceItem } from '../../types';
import { resolvePlaceImage, ResolvedPlaceImage, getAdminPlaceThumbnails, getUserPlacePhotos } from '../../utils/placesPhotoClient';
import { getCategoryIllustrationUri } from '../../utils/placeCategoryIllustrations';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [adminThumbnails, setAdminThumbnails] = useState<string[]>([]);
  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const [activeHeroUrl, setActiveHeroUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!place) return;
    let isMounted = true;
    setLoadingPhoto(true);

    const loadThumbnails = () => {
      const thumbs = getAdminPlaceThumbnails(place.placeId);
      const uPhotos = getUserPlacePhotos(place.placeId);
      if (isMounted) {
        setAdminThumbnails(thumbs);
        setUserPhotos(uPhotos);
        if (thumbs.length > 0) {
          setActiveHeroUrl(thumbs[0]);
        } else {
          setActiveHeroUrl(null);
        }
      }
    };

    loadThumbnails();
    window.addEventListener('jpg_thumbnails_updated', loadThumbnails);

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
          badgeLabel: 'Stock Photo',
          attribution: 'Unsplash Photorealistic Collection',
          isAiGenerated: false
        });
      })
      .finally(() => {
        if (isMounted) setLoadingPhoto(false);
      });

    return () => {
      isMounted = false;
      window.removeEventListener('jpg_thumbnails_updated', loadThumbnails);
    };
  }, [place]);

  if (!place) return null;

  const allAvailablePhotos = [
    ...(adminThumbnails.length > 0 ? adminThumbnails : []),
    ...(resolvedImage?.imageUrl ? [resolvedImage.imageUrl] : [getCategoryIllustrationUri(place.category)]),
    ...userPhotos
  ];
  const uniquePhotos = Array.from(new Set(allAvailablePhotos));
  const currentHero = activeHeroUrl || uniquePhotos[0] || resolvedImage?.imageUrl || getCategoryIllustrationUri(place.category);

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
          text: `${place.name} - Verified location in Jalpaiguri on MYJPG`,
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
        className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8E4DA] dark:border-white/10 animate-in slide-in-from-bottom-6 duration-300"
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
                src={currentHero}
                alt={place.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => {
                  setResolvedImage({
                    imageUrl: getCategoryIllustrationUri(place.category),
                    sourceType: 'category_illustration',
                    badgeLabel: 'Stock Photo',
                    attribution: 'Unsplash Photorealistic Collection',
                    isAiGenerated: false
                  });
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
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
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#007AFF] text-white shadow-md border border-white/20">
              {place.category}
            </span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-gray-900 dark:text-white">
          {/* Header Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <span>{place.subcategory}</span>
              <span>•</span>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold">{place.rating.toFixed(1)}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({place.userRatingCount} reviews)
                </span>
              </div>
            </div>

            <h2 className="text-xl font-extrabold leading-snug">
              {place.name}
            </h2>
          </div>

          {/* Admin Thumbnails & User Photos Gallery Strip (Up to 4+ photos) */}
          {uniquePhotos.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#007AFF]" />
                  Place Photos & Admin Thumbnails ({uniquePhotos.length})
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Click to preview</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                {uniquePhotos.map((photoUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveHeroUrl(photoUrl)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      currentHero === photoUrl
                        ? 'border-[#007AFF] ring-2 ring-[#007AFF]/30 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Place ID Badge with Copy */}
          <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Google Place ID
                </p>
                <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {place.placeId}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyPlaceId}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 flex items-center gap-1 cursor-pointer"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400">Copied</span>
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
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <MapPin className="w-4 h-4 text-[#007AFF] dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Address in Jalpaiguri</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {place.formattedAddress}
                </span>
                {place.distanceText && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-[#007AFF] dark:text-blue-300">
                    Distance: {place.distanceText}
                  </span>
                )}
              </div>
            </div>

            {/* Hours & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {place.openStatus && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <Clock className="w-4 h-4 text-[#007AFF] dark:text-blue-400 shrink-0" />
                  <div>
                    <span className="font-bold text-[11px] block">Timing</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {place.openStatus}
                    </span>
                  </div>
                </div>
              )}

              {place.phone && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <Phone className="w-4 h-4 text-[#007AFF] dark:text-blue-400 shrink-0" />
                  <div>
                    <span className="font-bold text-[11px] block">Helpline / Contact</span>
                    <a
                      href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                      className="text-[#007AFF] dark:text-blue-400 font-bold hover:underline"
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                About this Place
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {place.description}
              </p>
            </div>
          )}

          {/* Key Features / Badges */}
          {place.features && place.features.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Highlights & Facilities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {place.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Jalpaiguri Coverage Guarantee */}
          <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center gap-2 text-xs text-[#007AFF] dark:text-blue-300">
            <Compass className="w-4 h-4 shrink-0" />
            <span>
              Geospatially validated inside supported <strong>Jalpaiguri Service Area</strong>.
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#121E2C] flex flex-col sm:flex-row gap-2 shrink-0">
          <a
            href={place.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#007AFF] hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
          >
            <Navigation className="w-4 h-4" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-75 ml-auto" />
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
          >
            <Compass className="w-4 h-4 text-[#007AFF] dark:text-blue-400" />
            <span>Directions</span>
          </a>

          <button
            onClick={() => {
              onClose();
              onAskAI(place);
            }}
            className="bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800/40 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800/40 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-98 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      <UploadPlacePhotoModal
        placeId={place.placeId}
        placeName={place.name}
        category={place.category}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};
