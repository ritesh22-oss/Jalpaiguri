import React, { useState } from 'react';
import {
  X,
  Plus,
  MapPin,
  Sparkles,
  Building2,
  Phone,
  Calendar,
  Clock,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { DurgaPandalItem, UserLocation } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { JALPAIGURI_LOCALITIES } from '../../data/jalpaiguriLocalities';

interface AddPandalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onSubmit: (pandalData: Omit<DurgaPandalItem, 'id' | 'createdAt' | 'verificationStatus'>) => Promise<void>;
}

export const AddPandalModal: React.FC<AddPandalModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSubmit
}) => {
  const { isBengali } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    committee: '',
    committeeBn: '',
    locality: userLocation.locality || 'Kadamtala',
    address: '',
    lat: userLocation.lat || 26.5228,
    lng: userLocation.lng || 88.7245,
    category: 'Theme Pandal' as DurgaPandalItem['category'],
    themeName: '',
    description: '',
    primaryPhoto: 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=800&auto=format&fit=crop&q=80',
    additionalPhoto: '',
    photoAttribution: 'Submitted by Puja Committee / MYJPG',
    pujaDates: 'Mahasashthi to Vijayadashami (16 Oct - 20 Oct 2026)',
    timings: 'Open 24 Hours | Illumination 6:00 PM - 2:00 AM',
    specialAttraction1: '',
    specialAttraction2: '',
    organizerName: '',
    organizerPhone: ''
  });

  if (!isOpen) return null;

  const handleLocalitySelect = (localityName: string) => {
    const loc = JALPAIGURI_LOCALITIES.find((l) => l.name === localityName || l.shortName === localityName);
    if (loc) {
      setFormData((prev) => ({
        ...prev,
        locality: loc.shortName,
        lat: loc.lat,
        lng: loc.lng,
        address: prev.address || `${loc.name}, Jalpaiguri, West Bengal 735101`
      }));
    } else {
      setFormData((prev) => ({ ...prev, locality: localityName }));
    }
  };

  const handleDetectCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
          alert(isBengali ? 'আপনার সঠিক জিপিএস অবস্থান যুক্ত করা হয়েছে!' : 'Accurate GPS coordinates assigned!');
        },
        () => {
          alert(isBengali ? 'জিপিএস শনাক্ত করা যায়নি। অনুগ্রহ করে ম্যানুয়ালি এলাকা নির্বাচন করুন।' : 'Unable to fetch GPS. Selected locality default used.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.committee.trim() || !formData.address.trim()) {
      alert(isBengali ? 'অনুগ্রহ করে মণ্ডপের নাম, আয়োজক কমিটি এবং পুরো ঠিকানা লিখুন।' : 'Please fill in Pandal Name, Committee Name, and Address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const photos = [formData.primaryPhoto];
      if (formData.additionalPhoto.trim()) {
        photos.push(formData.additionalPhoto.trim());
      }

      const specialAttractions: string[] = [];
      if (formData.specialAttraction1.trim()) specialAttractions.push(formData.specialAttraction1.trim());
      if (formData.specialAttraction2.trim()) specialAttractions.push(formData.specialAttraction2.trim());

      await onSubmit({
        name: formData.name.trim(),
        nameBn: formData.nameBn.trim() || formData.name.trim(),
        committee: formData.committee.trim(),
        committeeBn: formData.committeeBn.trim() || formData.committee.trim(),
        locality: formData.locality,
        address: formData.address.trim(),
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        season: '2026 / 1433 BS',
        isCurrentSeason: true,
        category: formData.category,
        themeName: formData.themeName.trim(),
        description: formData.description.trim() || `${formData.name} organized by ${formData.committee} in ${formData.locality}, Jalpaiguri.`,
        photos: photos,
        photoAttributions: [formData.photoAttribution || 'Submitted by Puja Committee'],
        primaryPhoto: formData.primaryPhoto,
        pujaDates: formData.pujaDates,
        timings: formData.timings,
        specialAttractions: specialAttractions,
        badge: 'Featured',
        organizerContact: {
          name: formData.organizerName.trim(),
          phone: formData.organizerPhone.trim()
        }
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-900/40 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3.5 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-blue-900 via-[#007AFF] to-blue-900 text-white shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <img src="/durga-ma-icon.png" alt="Durga Ma" className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0" referrerPolicy="no-referrer" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {isBengali ? 'আপনার দুর্গোৎসব মণ্ডপ যুক্ত করুন' : 'Add Your Puja Pandal'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-blue-100 font-medium truncate">
                {isBengali ? 'জলপাইগুড়ি দুর্গোৎসব ডিরেক্টরি' : 'Organizers & Committees Registration'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Verification Notice Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              <strong>{isBengali ? 'যাচাইকরণ প্রক্রিয়া:' : 'Official Verification Notice:'}</strong>{' '}
              {isBengali
                ? 'আবেদন জমা দেওয়ার পর জলপাইগুড়ি পৌরসভা ও MYJPG ভেরিফিকেশন সেল তথ্য পরীক্ষা করে আনুষ্ঠানিকভাবে "Verified Pandal" ব্যাজ দেবে।'
                : 'All committee submissions are verified by the Jalpaiguri Municipal & MYJPG team before receiving an official verified badge.'}
            </div>
          </div>

          {/* Pandal Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'মণ্ডপ/পূজার নাম (ইংরেজিতে) *' : 'Pandal / Puja Title (English) *'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kadamtala Town Club Sarbojanin Durga Puja"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'মণ্ডপ/পূজার নাম (বাংলায়)' : 'Pandal Title in Bengali (Optional)'}
            </label>
            <input
              type="text"
              placeholder="যেমন: কদমতলা টাউন ক্লাব সার্বজনীন দুর্গোৎসব"
              value={formData.nameBn}
              onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
            />
          </div>

          {/* Committee Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'পূজা কমিটি/ক্লাবের নাম *' : 'Puja Committee / Club Name *'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kadamtala Central Athletic Club"
              value={formData.committee}
              onChange={(e) => setFormData({ ...formData, committee: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'পূজার বিভাগ (Category) *' : 'Puja Category *'}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
            >
              <option value="Theme Pandal">Theme Pandal (থিম প্যান্ডেল)</option>
              <option value="Traditional Sabaki">Traditional Sabaki (ঐতিহ্যবাহী সাবেকী)</option>
              <option value="Eco-Friendly">Eco-Friendly (পরিবেশবান্ধব সবুজ পূজা)</option>
              <option value="Lighting & Illumination">Lighting & Illumination (আলোকসজ্জা বিশেষ)</option>
              <option value="Heritage">Heritage (শতবর্ষী ঐতিহ্য)</option>
            </select>
          </div>

          {/* Locality & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {isBengali ? 'এলাকা/ওয়ার্ড (Locality) *' : 'Locality / Area in Jalpaiguri *'}
              </label>
              <select
                value={formData.locality}
                onChange={(e) => handleLocalitySelect(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
              >
                {JALPAIGURI_LOCALITIES.map((loc) => (
                  <option key={loc.id} value={loc.shortName}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {isBengali ? 'জিপিএস অবস্থান' : 'GPS Location'}
              </label>
              <button
                type="button"
                onClick={handleDetectCurrentLocation}
                className="w-full py-2.5 px-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#007AFF] dark:text-blue-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>{isBengali ? 'আমার বর্তমান জিপিএস দিন' : 'Pin My Current GPS'}</span>
              </button>
            </div>
          </div>

          {/* Detailed Street Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'সম্পূর্ণ মণ্ডপ ঠিকানা *' : 'Full Verified Address *'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Club Playground, Near Hospital Road, Jalpaiguri 735101"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
            />
          </div>

          {/* Theme Title & Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'থিম / বিশেষ ভাবনা' : 'Theme Title / Special Attraction'}
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Palace Replica & Eco Terracotta Sculptures"
              value={formData.themeName}
              onChange={(e) => setFormData({ ...formData, themeName: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'মণ্ডপের বিস্তারিত বিবরণ' : 'Description / Highlights'}
            </label>
            <textarea
              rows={3}
              placeholder="Describe the pandal, art, cultural programs, or special illumination..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none resize-none"
            />
          </div>

          {/* Photo URL & Source Attribution */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'মণ্ডপ ফটো ইউআরএল (Primary Photo URL) *' : 'Primary Photo URL *'}
            </label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.primaryPhoto}
              onChange={(e) => setFormData({ ...formData, primaryPhoto: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              {isBengali ? 'ফটো উৎস/স্বত্বাধিকার (Photo Source Attribution)' : 'Photo Source / Attribution'}
            </label>
            <input
              type="text"
              placeholder="e.g. © Kadamtala Club Official Archive"
              value={formData.photoAttribution}
              onChange={(e) => setFormData({ ...formData, photoAttribution: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#007AFF] outline-none"
            />
          </div>

          {/* Special Attractions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {isBengali ? 'আকর্ষণ ১' : 'Attraction 1'}
              </label>
              <input
                type="text"
                placeholder="e.g. Live Chhau Dance"
                value={formData.specialAttraction1}
                onChange={(e) => setFormData({ ...formData, specialAttraction1: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {isBengali ? 'আকর্ষণ ২' : 'Attraction 2'}
              </label>
              <input
                type="text"
                placeholder="e.g. Chandannagar Gate"
                value={formData.specialAttraction2}
                onChange={(e) => setFormData({ ...formData, specialAttraction2: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Organizer Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {isBengali ? 'কমিটি সম্পাদকের নাম' : 'Secretary / Contact Person'}
              </label>
              <input
                type="text"
                placeholder="e.g. Subhashish Debnath"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {isBengali ? 'যোগাযোগ ফোন নম্বর' : 'Helpline Contact Number'}
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 94340 00000"
                value={formData.organizerPhone}
                onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#007AFF] hover:bg-blue-600 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{isBengali ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBengali ? 'পূজা মণ্ডপ জমা দিন' : 'Submit Pandal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
