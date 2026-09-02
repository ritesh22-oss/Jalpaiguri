import React, { useState } from 'react';
import {
  ChevronLeft,
  User as UserIcon,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  Check,
  MapPin,
  Navigation,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { BloodGroup } from '../../types';

export const ProfileSetupView: React.FC = () => {
  const { user, completeUserProfile } = useAuth();
  const { navigate, replaceView } = useNav();
  const { location, requestCurrentLocation, status, setIsLocationSelectorOpen } = useLocation();

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState<number | ''>(user?.age || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user?.bloodGroup || 'A+');
  const [isBloodGroupOpen, setIsBloodGroupOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = ['Male', 'Female', 'Other'] as const;

  const handleDetectGps = async () => {
    setGpsLoading(true);
    await requestCurrentLocation();
    setGpsLoading(false);
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const savedLocation = location.name || 'Kadamtala, Jalpaiguri';
      await completeUserProfile({
        name: name.trim(),
        age: typeof age === 'number' ? age : 28,
        gender: gender || 'Female',
        bloodGroup: bloodGroup || 'A+',
        location: savedLocation,
        coordinates: { lat: location.lat, lng: location.lng }
      });

      setLoading(false);
      replaceView('home');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#11241C] flex flex-col justify-between p-5 max-w-md mx-auto select-none relative shadow-2xl">
      {/* Top Header Bar with Back button, Title & Avatar Icon */}
      <div className="w-full flex items-center justify-between pt-2 pb-2">
        <button
          onClick={() => navigate('otp')}
          className="p-1 -ml-1 text-gray-800 hover:text-black active:scale-95 transition-all cursor-pointer"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-bold text-gray-900 tracking-tight">
          Complete Profile
        </h1>

        {/* Profile Avatar Badge matching mockup */}
        <div className="w-7 h-7 rounded-full bg-[#CBD5E1] flex items-center justify-center text-gray-500 shadow-2xs">
          <UserIcon className="w-4 h-4 text-[#64748B] fill-[#64748B]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-1 my-auto py-2">
        {errorMsg && (
          <div className="mb-3 bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="text-xs">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleContinue} className="space-y-3.5">
          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Priya Sharma"
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2F74E9] focus:ring-1 focus:ring-[#2F74E9] transition-all shadow-2xs"
            />
          </div>

          {/* 2. Real-Time Location Card */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-900">
                Live Location & Area
              </label>
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={gpsLoading}
                className="text-[11px] font-bold text-[#2F74E9] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {gpsLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Navigation className="w-3 h-3" />
                )}
                <span>Detect Real GPS</span>
              </button>
            </div>

            <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {location.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {location.isApproximate ? 'Locality selected' : `Realtime GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLocationSelectorOpen(true)}
                  className="px-2 py-1 text-[11px] font-bold text-[#2F74E9] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>

              {!location.isApproximate && location.accuracy && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>Real GPS Accuracy: ±{location.accuracy}m</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Age with Stepper Controls */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Age
            </label>
            <div className="relative">
              <input
                type="number"
                min={15}
                max={100}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value) || 18)}
                placeholder="e.g., 28"
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2F74E9] focus:ring-1 focus:ring-[#2F74E9] transition-all shadow-2xs pr-9"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center select-none">
                <button
                  type="button"
                  onClick={() => setAge((prev) => (typeof prev === 'number' ? Math.min(100, prev + 1) : 28))}
                  className="p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => setAge((prev) => (typeof prev === 'number' ? Math.max(15, prev - 1) : 28))}
                  className="p-0.5 text-gray-400 hover:text-gray-700 cursor-pointer -mt-1"
                >
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Gender Dropdown & Segmented Switcher */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Gender
            </label>
            {/* Dropdown style */}
            <div className="relative mb-2">
              <button
                type="button"
                onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 flex items-center justify-between shadow-2xs hover:border-gray-400 focus:outline-none focus:border-[#2F74E9] transition-all cursor-pointer"
              >
                <span>{gender}</span>
                <ChevronDown className="w-4 h-4 text-gray-500 stroke-[2]" />
              </button>

              {isGenderDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {genderOptions.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setGender(g);
                        setIsGenderDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        gender === g ? 'font-bold text-[#2F74E9] bg-blue-50/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{g}</span>
                      {gender === g && <Check className="w-4 h-4 text-[#2F74E9]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Segmented Pill Selector */}
            <div className="bg-[#ECEEF2] p-1 rounded-xl flex items-center gap-1 shadow-inner">
              {genderOptions.map((g) => {
                const isSelected = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#2F74E9] text-white shadow-xs font-bold'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Blood Group Dropdown Selector */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-900 mb-1.5">
              Blood Group
            </label>
            <button
              type="button"
              onClick={() => setIsBloodGroupOpen(!isBloodGroupOpen)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 flex items-center justify-between shadow-2xs hover:border-gray-400 focus:outline-none focus:border-[#2F74E9] transition-all cursor-pointer"
            >
              <span>{bloodGroup}</span>
              <ChevronDown className="w-4 h-4 text-gray-500 stroke-[2]" />
            </button>

            {/* Dropdown Menu for Blood Groups */}
            {isBloodGroupOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-2 grid grid-cols-4 gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                {bloodGroups.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => {
                      setBloodGroup(bg);
                      setIsBloodGroupOpen(false);
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      bloodGroup === bg
                        ? 'bg-[#2F74E9] text-white shadow-xs'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Continue Button */}
          <div className="pt-4">
            <button
              id="btn-profile-continue"
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-xl bg-[#2F74E9] hover:bg-[#2563EB] active:scale-[0.99] text-white font-semibold text-[14px] flex items-center justify-center shadow-sm transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Profile...</span>
                </div>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom iOS Home Indicator */}
      <div className="w-full flex justify-center pb-1 pt-2">
        <div className="w-32 h-1 bg-black/80 rounded-full"></div>
      </div>
    </div>
  );
};


