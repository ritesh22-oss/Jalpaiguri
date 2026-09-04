import React, { useState } from 'react';
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
  CreditCard
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

const CATEGORIES: { key: ShopCategory; labelEn: string; labelBn: string }[] = [
  { key: 'Grocery & Departmental', labelEn: 'Grocery & Departmental', labelBn: 'মুদিখানা ও ডিপার্টমেন্টাল' },
  { key: 'Pharmacy & Medical', labelEn: 'Pharmacy & Medical', labelBn: 'ওষুধ ও চিকিৎসাসামগ্রী' },
  { key: 'Bakery & Sweets', labelEn: 'Bakery & Sweets', labelBn: 'বেকারি ও মিষ্টি' },
  { key: 'Electronics & Mobile', labelEn: 'Electronics & Mobile', labelBn: 'ইলেকট্রনিক্স ও মোবাইল' },
  { key: 'Clothing & Garments', labelEn: 'Clothing & Garments', labelBn: 'পোশাক ও বস্ত্র' },
  { key: 'Hardware & Electricals', labelEn: 'Hardware & Electricals', labelBn: 'হার্ডওয়্যার ও ইলেকট্রিক্যাল' },
  { key: 'Books & Stationery', labelEn: 'Books & Stationery', labelBn: 'বই ও স্টেশনারি' },
  { key: 'Fresh Meat & Fish', labelEn: 'Fresh Meat & Fish', labelBn: 'তাজা মাছ ও মাংস' },
  { key: 'Dairy & Milk', labelEn: 'Dairy & Milk', labelBn: 'দুধ ও দুগ্ধজাত' },
  { key: 'Personal Care & Salon', labelEn: 'Personal Care & Salon', labelBn: 'পার্সোনাল কেয়ার ও সেলুন' },
  { key: 'Other', labelEn: 'Other Services', labelBn: 'অন্যান্য সেবা' }
];

