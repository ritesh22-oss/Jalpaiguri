import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  Phone,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  BookmarkCheck,
  Award,
  Compass,
  Star,
  MessageSquare,
  Send,
  Trash2,
  Map,
  CheckCircle2
} from 'lucide-react';
import { DurgaPandalItem, UserLocation, PandalReview } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { calculateHaversineDistance } from '../../utils/serviceArea';
import { getAdminPlaceThumbnails } from '../../utils/placesPhotoClient';

interface PandalDetailsModalProps {
  pandal: DurgaPandalItem | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onOpenReportModal: (pandal: DurgaPandalItem) => void;
}

export const PandalDetailsModal: React.FC<PandalDetailsModalProps> = ({
  pandal,
  isOpen,
  onClose,
  userLocation,
  onOpenReportModal
}) => {
  const { isBengali } = useLanguage();
  const {
    toggleSavePandal,
    isPandalSaved,
    addRecentlyViewedPandal,
    addPandalReview,
    fetchPandalReviews,
    deletePandalReview
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [reviews, setReviews] = useState<PandalReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // New review form state
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (isOpen && pandal) {
      addRecentlyViewedPandal(pandal.id);
      setIsLoadingReviews(true);
      fetchPandalReviews(pandal.id)
        .then((res) => setReviews(res))
        .catch(() => setReviews([]))
        .finally(() => setIsLoadingReviews(false));
    }
  }, [isOpen, pandal]);

  if (!isOpen || !pandal) return null;

  const isSaved = isPandalSaved(pandal.id);

  // Calculate real distance from user's actual GPS location
  const distKm = calculateHaversineDistance(
    userLocation.lat,
    userLocation.lng,
    pandal.lat,
    pandal.lng
  );
  const formattedDistance = distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`;

  const adminPhotos = getAdminPlaceThumbnails(pandal.id);
  const basePhotos = pandal.photos && pandal.photos.length > 0 ? pandal.photos : [pandal.primaryPhoto];
  const photos = Array.from(new Set([...adminPhotos, ...basePhotos])).filter(Boolean);

  const handleGetDirections = () => {
    // Open Google Maps using real current user location as origin and pandal coordinates as destination
    const originStr = `${userLocation.lat},${userLocation.lng}`;
    const destStr = `${pandal.lat},${pandal.lng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&destination_place_id=${encodeURIComponent(pandal.name)}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenMap = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${pandal.lat},${pandal.lng}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pandal.name,
        text: `Check out ${pandal.name} Durga Puja Pandal in Jalpaiguri! Located ${formattedDistance} away at ${pandal.locality}.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${pandal.name} - Jalpaiguri Durga Puja: ${pandal.address}`);
      alert(isBengali ? 'প্যান্ডেলের তথ্য কপি করা হয়েছে!' : 'Pandal details copied to clipboard!');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating < 1 || userRating > 5) return;
    setIsSubmittingReview(true);
    try {
      await addPandalReview(pandal.id, userRating, reviewText);
      setReviewText('');
      setShowReviewForm(false);
      // Refresh reviews list
      const updated = await fetchPandalReviews(pandal.id);
      setReviews(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm(isBengali ? 'আপনি কি মন্তব্যটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this review?')) {
      await deletePandalReview(pandal.id, reviewId);
      const updated = await fetchPandalReviews(pandal.id);
      setReviews(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-900/40 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Sticky Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-900 via-[#0A2540] to-blue-950 text-white border-b border-blue-800/50 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-1.5">
            <img src="/durga-ma-icon.png" alt="Durga Ma" className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0" referrerPolicy="no-referrer" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-300 bg-blue-900/60 px-1.5 py-0.2 rounded-full border border-blue-400/30 inline-block">
                {pandal.season || '2026 / 1433 BS'}
              </span>
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate leading-tight mt-0.5">
                {isBengali ? (pandal.nameBn || pandal.name) : pandal.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => toggleSavePandal(pandal.id)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                isSaved ? 'bg-amber-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isSaved ? 'Bookmarked' : 'Save Pandal'}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              title="Share Pandal"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
          {/* Photo Gallery / Carousel */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-950 shadow-md group border border-blue-200/50 dark:border-blue-900/30">
            <img
              src={photos[activePhotoIndex]}
              alt={pandal.name}
              className="w-full h-56 sm:h-64 object-cover transition-all duration-300"
            />
            
            {/* Category / Verified Overlay Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className="bg-[#007AFF] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                {pandal.category}
              </span>
              {pandal.verificationStatus === 'verified' && (
                <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3 h-3 text-blue-200" />
                  <span>{isBengali ? 'যাচাইকৃত মণ্ডপ' : 'Verified Official'}</span>
                </span>
              )}
            </div>

            {/* Distance Badge */}
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 shadow-md">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>{formattedDistance} {isBengali ? 'দূরে' : 'away'}</span>
            </div>

            {/* Carousel Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Photo Indicator Dots & Attribution Banner */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 pt-6 text-[10px] text-gray-300 flex items-center justify-between">
              <span className="truncate pr-2">
                📷 {pandal.photoAttributions?.[activePhotoIndex] || pandal.photoAttributions?.[0] || 'Verified MYJPG Submission'}
              </span>
              <span className="shrink-0 font-bold bg-white/20 px-2 py-0.5 rounded-md text-white">
                {activePhotoIndex + 1} / {photos.length}
              </span>
            </div>
          </div>

          {/* Title & Committee & Rating Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-snug">
                  {isBengali ? (pandal.nameBn || pandal.name) : pandal.name}
                </h1>
                <p className="text-xs text-[#007AFF] dark:text-blue-400 font-bold flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isBengali ? (pandal.committeeBn || pandal.committee) : pandal.committee}</span>
                </p>
              </div>

              {/* Rating badge */}
              <div className="flex flex-col items-end shrink-0 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3 py-1.5 rounded-2xl">
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{pandal.rating ? pandal.rating.toFixed(1) : '4.8'}</span>
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {pandal.ratingCount || reviews.length || 0} {isBengali ? 'টি রিভিউ' : 'reviews'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme & Special Attraction Box */}
          {pandal.themeName && (
            <div className="bg-gradient-to-r from-blue-50/80 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#007AFF] dark:text-blue-400 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-[#007AFF] animate-pulse" />
                <span>{isBengali ? 'মূল ভাবনা ও থিম' : 'Theme & Special Attraction'}</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 leading-relaxed">
                "{pandal.themeName}"
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {isBengali ? 'বিবরণ' : 'About this Puja'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              {pandal.description}
            </p>
          </div>

          {/* Special Attractions List */}
          {pandal.specialAttractions && pandal.specialAttractions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBengali ? 'বিশেষ আকর্ষণসমূহ' : 'Key Attractions & Features'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pandal.specialAttractions.map((attraction, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] shrink-0" />
                    <span>{attraction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timings & Puja Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>{isBengali ? 'পূজার দিনসমূহ' : 'Puja Dates'}</span>
              </div>
              <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                {pandal.pujaDates || (isBengali ? 'মহাষষ্ঠী থেকে বিজয়াদশমী' : 'Mahasashthi to Vijayadashami')}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>{isBengali ? 'দর্শনের সময়' : 'Visiting Timings'}</span>
              </div>
              <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                {pandal.timings || (isBengali ? '২৪ ঘণ্টা খোলা' : 'Open 24 Hours')}
              </p>
            </div>
          </div>

          {/* Visual Map Preview & Verified Address */}
          <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl p-3.5 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#007AFF] dark:text-blue-400">
                <MapPin className="w-4 h-4" />
                <span>{isBengali ? 'ঠিকানা ও অবস্থান' : 'Verified Location & Map'}</span>
              </div>
              <span className="text-[11px] font-black text-[#007AFF] dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                📍 {formattedDistance} {isBengali ? 'দূরে' : 'from GPS'}
              </span>
            </div>
            
            <p className="text-xs text-gray-800 dark:text-gray-200 font-semibold leading-relaxed">
              {pandal.address}
            </p>

            {/* Embedded Visual Map Preview Frame */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 border border-blue-200/40 dark:border-blue-900/30 flex items-center justify-center">
              <img
                src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80`}
                alt="Map location preview"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute flex items-center gap-2 bg-black/80 text-white backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold">
                <Map className="w-3.5 h-3.5 text-blue-400" />
                <span>{pandal.locality}, Jalpaiguri</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={handleOpenMap}
                className="text-[#007AFF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Map className="w-3.5 h-3.5" />
                <span>{isBengali ? 'ম্যাপে খুলুন' : 'View on Map'}</span>
              </button>
              <span className="text-[11px] text-gray-500">
                GPS: {pandal.lat.toFixed(4)}, {pandal.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Organizer Contact Info if available */}
          {pandal.organizerContact?.phone && (
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 p-3 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {pandal.organizerContact.name || (isBengali ? 'আয়োজক হেল্পলাইন' : 'Organizer Helpline')}
                  </span>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400">{pandal.organizerContact.phone}</p>
                </div>
              </div>
              <a
                href={`tel:${pandal.organizerContact.phone}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors text-xs"
              >
                {isBengali ? 'কল করুন' : 'Call'}
              </a>
            </div>
          )}

          {/* Ratings & Reviews Section */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  {isBengali ? 'দর্শকদের রিভিউ ও রেটিং' : 'Visitor Ratings & Reviews'}
                </h3>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-bold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40"
              >
                <span>{showReviewForm ? (isBengali ? 'বন্ধ করুন' : 'Cancel') : (isBengali ? '+ রিভিউ লিখুন' : '+ Write Review')}</span>
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="bg-blue-50/50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-blue-200 dark:border-gray-700 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {isBengali ? 'আপনার রেটিং বাছাই করুন:' : 'Select Your Star Rating:'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (hoverRating || userRating) >= star
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-amber-600 ml-2">
                      {hoverRating || userRating} / 5
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={isBengali ? 'আপনার অভিজ্ঞতা ও মণ্ডপের সাজসজ্জা সম্পর্কে লিখুন...' : 'Share your experience, theme highlights, crowd, or decor...'}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] min-h-[70px]"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewText.trim()}
                    className="bg-[#007AFF] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? (isBengali ? 'জমা হচ্ছে...' : 'Submitting...') : (isBengali ? 'জমা দিন' : 'Submit Review')}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-2">
              {isLoadingReviews ? (
                <p className="text-xs text-gray-400 animate-pulse">{isBengali ? 'রিভিউ লোড হচ্ছে...' : 'Loading reviews...'}</p>
              ) : reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{rev.userName}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      "{rev.reviewText}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-500">
                  {isBengali ? 'এখনও কোনো রিভিউ নেই। আপনি প্রথম রিভিউ লিখুন!' : 'No user reviews yet. Be the first to share your experience!'}
                </div>
              )}
            </div>
          </div>

          {/* Verification Badge footer */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-100 dark:bg-gray-800/80 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">
                {isBengali
                  ? `যাচাইকারী: ${pandal.verifiedBy || 'জলপাইগুড়ি পৌরসভা ও MYJPG মণ্ডপ সেল'}`
                  : `Verified by: ${pandal.verifiedBy || 'Jalpaiguri Municipal Cultural Cell'}`}
              </span>
            </div>
            <button
              onClick={() => onOpenReportModal(pandal)}
              className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isBengali ? 'রিপোর্ট' : 'Report'}</span>
            </button>
          </div>
        </div>

        {/* Action Bar Footer with Prominent Get Directions */}
        <div className="p-4 bg-gray-50 dark:bg-[#0B132B] border-t border-gray-200 dark:border-gray-800 shrink-0 flex items-center gap-3">
          <button
            onClick={handleGetDirections}
            className="flex-1 bg-gradient-to-r from-[#007AFF] to-[#0051A8] hover:from-[#0062CC] hover:to-[#003E80] text-white font-black py-3.5 px-4 rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            <Navigation className="w-5 h-5 animate-bounce" />
            <span>{isBengali ? 'গুগল ম্যাপসে দিকনির্দেশ পান (Get Directions)' : 'Get Directions in Google Maps'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
