import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Phone,
  Truck,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Building2,
  CreditCard,
  Image as ImageIcon,
  Save,
  RotateCcw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShopCategory } from '../../types';

const JALPAIGURI_LOCALITIES = [
  'Kadamtala',
  'Dinbazar',
  'DBC Road',
  'Silpasamiti Para',
  'Hakimpara',
  'Mohitnagar',
  'Pandapara',
  'Babupara',
  'Netaji Subhas Road',
  'Station Feeder Road',
  'Maskalai Bari',
  'Deshbandhu Nagar',
  'Ananda Chandra College Area',
  'Other (Jalpaiguri)'
];

const CATEGORIES: { key: ShopCategory; labelEn: string; labelBn: string; defaultPhoto: string }[] = [
  {
    key: 'Grocery & Departmental',
    labelEn: 'Grocery & Departmental',
    labelBn: 'মুদিখানা ও ডিপার্টমেন্টাল',
    defaultPhoto: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Pharmacy & Medical',
    labelEn: 'Pharmacy & Medical',
    labelBn: 'ওষুধ ও চিকিৎসাসামগ্রী',
    defaultPhoto: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Bakery & Sweets',
    labelEn: 'Bakery & Sweets',
    labelBn: 'বেকারি ও মিষ্টি',
    defaultPhoto: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Electronics & Mobile',
    labelEn: 'Electronics & Mobile',
    labelBn: 'ইলেকট্রনিক্স ও মোবাইল',
    defaultPhoto: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Clothing & Garments',
    labelEn: 'Clothing & Garments',
    labelBn: 'পোশাক ও বস্ত্র',
    defaultPhoto: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Hardware & Electricals',
    labelEn: 'Hardware & Electricals',
    labelBn: 'হার্ডওয়্যার ও ইলেকট্রিক্যাল',
    defaultPhoto: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Books & Stationery',
    labelEn: 'Books & Stationery',
    labelBn: 'বই ও স্টেশনারি',
    defaultPhoto: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Fresh Meat & Fish',
    labelEn: 'Fresh Meat & Fish',
    labelBn: 'তাজা মাছ ও মাংস',
    defaultPhoto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Dairy & Milk',
    labelEn: 'Dairy & Milk',
    labelBn: 'দুধ ও দুগ্ধজাত',
    defaultPhoto: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Personal Care & Salon',
    labelEn: 'Personal Care & Salon',
    labelBn: 'পার্সোনাল কেয়ার ও সেলুন',
    defaultPhoto: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80'
  },
  {
    key: 'Other',
    labelEn: 'Other Services',
    labelBn: 'অন্যান্য সেবা',
    defaultPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
  }
];

const DRAFT_STORAGE_KEY = 'jpg_shop_reg_draft';