export const AddShopWizardView: React.FC = () => {
  const { navigate, goBack } = useNav();
  const { user, firebaseUser } = useAuth();
  const { language } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '+91 ');
  const [ownerWhatsapp, setOwnerWhatsapp] = useState(user?.phone || '+91 ');
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
      }
    } catch (err) {
      console.warn('AI generator error:', err);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!ownerName.trim() || !ownerPhone.trim()) {
        setErrorMessage('Owner Name and Phone Number are required.');
        return;
      }
    }
    if (step === 2) {
      if (!shopName.trim()) {
        setErrorMessage('Shop Name is required.');
        return;
      }
    }
    if (step === 3) {
      if (!address.trim()) {
        setErrorMessage('Shop Street Address is required.');
        return;
      }
      const pinNum = parseInt(pincode.replace(/\D/g, ''), 10);
      if (isNaN(pinNum) || pinNum < 735101 || pinNum > 735228) {
        setErrorMessage('Pincode must be within Jalpaiguri District (735101 - 735228).');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: shopName,
        nameBengali: shopNameBengali || undefined,
        category,
        subcategories: subcategories ? subcategories.split(',').map(s => s.trim()) : [],
        description: description || `Welcome to ${shopName} in ${locality}, Jalpaiguri.`,
        locality,
        address,
        landmark,
        pincode,
        phone: ownerPhone,
        whatsappNumber: ownerWhatsapp || ownerPhone,
        email: ownerEmail || user?.email,
        ownerId: user?.id || firebaseUser?.uid || 'merchant-user',
        ownerName,
        openingHours: {
          open: openTime,
          close: closeTime,
          weeklyOff: weeklyOff !== 'None' ? weeklyOff : undefined
        },
        deliveryAvailable,
        deliveryRadiusKm: deliveryAvailable ? parseFloat(deliveryRadiusKm) || 3.0 : 0,
        minOrderAmount: deliveryAvailable ? parseFloat(minOrderAmount) || 0 : 0,
        freeDeliveryAbove: deliveryAvailable ? parseFloat(freeDeliveryAbove) || 0 : 0,
        paymentMethods: ['Cash', 'UPI'],
        upiId: upiId || undefined,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
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
        // Save created shop ID in local storage for quick access
        localStorage.setItem('jpg_current_shop_id', createdShop.id);
        alert(language === 'bn' ? 'দোকান সফলভাবে নিবন্ধিত হয়েছে! মার্চেন্ট ড্যাশবোর্ডে প্রবেশ করা হচ্ছে।' : 'Your shop has been registered successfully! Opening Merchant Dashboard.');
        navigate('merchant-dashboard', { shopId: createdShop.id });
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || 'Failed to register shop. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while creating shop.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0F1A15]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/60 dark:border-white/10 transition-colors">
        <div className="flex items-center gap-2.5">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-xs hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base font-black text-[#11241C] dark:text-white leading-tight">
              {language === 'bn' ? 'আপনার দোকান যোগ করুন' : 'Register Your Shop'}
            </h1>
            <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#A2B3AA]">
              Step {step} of {totalSteps}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i + 1 <= step ? 'w-4 bg-[#063B2C] dark:bg-emerald-500' : 'w-2 bg-gray-200 dark:bg-white/10'
              }`}
            />
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/40 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: OWNER INFORMATION */}
        {step === 1 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                1
              </div>
              <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                {language === 'bn' ? 'মালিকের তথ্য' : 'Shop Owner Information'}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Owner Full Name (মালিকের নাম) *
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
                  Mobile Calling Number (মোবাইল নম্বর) *
                </label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="+91 98320 12345"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  WhatsApp Number (হোয়াটসঅ্যাপ নম্বর)
                </label>
                <input
                  type="tel"
                  value={ownerWhatsapp}
                  onChange={(e) => setOwnerWhatsapp(e.target.value)}
                  placeholder="+91 98320 12345"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Email Address (ঐচ্ছিক)
                </label>
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

        {/* STEP 2: SHOP IDENTITY */}
        {step === 2 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                2
              </div>
              <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                {language === 'bn' ? 'দোকানের পরিচয় ও বিভাগ' : 'Shop Identity & Category'}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Shop Name (English) *
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
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Shop Name (বাংলায়)
                </label>
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
                  Primary Category (মূল বিভাগ) *
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
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Subcategories / Keywords (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={subcategories}
                  onChange={(e) => setSubcategories(e.target.value)}
                  placeholder="e.g. Rice, Spices, Mustard Oil, Pulses, Dairy"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: LOCATION & JALPAIGURI ADDRESS */}
        {step === 3 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                3
              </div>
              <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                {language === 'bn' ? 'জলপাইগুড়ির ঠিকানা ও অবস্থান' : 'Jalpaiguri Location & Address'}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Locality / Area (এলাকা) *
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                >
                  {JALPAIGURI_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Shop Street Address (পূর্ণ ঠিকানা) *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Shop No. 12, Kadamtala Main Market"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Nearby Landmark (নিকটবর্তী ল্যান্ডমার্ক)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Kadamtala Club / Near Town Station"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  PIN Code (জলপাইগুড়ি পিনকোড) *
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="735101"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
                  ✓ Verified Jalpaiguri District Service Area
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TIMINGS & DELIVERY */}
        {step === 4 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                4
              </div>
              <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                {language === 'bn' ? 'সময়সূচী ও ডেলিভারি' : 'Operating Hours & Delivery'}
              </h2>
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
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">Weekly Off Day (সাপ্তাহিক ছুটি)</label>
                <select
                  value={weeklyOff}
                  onChange={(e) => setWeeklyOff(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none"
                >
                  <option value="None">None (Open all 7 days)</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Tuesday">Tuesday</option>
                </select>
              </div>

              {/* Delivery Toggle */}
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
                  Merchant UPI ID (GPay, PhonePe, Paytm পেমেন্ট)
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

        {/* STEP 5: PHOTOS & AI GENERATOR */}
        {step === 5 && (
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                5
              </div>
              <h2 className="text-sm font-black text-[#11241C] dark:text-white">
                {language === 'bn' ? 'ছবি ও এআই পরিচিতি' : 'Photos & AI Description'}
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#11241C] dark:text-white mb-1">
                  Storefront Photo URL (দোকানের সামনের ছবি)
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

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
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell Jalpaiguri citizens about your products, specials, and quality guarantee..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 rounded-xl font-semibold text-[#11241C] dark:text-white focus:outline-none focus:border-[#063B2C]"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                ✓ By registering, you confirm that your shop is located in Jalpaiguri District and conforms to municipal commercial standards.
              </div>
            </div>
          </div>
        )}

        {/* Wizard Bottom Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="py-3 px-4 rounded-2xl bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#11241C] dark:text-white flex items-center gap-1 hover:bg-gray-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="py-3 px-6 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-xs ml-auto"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
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
                  <span>Register & Launch</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
