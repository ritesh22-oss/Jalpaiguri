import React, { useState } from 'react';
import {
  User,
  MapPin,
  Heart,
  ShieldCheck,
  ShieldAlert,
  Globe,
  LogOut,
  ChevronRight,
  FileSpreadsheet,
  Wrench,
  Sparkles,
  LayoutDashboard,
  LogIn,
  Phone,
  ArrowRight,
  UserPlus,
  Edit3,
  X,
  Check,
  Droplet,
  Shield,
  Calendar,
  Mail,
  Lock,
  RotateCcw,
  HelpCircle,
  Landmark,
  Radio,
  Sun,
  Moon,
  Navigation,
  Loader2,
  RefreshCw,
  Database,
  Store,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useLocation } from '../../context/LocationContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { BloodGroup, isAuthorizedAdminEmail } from '../../types';
import { isFirebaseConfigured } from '../../lib/firebase';

export const ProfileView: React.FC = () => {
  const {
    user,
    firebaseUser,
    logout,
    toggleRole,
    updateProfile
  } = useAuth();
  const { navigate } = useNav();
  const { civicReports, savedItemIds } = useApp();
  const { language, setLanguage, isBengali, t, tLocality, formatNumber } = useLanguage();
  const {
    location,
    requestCurrentLocation,
    setIsLocationSelectorOpen,
    isWithinServiceRegion,
    distanceToServiceRegionKm
  } = useLocation();

  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [locationRefreshSuccess, setLocationRefreshSuccess] = useState(false);

  const handleRefreshLocation = async () => {
    setIsRefreshingLocation(true);
    await requestCurrentLocation();
    setIsRefreshingLocation(false);
    setLocationRefreshSuccess(true);
    setTimeout(() => setLocationRefreshSuccess(false), 3500);
  };

  const isOfficialAdmin = isAuthorizedAdminEmail(user?.email || firebaseUser?.email);
  const { isDarkMode, toggleTheme } = useTheme();

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAge, setEditAge] = useState<number>(user?.age || 25);
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(user?.gender || 'Male');
  const [editBloodGroup, setEditBloodGroup] = useState<BloodGroup>(user?.bloodGroup || 'O+');
  const [editLocation, setEditLocation] = useState(user?.location || 'Kadamtala, Jalpaiguri');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isDonor, setIsDonor] = useState(user?.isBloodDonor || false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "I don't know"];

  const genderOptions = [
    { id: 'Male' as const, label: isBengali ? 'পুরুষ' : 'Male', symbol: '♂', bg: 'bg-blue-100 text-blue-700' },
    { id: 'Female' as const, label: isBengali ? 'মহিলা' : 'Female', symbol: '♀', bg: 'bg-pink-100 text-pink-700' },
    { id: 'Other' as const, label: isBengali ? 'অন্যান্য' : 'Other', symbol: '⚧', bg: 'bg-purple-100 text-purple-700' },
    { id: 'Prefer not to say' as const, label: isBengali ? 'গোপনীয়' : 'Private', symbol: '🔒', bg: 'bg-slate-100 text-slate-700' }
  ];

  const handleOpenEdit = () => {
    if (user) {
      setEditName(user.name || '');
      setEditAge(user.age || 25);
      setEditGender(user.gender || 'Male');
      setEditBloodGroup(user.bloodGroup || 'O+');
      setEditLocation(user.location || 'Kadamtala, Jalpaiguri');
      setEditPhone(user.phone || '');
      setIsDonor(Boolean(user.isBloodDonor));
      setIsEditModalOpen(true);
      setSaveSuccess(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    if (updateProfile) {
      await updateProfile({
        name: editName.trim(),
        age: Number(editAge),
        gender: editGender,
        bloodGroup: editBloodGroup,
        location: editLocation.trim(),
        phone: editPhone.trim(),
        isBloodDonor: isDonor
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setIsEditModalOpen(false);
      setSaveSuccess(false);
    }, 800);
  };

  const handleLanguageChange = (lang: 'en' | 'bn') => {
    setLanguage(lang);
    if (updateProfile) {
      updateProfile({ language: lang === 'en' ? 'English' : 'বাংলা' });
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('jpg_has_onboarded');
    await logout();
    navigate('onboarding');
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] pb-28 select-none transition-colors">
      <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0B132B]/90 backdrop-blur-md border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-5 pt-6 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
          {isBengali ? 'নাগরিক প্রোফাইল' : 'Citizen Profile'}
        </h1>
        <div className="flex items-center gap-2">
          {/* Simple Light / Dark Mode Toggle Icon */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#55685F] dark:text-[#A2B3AA] hover:text-[#2563EB] dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer shadow-xs"
            title={isDarkMode ? (isBengali ? 'লাইট মোডে পরিবর্তন করুন' : 'Switch to Bright Mode') : (isBengali ? 'ডার্ক মোডে পরিবর্তন করুন' : 'Switch to Dark Mode')}
            aria-label="Toggle Bright/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            isOfficialAdmin ? (
              <button
                onClick={() => navigate('admin-dashboard')}
                className="text-xs font-bold text-white bg-[#2563EB] dark:bg-blue-600 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-300" />
                <span>{isBengali ? 'অ্যাডমিন প্যানেল' : 'Admin Console'}</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-[#2563EB] dark:text-[#38BDF8] bg-[#eff6ff] dark:bg-blue-950/60 px-3 py-1 rounded-full border border-[#C3E6D0] dark:border-blue-800/60">
                {isBengali ? 'যাচাইকৃত নাগরিক' : 'Citizen Verified'}
              </span>
            )
          ) : (
            <button
              onClick={() => navigate('auth')}
              className="text-xs font-bold text-white bg-[#2563EB] dark:bg-blue-600 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isBengali ? 'লগইন' : 'Sign In'}</span>
            </button>
          )}
        </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-5 space-y-5">
        {/* User Card OR Guest Card */}
        {user ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-5 border border-[#E8E4DA] dark:border-white/10 shadow-xs space-y-4 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                {firebaseUser?.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={user?.name || 'User'}
                    className="w-16 h-16 rounded-3xl object-cover shadow-sm border border-[#E8E4DA] dark:border-white/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-3xl bg-[#2563EB] dark:bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'J'}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-extrabold text-[#11241C] dark:text-white leading-tight">{user?.name}</h2>
                  <p className="text-xs font-semibold text-[#55685F] dark:text-blue-300 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                    <span>{user?.location ? tLocality(user.location) : (isBengali ? 'জলপাইগুড়ি, পঃবঃ' : 'Jalpaiguri, WB')}</span>
                  </p>
                  {(user?.email || firebaseUser?.email) && (
                    <p className="text-[11px] font-semibold text-[#55685F] dark:text-blue-300 mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#2563EB] dark:text-[#38BDF8]" />
                      <span className="truncate max-w-[170px]">{user?.email || firebaseUser?.email}</span>
                    </p>
                  )}
                  {user?.phone && (
                    <p className="text-[11px] font-semibold text-[#8C9B93] dark:text-blue-400 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#2563EB] dark:text-[#38BDF8]" />
                      <span>{formatNumber(user.phone)}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={handleOpenEdit}
                className="py-1.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/15 text-[#2563EB] dark:text-[#38BDF8] hover:bg-[#eff6ff] dark:hover:bg-[#1F312A] hover:scale-105 active:scale-95 transition-all duration-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title={isBengali ? 'প্রোফাইল সম্পাদনা করুন' : 'Edit Your Profile Manually'}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isBengali ? 'সম্পাদনা' : 'Edit'}</span>
              </button>
            </div>

            {/* Profile Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0ECE1] dark:border-white/10">
              <span className="text-[11px] font-bold text-[#D9383A] dark:text-red-400 bg-[#FFEBEA] dark:bg-red-950/50 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-transparent dark:border-red-900/40">
                <Droplet className="w-3 h-3 fill-[#D9383A] dark:fill-red-400" />
                <span>{isBengali ? 'রক্তের গ্রুপ:' : 'Blood:'} {user?.bloodGroup || 'O+'}</span>
              </span>

              {user?.age && (
                <span className="text-[11px] font-bold text-[#854D0E] dark:text-amber-300 bg-[#FEF9C3] dark:bg-amber-950/40 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-transparent dark:border-amber-900/40">
                  <Calendar className="w-3 h-3" />
                  <span>{isBengali ? `বয়স: ${formatNumber(user.age)} বছর` : `Age: ${user.age} yrs`}</span>
                </span>
              )}

              {user?.gender && (
                <span className="text-[11px] font-bold text-[#1E293B] dark:text-[#C5D2CB] bg-[#F1F5F9] dark:bg-[#1C2A24] px-2.5 py-1 rounded-xl">
                  {user.gender === 'Male' && (isBengali ? '♂ পুরুষ' : '♂ Male')}
                  {user.gender === 'Female' && (isBengali ? '♀ মহিলা' : '♀ Female')}
                  {user.gender === 'Other' && (isBengali ? '⚧ অন্যান্য' : '⚧ Other')}
                  {user.gender === 'Prefer not to say' && (isBengali ? '🔒 গোপনীয়' : '🔒 Private')}
                </span>
              )}

              <span className="text-[11px] font-bold text-[#2563EB] dark:text-[#38BDF8] bg-[#eff6ff] dark:bg-blue-950/60 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{isBengali ? 'যাচাইকৃত নাগরিক' : 'Verified Citizen'}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#007AFF] to-[#1E3A8A] text-white rounded-3xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider text-[#A7D7B9]">
                {isBengali ? 'অতিথি মোড' : 'Guest Mode'}
              </span>
              <span className="text-xs text-white/80">MYJPG</span>
            </div>
            <h2 className="text-lg font-black leading-tight">
              {isBengali ? 'সম্পূর্ণ নাগরিক সেবা পেতে লগইন করুন' : 'Sign In to unlock full civic services'}
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              {isBengali
                ? 'আপনার গুগল অ্যাকাউন্ট, ফোন ওটিপি বা ইমেল দিয়ে প্রবেশ করে অভিযোগ ট্র্যাকিং, স্বেচ্ছাসেবী সেবা ও স্থানীয় সুবিধাসমূহ গ্রহণ করুন।'
                : 'Log in with your Google Account, Phone OTP, or Email to track requests, volunteer, and book local services.'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => navigate('auth')}
                className="flex-1 bg-white text-[#2563EB] font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs hover:bg-[#FAF8F5] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isBengali ? 'লগইন / সাইন আপ' : 'Sign In / Sign Up'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Section: Safety & SOS Hub */}
        <div className="mb-2 pl-2">
           <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
             {isBengali ? 'সুরক্ষা ও জরুরি সহায়তা' : 'Safety & Emergency'}
           </h2>
        </div>
        <div className="bg-gradient-to-r from-[#FFEBEA] to-[#FFF5F5] dark:from-[#331515] dark:to-[#240F0F] border-2 border-[#FECDCA] dark:border-red-900/60 rounded-3xl p-4 shadow-xs space-y-3 transition-colors mb-6">
          <div
            onClick={() => navigate('safety-sos')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#D9383A] text-white flex items-center justify-center shadow-sm shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-[#8A1A1C] dark:text-red-300 tracking-tight">
                    {isBengali ? '🆘 সুরক্ষা এসওএস হাব' : '🆘 Safety SOS Hub'}
                  </h3>
                  <span className="text-[10px] font-bold bg-[#D9383A] text-white px-1.5 py-0.2 rounded-full">
                    112
                  </span>
                </div>
                <p className="text-[11px] text-[#632021] dark:text-red-200/80 font-medium mt-0.5">
                  {isBengali ? 'হোল্ড-এসওএস, ঝাঁকুনি শনাক্তকরণ ও জরুরি যোগাযোগ' : 'Hold-to-SOS, Shake Detection & Trusted Contacts'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#D9383A] dark:text-red-400 shrink-0" />
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[#FECDCA]/60 dark:border-red-900/40">
            <button
              onClick={() => navigate('safety-sos')}
              className="flex-1 bg-[#D9383A] hover:bg-[#B92628] hover:scale-105 hover:shadow-md text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isBengali ? 'এসওএস হাব খুলুন' : 'Open SOS Hub'}</span>
            </button>
            <button
              onClick={() => navigate('emergency')}
              className="flex-1 bg-white dark:bg-[#0F172A] border border-[#FECDCA] dark:border-red-900/50 text-[#D9383A] dark:text-red-400 hover:bg-[#FFEBEA] dark:hover:bg-red-950/40 hover:scale-105 hover:shadow-md text-xs font-bold py-2.5 px-3 rounded-xl active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>{isBengali ? 'জরুরি সেবাসমূহ' : 'Emergency Options'}</span>
            </button>
          </div>
        </div>

        {/* Section: Account */}
        <div className="mt-6 mb-2 pl-2">
           <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</h2>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E8E4DA] dark:border-white/10 shadow-xs divide-y divide-[#F0ECE1] dark:divide-white/10 overflow-hidden transition-colors mb-6">
          <div
            onClick={() => navigate('report-tracking')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-blue-900/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 ease-out active:bg-blue-50 dark:active:bg-blue-900/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#eff6ff] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#38BDF8] flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'আমার পৌর অভিযোগসমূহ' : 'My Civic Reports'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? `${formatNumber(civicReports.length)} টি জমা করা অভিযোগ` : `${civicReports.length} reported issues`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>

          <div
            onClick={() => navigate('offer-services')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-blue-900/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 ease-out active:bg-blue-50 dark:active:bg-blue-900/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'কর্মী হিসেবে যোগ দিন / সেবা প্রদান করুন' : 'Join as Worker / Offer Services'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? 'ইলেকট্রিশিয়ান, প্লাম্বার বা কারিগর হিসেবে নিবন্ধন' : 'Register as electrician, plumber, etc.'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>
          
        {/* Section: Emergency Services */}
        <div className="mb-2 pl-2">
           <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Emergency & Community</h2>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E8E4DA] dark:border-white/10 shadow-xs divide-y divide-[#F0ECE1] dark:divide-white/10 overflow-hidden transition-colors mb-6">
          <div
            onClick={() => navigate('emergency-blood-finder')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-blue-900/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 ease-out active:bg-blue-50 dark:active:bg-blue-900/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Droplet className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'জরুরি রক্ত অনুসন্ধানকারী' : 'Emergency Blood Finder'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? 'আশেপাশে রক্তদাতা খুঁজুন বা অনুরোধ করুন' : 'Find donors nearby or post request'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>

          <div
            onClick={() => navigate('donor-settings')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-blue-900/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 ease-out active:bg-blue-50 dark:active:bg-blue-900/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'রক্তদাতা হিসেবে যোগ দিন' : 'Become a Blood Donor'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? 'আপনার জীবনদানকারী পদক্ষেপ' : 'Register to save lives in emergencies'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${user?.isBloodDonor ? 'bg-green-500' : 'bg-gray-300'}`} />
              <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
            </div>
          </div>

          <div
            onClick={() => {
              window.dispatchEvent(new CustomEvent('replay-app-tour'));
              navigate('home'); // Redirect to home to see the tour
            }}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-blue-900/20 hover:scale-[1.01] cursor-pointer transition-all duration-300 ease-out active:bg-blue-50 dark:active:bg-blue-900/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-[#38BDF8] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'অ্যাপ ট্যুর (কীভাবে ব্যবহার করবেন)' : 'App Tour Guide'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? 'MYJPG কীভাবে কাজ করে শিখুন' : 'Learn how to use MYJPG features'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>
        </div>

        {/* Section: My Shop */}
        <div className="mb-2 pl-2">
           <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">My Shop</h2>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E8E4DA] dark:border-white/10 shadow-xs divide-y divide-[#F0ECE1] dark:divide-white/10 overflow-hidden transition-colors mb-6">
          <div
            onClick={() => navigate('merchant-dashboard')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'দোকানদার প্ল্যাটফর্ম ও মার্চেন্ট হাব' : 'Shop Owner Platform & Merchant Hub'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? 'দোকান পরিচালনা, পণ্য ক্যাটালগ বা নতুন দোকান যোগ করুন' : 'Manage your shop catalog or register new shop'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>

          <div
            onClick={() => navigate('shop-marketplace')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#eff6ff] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#38BDF8] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'জলপাইগুড়ি স্থানীয় বাজার ও দোকান' : 'Jalpaiguri Local Marketplace'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? '৩৪+ স্থানীয় দোকান, পণ্য অনুসন্ধান ও সরাসরি হোয়াটসঅ্যাপ' : '34+ verified local shops, product search & WhatsApp'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>
        </div>

        {/* Section: Help & Support */}
        <div className="mb-2 pl-2">
           <h2 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Help & Support</h2>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-[#E8E4DA] dark:border-white/10 shadow-xs divide-y divide-[#F0ECE1] dark:divide-white/10 overflow-hidden transition-colors mb-6">
          <div
            onClick={() => navigate('government')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#2563EB] dark:text-[#38BDF8] flex items-center justify-center">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'সরকারি নাগরিক সেবা কেন্দ্র' : 'Government Services Hub'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? 'পৌর কর, জন্ম সনদ, জমি রেকর্ড ও সরকারি প্রকল্প' : 'Property tax, certificates, land records & schemes'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>

          <div
            onClick={() => navigate('faq')}
            className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  {isBengali ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">
                  {isBengali ? 'জলপাইগুড়ি কানেক্ট সম্পর্কে প্রয়োজনীয় উত্তর' : 'Find quick answers about MYJPG'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
          </div>

          {/* New MYJPG Helpdesk Support Card */}
          <div className="p-4 flex flex-col gap-3 hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#eff6ff] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#38BDF8] flex items-center justify-center shadow-xs border border-blue-100 dark:border-blue-900/40">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                    {isBengali ? 'MYJPG হেল্পডেস্ক' : 'MYJPG Helpdesk'}
                  </h3>
                  <p className="text-[11px] font-bold text-[#55685F] dark:text-[#A2B3AA]">
                    +91 9091563912
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <a
                href="tel:+919091563912"
                className="flex-1 py-2 px-3 rounded-xl bg-[#eff6ff] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[#2563EB] dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isBengali ? 'কল করুন' : 'Call'}</span>
              </a>
              <a
                href="https://wa.me/919091563912"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] dark:text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-4 border border-[#E8E4DA] dark:border-white/10 shadow-xs flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#55685F] dark:text-[#A2B3AA]" />
            <span className="text-xs font-bold text-[#11241C] dark:text-white">
              {isBengali ? 'ভাষা পরিবর্তন (Language)' : 'Language / ভাষা'}
            </span>
          </div>
          <div className="flex gap-1 bg-[#FAF8F5] dark:bg-[#131F1A] p-1 rounded-xl border border-[#D2CEBE] dark:border-white/10">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                language === 'en' ? 'bg-[#2563EB] dark:bg-blue-600 text-white' : 'text-[#55685F] dark:text-[#A2B3AA]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('bn')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                language === 'bn' ? 'bg-[#2563EB] dark:bg-blue-600 text-white' : 'text-[#55685F] dark:text-[#A2B3AA]'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Authentication Actions */}
        {user ? (
          <div className="space-y-2">
            <button
              onClick={handleOpenEdit}
              className="w-full py-3 bg-white dark:bg-[#0F172A] border border-[#D2CEBE] dark:border-white/15 text-[#2563EB] dark:text-[#38BDF8] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] cursor-pointer shadow-2xs transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isBengali ? 'প্রোফাইল তথ্য ম্যানুয়ালি সম্পাদন করুন' : 'Edit My Profile Manually'}</span>
            </button>

            <button
              onClick={() => navigate('auth')}
              className="w-full py-3 bg-white dark:bg-[#0F172A] border border-[#D2CEBE] dark:border-white/15 text-[#2563EB] dark:text-[#38BDF8] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A] cursor-pointer transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isBengali ? 'অন্য অ্যাকাউন্টে প্রবেশ বা পরিবর্তন করুন' : 'Switch / Sign into Another Account'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-white dark:bg-[#0F172A] border border-[#D9383A]/30 text-[#D9383A] dark:text-red-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FFEBEA] dark:hover:bg-red-950/30 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{isBengali ? 'জলপাইগুড়ি কানেক্ট থেকে লগআউট' : 'Log Out of MYJPG'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('auth')}
            className="w-full py-3.5 bg-[#2563EB] dark:bg-blue-600 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-700 hover:scale-[1.01] active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isBengali ? 'লগইন / সাইন আপ পেজ খুলুন' : 'Open Sign In / Sign Up Page'}</span>
          </button>
        )}

        {/* Profile Footer */}
        <div className="text-center py-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Made with <span className="text-red-500">♥</span> for Jalpaiguri
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-wider">
            MYJPG • Your Jalpaiguri, Connected.
          </p>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border border-transparent dark:border-white/10 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#2563EB] dark:text-[#38BDF8]" />
                <h3 className="font-extrabold text-base text-[#11241C] dark:text-white">
                  {isBengali ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] dark:bg-white/10 flex items-center justify-center text-[#64748B] dark:text-white hover:text-[#11241C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{isBengali ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile updated successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-[#F8FAFC] uppercase mb-1">
                  {isBengali ? 'পুরো নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/15 rounded-2xl p-3 text-xs font-bold text-[#11241C] dark:text-white focus:border-[#007AFF] dark:focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Age in Years */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#11241C] dark:text-[#F8FAFC] uppercase">
                    {isBengali ? (
                      <>বয়স: <span className="text-[#2563EB] dark:text-[#38BDF8]">{formatNumber(editAge)} বছর</span></>
                    ) : (
                      <>Age: <span className="text-[#2563EB] dark:text-[#38BDF8]">{editAge} years</span></>
                    )}
                  </label>
                </div>
                <input
                  type="number"
                  min={14}
                  max={100}
                  value={editAge}
                  onChange={(e) => setEditAge(parseInt(e.target.value) || 18)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/15 rounded-2xl p-3 text-xs font-bold text-[#11241C] dark:text-white focus:border-[#007AFF] dark:focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Gender with Icons */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-[#F8FAFC] uppercase mb-1.5">
                  {isBengali ? 'লিঙ্গ *' : 'Gender *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEditGender(opt.id)}
                      className={`p-2.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
                        editGender === opt.id
                          ? 'bg-[#eff6ff] dark:bg-blue-950/60 border-[#007AFF] dark:border-blue-500 text-[#2563EB] dark:text-[#38BDF8] font-extrabold shadow-2xs'
                          : 'bg-[#FAF8F5] dark:bg-[#131F1A] border-[#D2CEBE] dark:border-white/15 text-[#55685F] dark:text-[#A2B3AA] font-bold hover:bg-white dark:hover:bg-[#1F312A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold ${opt.bg}`}>
                          {opt.symbol}
                        </span>
                        <span className="text-xs">{opt.label}</span>
                      </div>
                      {editGender === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-[#F8FAFC] uppercase mb-1.5">
                  {isBengali ? 'রক্তের গ্রুপ *' : 'Blood Group *'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setEditBloodGroup(bg)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        editBloodGroup === bg
                          ? 'bg-[#FFEBEA] dark:bg-red-950/60 border-[#D9383A] text-[#D9383A] dark:text-red-400'
                          : 'bg-[#FAF8F5] dark:bg-[#131F1A] border-[#D2CEBE] dark:border-white/15 text-[#11241C] dark:text-white hover:bg-white dark:hover:bg-[#1F312A]'
                      }`}
                    >
                      {bg === "I don't know" && isBengali ? 'জানা নেই' : bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-[#F8FAFC] uppercase mb-1">
                  {isBengali ? 'জলপাইগুড়ির এলাকা / ওয়ার্ড' : 'Location / Ward in Jalpaiguri'}
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/15 rounded-2xl p-3 text-xs font-bold text-[#11241C] dark:text-white focus:border-[#007AFF] dark:focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#11241C] dark:text-[#F8FAFC] uppercase mb-1">
                  {isBengali ? 'যোগাযোগের ফোন নম্বর' : 'Contact Phone'}
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98320 XXXXX"
                  className="w-full bg-[#FAF8F5] dark:bg-[#131F1A] border border-[#D2CEBE] dark:border-white/15 rounded-2xl p-3 text-xs font-semibold text-[#11241C] dark:text-white focus:border-[#007AFF] dark:focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Blood Donor Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFEBEA] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-900/50">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#D9383A] fill-[#D9383A]" />
                  <span className="text-xs font-extrabold text-[#D9383A] dark:text-red-300">
                    {isBengali ? 'জরুরি রক্তদাতা হিসেবে যোগ দিন' : 'Register as Emergency Blood Donor'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isDonor}
                  onChange={(e) => setIsDonor(e.target.checked)}
                  className="w-4 h-4 accent-[#D9383A] rounded-md cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-[#55685F] dark:text-[#A2B3AA] rounded-2xl bg-[#F1F5F9] dark:bg-white/10 hover:bg-[#E2E8F0] cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-extrabold text-white rounded-2xl bg-[#2563EB] dark:bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer active:scale-95 active:bg-[#38BDF8] active:border-[#38BDF8] transition-all transition-all"
                >
                  {isBengali ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