export const AddShopWizardView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { user, firebaseUser } = useAuth();
  const { language } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '+91 ');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState(user?.phone || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');

  const [shopName, setShopName] = useState('');
  const [shopNameBengali, setShopNameBengali] = useState('');
  const [category, setCategory] = useState<ShopCategory>('Grocery & Departmental');
  const [subcategories, setSubcategories] = useState('');

  const [locality, setLocality] = useState('Kadamtala');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('735101');

  const [openTime, setOpenTime] = useState('08:00 AM');
  const [closeTime, setCloseTime] = useState('09:30 PM');
  const [weeklyOff, setWeeklyOff] = useState('None');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState('200');
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('3.5');
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState('500');
  const [upiId, setUpiId] = useState('');

  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Success Modal State
  const [createdShopResult, setCreatedShopResult] = useState<any | null>(null);

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setHasDraft(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Restore draft
  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.ownerName) setOwnerName(data.ownerName);
        if (data.ownerPhone) setOwnerPhone(data.ownerPhone);
        if (data.ownerWhatsapp) setOwnerWhatsapp(data.ownerWhatsapp);
        if (data.ownerEmail) setOwnerEmail(data.ownerEmail);
        if (data.shopName) setShopName(data.shopName);
        if (data.shopNameBengali) setShopNameBengali(data.shopNameBengali);
        if (data.category) setCategory(data.category);
        if (data.subcategories) setSubcategories(data.subcategories);
        if (data.locality) setLocality(data.locality);
        if (data.address) setAddress(data.address);
        if (data.landmark) setLandmark(data.landmark);
        if (data.pincode) setPincode(data.pincode);
        if (data.openTime) setOpenTime(data.openTime);
        if (data.closeTime) setCloseTime(data.closeTime);
        if (data.weeklyOff) setWeeklyOff(data.weeklyOff);
        if (typeof data.deliveryAvailable === 'boolean') setDeliveryAvailable(data.deliveryAvailable);
        if (data.deliveryRadiusKm) setDeliveryRadiusKm(data.deliveryRadiusKm);
        if (data.minOrderAmount) setMinOrderAmount(data.minOrderAmount);
        if (data.upiId) setUpiId(data.upiId);
        if (data.photoUrl) setPhotoUrl(data.photoUrl);
        if (data.description) setDescription(data.description);
        if (data.step) setStep(Math.min(data.step, totalSteps));
      }
    } catch (e) {
      console.warn('Failed to restore draft', e);
    }
    setHasDraft(false);
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setHasDraft(false);
  };

  // Save current progress as draft
  const handleSaveDraft = () => {
    try {
      const draftData = {
        ownerName,
        ownerPhone,
        ownerWhatsapp,
        ownerEmail,
        shopName,
        shopNameBengali,
        category,
        subcategories,
        locality,
        address,
        landmark,
        pincode,
        openTime,
        closeTime,
        weeklyOff,
        deliveryAvailable,
        deliveryRadiusKm,
        minOrderAmount,
        upiId,
        photoUrl,
        description,
        step,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 3000);
    } catch (e) {
      console.warn('Failed to save draft', e);
    }
  };

  // Calculate profile completeness score
  const calculateCompleteness = () => {
    let score = 0;
    if (ownerName.trim()) score += 15;
    if (ownerPhone.trim() && ownerPhone.length > 5) score += 15;
    if (shopName.trim()) score += 15;
    if (category) score += 10;
    if (address.trim() && locality) score += 15;
    if (pincode.trim()) score += 5;
    if (photoUrl.trim()) score += 10;
    if (description.trim()) score += 10;
    if (upiId.trim() || openTime) score += 5;
    return Math.min(score, 100);
  };

  const completeness = calculateCompleteness();
  const areEssentialsFilled =
    Boolean(ownerName.trim()) &&
    Boolean(ownerPhone.trim()) &&
    Boolean(shopName.trim()) &&
    Boolean(address.trim()) &&
    Boolean(locality);

  // AI Description Generator (Calling /api/ai/generate-shop-description)
  const handleGenerateAiDescription = async () => {
    if (!shopName) {
      setErrorMessage('Please enter your Shop Name first.');
      return;
    }
    setErrorMessage('');
    setIsGeneratingDescription(true);
    try {
      const res = await fetch('/api/ai/generate-shop-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName,
          category,
          locality,
          subcategories: subcategories ? subcategories.split(',') : []
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) {
          setDescription(data.description);
        }
      } else {
        // Fallback description
        setDescription(
          `Welcome to ${shopName}! A premier ${category.toLowerCase()} store situated at ${locality}, Jalpaiguri. Offering authentic local goods, dedicated customer care, and quick service for all neighborhood families.`
        );
      }
    } catch {
      // Local fallback
      setDescription(
        `Welcome to ${shopName}! A premier ${category.toLowerCase()} store situated at ${locality}, Jalpaiguri. Offering authentic local goods, dedicated customer care, and quick service for all neighborhood families.`
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!ownerName.trim()) {
        setErrorMessage(language === 'bn' ? 'মালিকের নাম আবশ্যক।' : 'Owner Full Name is required.');
        return;
      }
      if (!ownerPhone.trim() || ownerPhone.replace(/\D/g, '').length < 10) {
        setErrorMessage(language === 'bn' ? 'সঠিক ১০-সংখ্যার মোবাইল নম্বর আবশ্যক।' : 'Valid 10-digit mobile phone number is required.');
        return;
      }
    }
    if (step === 2) {
      if (!shopName.trim()) {
        setErrorMessage(language === 'bn' ? 'দোকানের নাম আবশ্যক।' : 'Shop Name is required.');
        return;
      }
    }
    if (step === 3) {
      if (!address.trim()) {
        setErrorMessage(language === 'bn' ? 'দোকানের সম্পূর্ণ ঠিকানা আবশ্যক।' : 'Shop Street Address is required.');
        return;
      }
      const pinNum = parseInt(pincode.replace(/\D/g, ''), 10);
      if (isNaN(pinNum) || pinNum < 735101 || pinNum > 735228) {
        setErrorMessage(
          language === 'bn'
            ? 'পিনকোড জলপাইগুড়ি জেলার (৭৩৫১০১ - ৭৩৫২২৮) মধ্যে হতে হবে।'
            : 'Pincode must be within Jalpaiguri District (735101 - 735228).'
        );
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  // Submit shop (can be called from step 3, 4, or 5)
  const handleSubmit = async () => {
    // Validate essential requirements
    if (!ownerName.trim()) {
      setStep(1);
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে প্রথমে মালিকের নাম লিখুন।' : 'Please enter Owner Name first.');
      return;
    }
    if (!ownerPhone.trim() || ownerPhone.replace(/\D/g, '').length < 10) {
      setStep(1);
      setErrorMessage(language === 'bn' ? 'অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন।' : 'Please enter a valid phone number.');
      return;
    }
    if (!shopName.trim()) {
      setStep(2);
      setErrorMessage(language === 'bn' ? 'দোকানের নাম আবশ্যক।' : 'Shop Name is required.');
      return;
    }
    if (!address.trim()) {
      setStep(3);
      setErrorMessage(language === 'bn' ? 'দোকানের ঠিকানা আবশ্যক।' : 'Shop address is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Find category default photo if user didn't provide one
      const catConfig = CATEGORIES.find((c) => c.key === category);
      const safePhoto = photoUrl.trim() || catConfig?.defaultPhoto || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80';

      const payload = {
        name: shopName.trim(),
        nameBengali: shopNameBengali.trim() || undefined,
        category,
        subcategories: subcategories ? subcategories.split(',').map((s) => s.trim()) : [],
        description: description.trim() || `Welcome to ${shopName} located in ${locality}, Jalpaiguri. Serving the local community with quality products and dependable service.`,
        locality,
        address: address.trim(),
        landmark: landmark.trim() || undefined,
        pincode: pincode.trim() || '735101',
        phone: ownerPhone.trim(),
        ownerPhone: ownerPhone.trim(),
        whatsappNumber: ownerWhatsapp.trim() || ownerPhone.trim(),
        email: ownerEmail.trim() || user?.email || undefined,
        ownerId: user?.id || firebaseUser?.uid || 'merchant-user',
        ownerName: ownerName.trim(),
        openingHours: {
          open: openTime || '08:00 AM',
          close: closeTime || '09:30 PM',
          weeklyOff: weeklyOff !== 'None' ? weeklyOff : undefined
        },
        deliveryAvailable,
        deliveryRadiusKm: deliveryAvailable ? parseFloat(deliveryRadiusKm) || 3.5 : 0,
        minOrderAmount: deliveryAvailable ? parseFloat(minOrderAmount) || 0 : 0,
        freeDeliveryAbove: deliveryAvailable ? parseFloat(freeDeliveryAbove) || 0 : 0,
        paymentMethods: ['Cash', 'UPI'],
        upiId: upiId.trim() || undefined,
        photoUrl: safePhoto,
        rating: 5.0,
        reviewCount: 1,
        isVerified: false
      };

      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdShop = await res.json();
        // Clear draft
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          localStorage.setItem('jpg_current_shop_id', createdShop.id);
        } catch {}

        setCreatedShopResult(createdShop);
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || 'Failed to register shop. Please check all fields.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while creating shop. Please verify connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors relative">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0F1A15]/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA]/60 dark:border-white/10 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-base font-black text-[#11241C] dark:text-white leading-tight">
                {language === 'bn' ? 'দোকান নিবন্ধন' : 'Register Your Shop'}
              </h1>
              <p className="text-[10px] font-bold text-[#55685F] dark:text-[#A2B3AA]">
                {language === 'bn'
                  ? 'এখনই নিবন্ধন করুন, বাকি তথ্য পরে যুক্ত করুন'
                  : 'Register now. Complete the rest later.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveDraft}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-[11px] font-bold text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C] dark:hover:text-white flex items-center gap-1 shadow-2xs active:scale-95 transition-all cursor-pointer"
              title="Save draft to complete later"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'bn' ? 'ড্রাফট' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Step Progression Bar & Profile Completeness */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  // Only allow jumping back or to reachable step
                  if (i + 1 <= step || areEssentialsFilled) {
                    setStep(i + 1);
                  }
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i + 1 === step
                    ? 'w-6 bg-[#063B2C] dark:bg-emerald-500'
                    : i + 1 < step
                    ? 'w-3 bg-emerald-700/60 dark:bg-emerald-600/60'
                    : 'w-2 bg-gray-200 dark:bg-white/10'
                }`}
                title={`Step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 text-[10px] font-black text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
            <span>{language === 'bn' ? 'প্রোফাইল' : 'Profile'}: {completeness}%</span>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Draft Notice Toast */}
        {draftSavedToast && (
          <div className="p-2.5 bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-md animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {language === 'bn'
                ? 'ড্রাফট সেভ হয়েছে! আপনি পরে ফিরে এসে এটি সম্পন্ন করতে পারেন।'
                : 'Progress saved! You can complete this anytime later.'}
            </span>
          </div>
        )}

        {/* Existing Draft Resume Banner */}
        {hasDraft && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-extrabold text-amber-900 dark:text-amber-200">
                  {language === 'bn' ? 'অসমাপ্ত নিবন্ধন ড্রাফট পাওয়া গেছে' : 'Unfinished registration found'}
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  {language === 'bn' ? 'আপনি কি পূর্বের কাজ পুনরায় শুরু করতে চান?' : 'Resume where you left off?'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleRestoreDraft}
                className="px-2.5 py-1.5 bg-amber-700 text-white rounded-xl text-[11px] font-black active:scale-95 cursor-pointer shadow-xs"
              >
                {language === 'bn' ? 'চালিয়ে যান' : 'Resume'}
              </button>
              <button
                onClick={handleDiscardDraft}
                className="px-2 py-1.5 text-gray-500 hover:text-gray-700 text-[10px] font-bold cursor-pointer"
              >
                {language === 'bn' ? 'মুছুন' : 'Discard'}
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/40 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* QUICK REGISTRATION SHORTCUT: Shown if Step 1-3 essentials are already filled */}
        {areEssentialsFilled && step < 4 && (
          <div className="p-3 bg-[#E6F4EA] dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
            <div>
              <p className="text-xs font-black text-[#063B2C] dark:text-emerald-300">
                {language === 'bn' ? 'মূল তথ্য দেওয়া সম্পন্ন!' : 'Essential Info Completed!'}
              </p>
              <p className="text-[10px] font-semibold text-[#44554E] dark:text-[#A2B3AA]">
                {language === 'bn'
                  ? 'আপনি চাইলে এখনই দোকান চালু করতে পারেন, ছবি ও অন্যান্য তথ্য পরে যোগ করতে পারবেন।'
                  : 'You can register now and complete photos/hours later from My Shop.'}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3.5 py-2 bg-[#063B2C] dark:bg-emerald-600 text-white rounded-xl text-xs font-black shrink-0 hover:bg-[#084D3A] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{language === 'bn' ? 'এখনই যোগ করুন' : 'Register Now'}</span>
            </button>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 1: OWNER INFORMATION (ESSENTIAL) */}
        {/* ========================================================== */}
        {step === 1 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                    {language === 'bn' ? 'মালিকের তথ্য' : 'Owner Information'}
                  </h2>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    * {language === 'bn' ? 'আবশ্যক তথ্য' : 'Essential Required Information'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Owner Full Name (মালিকের নাম) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Subrata Paul"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Calling Phone Number (মোবাইল নম্বর) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="+91 98320 12345"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  Used by Jalpaiguri citizens to place orders or verify stock via call.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#11241C] dark:text-white">
                    WhatsApp Number (হোয়াটসঅ্যাপ নম্বর)
                  </label>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                  </span>
                </div>
                <input
                  type="tel"
                  value={ownerWhatsapp}
                  onChange={(e) => setOwnerWhatsapp(e.target.value)}
                  placeholder="Leave blank to use calling number"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#11241C] dark:text-white">
                    Email Address (ইমেল আইডি)
                  </label>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                  </span>
                </div>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 2: SHOP IDENTITY & CATEGORY (ESSENTIAL) */}
        {/* ========================================================== */}
        {step === 2 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                    {language === 'bn' ? 'দোকানের নাম ও ক্যাটাগরি' : 'Shop Identity & Category'}
                  </h2>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    * {language === 'bn' ? 'আবশ্যক তথ্য' : 'Essential Required Information'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Shop Name in English (দোকানের নাম) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Paul Grocery & Departmental"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#11241C] dark:text-white">
                    Shop Name in Bengali (বাংলায় নাম)
                  </label>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                  </span>
                </div>
                <input
                  type="text"
                  value={shopNameBengali}
                  onChange={(e) => setShopNameBengali(e.target.value)}
                  placeholder="যেমন: পাল গ্রোসারি অ্যান্ড ভাণ্ডার"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Primary Category (মূল বিভাগ) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ShopCategory)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.labelEn} ({c.labelBn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#11241C] dark:text-white">
                    Popular Items / Keywords
                  </label>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                  </span>
                </div>
                <input
                  type="text"
                  value={subcategories}
                  onChange={(e) => setSubcategories(e.target.value)}
                  placeholder="e.g. Miniket Rice, Mustard Oil, Spices, Dairy"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 3: LOCATION & ADDRESS (ESSENTIAL) */}
        {/* ========================================================== */}
        {step === 3 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                    {language === 'bn' ? 'জলপাইগুড়ির ঠিকানা ও অবস্থান' : 'Jalpaiguri Location & Address'}
                  </h2>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    * {language === 'bn' ? 'আবশ্যক তথ্য' : 'Essential Required Information'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Locality / Area (এলাকা) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                >
                  {JALPAIGURI_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Shop Street Address (পূর্ণ ঠিকানা) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Holding No. 24, Kadamtala Main Road, Near Club"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#11241C] dark:text-white">
                    Nearby Landmark (নিকটবর্তী ল্যান্ডমার্ক)
                  </label>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                  </span>
                </div>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Dinbazar Post Office / Near Town Station"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  PIN Code (জলপাইগুড়ি পিনকোড) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="735101"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                  ✓ Verified Jalpaiguri District Service Area (735101 - 735228)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 4: TIMINGS & DELIVERY (OPTIONAL - CAN COMPLETE LATER) */}
        {/* ========================================================== */}
        {step === 4 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xs">
                  4
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                    {language === 'bn' ? 'সময়সূচী ও ডেলিভারি' : 'Operating Hours & Delivery'}
                  </h2>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {language === 'bn' ? 'ঐচ্ছিক - পরে যুক্ত করতে পারেন' : 'Optional - Default settings applied'}
                  </p>
                </div>
              </div>

              {/* Skip for now button */}
              <button
                onClick={() => setStep(5)}
                className="text-[11px] font-extrabold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'পরে করব / Skip' : 'Skip for now'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#11241C] dark:text-white mb-1">Opens at</label>
                  <input
                    type="text"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#11241C] dark:text-white mb-1">Closes at</label>
                  <input
                    type="text"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Weekly Off Day (সাপ্তাহিক ছুটি)
                </label>
                <select
                  value={weeklyOff}
                  onChange={(e) => setWeeklyOff(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                >
                  <option value="None">None (Open all 7 days)</option>
                  <option value="Sunday">Sunday (রবিবার)</option>
                  <option value="Thursday">Thursday (বৃহস্পতিবার)</option>
                  <option value="Tuesday">Tuesday (মঙ্গলবার)</option>
                  <option value="Wednesday">Wednesday (বুধবার)</option>
                </select>
              </div>

              {/* Delivery Settings */}
              <div className="p-3 bg-[#FAF8F5] dark:bg-white/5 rounded-2xl border border-[#E8E4DA] dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#063B2C] dark:text-emerald-400" />
                    <span className="font-bold text-[#11241C] dark:text-white">Home Delivery in Jalpaiguri</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={deliveryAvailable}
                    onChange={(e) => setDeliveryAvailable(e.target.checked)}
                    className="w-4 h-4 accent-[#063B2C]"
                  />
                </div>

                {deliveryAvailable && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E4DA] dark:border-white/10">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">Radius (km)</label>
                      <input
                        type="text"
                        value={deliveryRadiusKm}
                        onChange={(e) => setDeliveryRadiusKm(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">Min Order (₹)</label>
                      <input
                        type="text"
                        value={minOrderAmount}
                        onChange={(e) => setMinOrderAmount(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Merchant UPI ID (GPay / PhonePe / Paytm)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9832011094@okaxis or shopname@paytm"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* STEP 5: PHOTO & AI BIO (OPTIONAL - CAN COMPLETE LATER) */}
        {/* ========================================================== */}
        {step === 5 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs">
                  5
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                    {language === 'bn' ? 'ছবি ও এআই পরিচিতি' : 'Photos & Description'}
                  </h2>
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                    {language === 'bn' ? 'ঐচ্ছিক - ছবি না থাকলেও নিবন্ধন হবে' : 'Optional - Can be added later'}
                  </p>
                </div>
              </div>

              {/* Skip photo and complete */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="text-[11px] font-extrabold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'পরে ছবি দেব / Skip' : 'Skip photo for now'}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Photo Upload / URL */}
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Storefront Photo (দোকানের সামনের ছবি)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />

                <div className="mt-2 p-2.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200/60 dark:border-white/10 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {language === 'bn'
                      ? 'দোকানের ছবি পরে আপনার মার্চেন্ট ড্যাশবোর্ড থেকেও যুক্ত করতে পারবেন।'
                      : 'Your shop can be registered without a photo. You can add one later from My Shop.'}
                  </span>
                </div>
              </div>

              {/* Bio & AI Auto-write */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#11241C] dark:text-white">
                    Shop Description (দোকানের পরিচিতি)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={isGeneratingDescription}
                    className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-[#E6F4EA] dark:bg-emerald-950/70 hover:bg-[#D5EADB] px-2 py-0.5 rounded-lg border border-emerald-300/50 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isGeneratingDescription ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>AI Auto-Write</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell Jalpaiguri citizens about your products, specials, and quality guarantee..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                ✓ By registering, you confirm that your shop operates in Jalpaiguri District and serves local customers.
              </div>
            </div>
          </div>
        )}

        {/* Wizard Bottom Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => prev - 1)}
              className="py-3 px-4 rounded-2xl bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white flex items-center gap-1 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'পূর্ববর্তী' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <div className="flex items-center gap-2 ml-auto">
              {/* If on step 4, show skip button next to continue */}
              {step === 4 && (
                <button
                  onClick={() => setStep(5)}
                  className="py-3 px-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#55685F] dark:text-[#A2B3AA] hover:text-[#11241C] cursor-pointer"
                >
                  {language === 'bn' ? 'বাদ দিন' : 'Skip'}
                </button>
              )}
              <button
                onClick={handleNext}
                className="py-3 px-6 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Continue'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="py-3 px-6 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-md ml-auto disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Shop...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'নিবন্ধন সম্পন্ন করুন' : 'Register & Launch'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS COMPLETION MODAL */}
      {createdShopResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#11241C] dark:text-white">
                {language === 'bn' ? 'অভিনন্দন! আপনার দোকান নিবন্ধিত' : 'Shop Registered Successfully!'}
              </h3>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {createdShopResult.name} ({createdShopResult.locality})
              </p>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-1">
                {language === 'bn'
                  ? 'আপনার দোকান এখন জলপাইগুড়ি কানেক্টে দৃশ্যমান। বাকি বিবরণ আপনি যেকোনো সময় সম্পন্ন করতে পারবেন।'
                  : 'Your shop is now live on Jalpaiguri Connect. You can complete products and photos anytime.'}
              </p>
            </div>

            {/* Completeness Checklist */}
            <div className="bg-[#FAF8F5] dark:bg-white/5 p-3 rounded-2xl border border-[#E8E4DA] dark:border-white/10 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between font-black text-[11px] text-[#11241C] dark:text-white pb-1 border-b border-gray-200 dark:border-white/10">
                <span>{language === 'bn' ? 'প্রোফাইল সমাপ্তি' : 'Profile Completion'}</span>
                <span className="text-emerald-600">{completeness}%</span>
              </div>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                ✓ {language === 'bn' ? 'মালিক ও দোকানের বিবরণ সম্পূর্ণ' : 'Owner & Location registered'}
              </p>
              <p className="text-[10px] text-[#55685F] dark:text-[#A2B3AA] font-semibold flex items-center gap-1">
                {photoUrl ? '✓ Photo added' : '○ Add storefront photo (+10%)'}
              </p>
              <p className="text-[10px] text-[#55685F] dark:text-[#A2B3AA] font-semibold flex items-center gap-1">
                ○ Add items & products to your catalogue (+15%)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate('merchant-dashboard', { shopId: createdShopResult.id })}
                className="w-full py-3 bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white rounded-2xl text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Store className="w-4 h-4" />
                <span>{language === 'bn' ? 'মার্চেন্ট ড্যাশবোর্ড খুলুন' : 'Open Merchant Dashboard'}</span>
              </button>

              <button
                onClick={() => navigate('shop-detail', { shopId: createdShopResult.id })}
                className="w-full py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-[#11241C] dark:text-white rounded-2xl text-xs font-bold hover:bg-gray-100 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'দোকানের পেজ দেখুন' : 'View Shop in Marketplace'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
