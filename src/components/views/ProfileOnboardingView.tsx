import React, { useState } from 'react';
import {
  ArrowRight,
  MapPin,
  Check,
  Heart,
  User,
  Sparkles,
  Navigation,
  Shield,
  Calendar,
  Droplet,
  Camera,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { BloodGroup } from '../../types';

export const ProfileOnboardingView: React.FC = () => {
  const { completeOnboarding, user } = useAuth();
  const { replaceView } = useNav();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState<number>(user?.age || 25);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(user?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user?.bloodGroup || 'O+');
  const [location, setLocation] = useState(user?.location || 'Kadamtala, Jalpaiguri');
  const [phone, setPhone] = useState(user?.phone || '');

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "I don't know"];

  const genderOptions = [
    {
      id: 'Male' as const,
      label: 'Male',
      symbol: '♂',
      iconBg: 'bg-blue-100 text-blue-700',
      description: 'He / Him'
    },
    {
      id: 'Female' as const,
      label: 'Female',
      symbol: '♀',
      iconBg: 'bg-pink-100 text-pink-700',
      description: 'She / Her'
    },
    {
      id: 'Other' as const,
      label: 'Other / Non-Binary',
      symbol: '⚧',
      iconBg: 'bg-purple-100 text-purple-700',
      description: 'They / Them'
    },
    {
      id: 'Prefer not to say' as const,
      label: 'Prefer not to say',
      symbol: '🔒',
      iconBg: 'bg-slate-100 text-slate-700',
      description: 'Private'
    }
  ];

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else {
      completeOnboarding({
        name: name.trim() || 'Citizen',
        age,
        gender,
        bloodGroup,
        location,
        phone: phone || undefined
      });
      replaceView('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      {/* Top Header */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#063B2C]">
            Step {step} of 5
          </span>
          <span className="text-xs font-semibold text-[#55685F]">
            Manual Profile Setup
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#E8E4DA] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-[#063B2C] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center font-bold text-xl shadow-xs">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              What should we call you?
            </h2>
            <p className="text-xs text-[#55685F] leading-relaxed">
              Your name helps local workers, doctors, and neighbors identify your requests in Jalpaiguri.
            </p>
            <div className="pt-2 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-white border-2 border-[#D2CEBE] rounded-2xl px-4 py-3.5 text-base font-bold text-[#11241C] focus:border-[#063B2C] focus:outline-none shadow-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11241C] uppercase mb-1.5">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98320 XXXXX"
                  className="w-full bg-white border border-[#D2CEBE] rounded-2xl px-4 py-3 text-xs font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Age */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center font-bold text-xl shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              How old are you?
            </h2>
            <p className="text-xs text-[#55685F] leading-relaxed">
              Used to customize local health camps, civic volunteer roles, and community support.
            </p>
            <div className="pt-2 bg-white p-5 rounded-3xl border border-[#D2CEBE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#11241C] uppercase">
                  Age in Years
                </label>
                <span className="text-xl font-extrabold text-[#063B2C]">
                  {age} yrs
                </span>
              </div>
              <input
                type="range"
                min="14"
                max="95"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="w-full accent-[#063B2C] h-2 bg-[#E8E4DA] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-[#8C9B93]">
                <span>14 yrs (Youth)</span>
                <span>45 yrs (Adult)</span>
                <span>95 yrs (Senior)</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Gender with Icons */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              Select Your Gender
            </h2>
            <p className="text-xs text-[#55685F] leading-relaxed">
              Choose your gender identity for personalized community & civic services.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGender(opt.id)}
                  className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    gender === opt.id
                      ? 'bg-[#E6F4EA] border-[#063B2C] text-[#063B2C] shadow-sm ring-1 ring-[#063B2C]'
                      : 'bg-white border-[#D2CEBE] text-[#11241C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shadow-xs ${opt.iconBg}`}>
                      {opt.symbol}
                    </div>
                    {gender === opt.id && (
                      <div className="w-5 h-5 rounded-full bg-[#063B2C] text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold">{opt.label}</div>
                    <div className="text-[11px] text-[#55685F]">{opt.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Blood Group */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#D9383A]">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-xs font-bold uppercase tracking-wider">Emergency Blood Match</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              What’s your blood group?
            </h2>
            <p className="text-xs text-[#55685F] leading-relaxed">
              Allows Jalpaiguri hospitals & community members to reach you for urgent donor requirements.
            </p>
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-3.5 px-2 rounded-2xl border-2 text-sm font-extrabold text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    bloodGroup === bg
                      ? 'bg-[#FFEBEA] border-[#D9383A] text-[#D9383A] shadow-xs ring-1 ring-[#D9383A]'
                      : 'bg-white border-[#D2CEBE] text-[#11241C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Droplet className={`w-4 h-4 ${bloodGroup === bg ? 'fill-[#D9383A]' : 'text-[#8C9B93]'}`} />
                  <span>{bg}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Location */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              Where in Jalpaiguri do you stay?
            </h2>
            <p className="text-xs text-[#55685F] leading-relaxed">
              Connects you with nearby electricians, plumbers, civic alerts, and community posts.
            </p>

            <div className="bg-white border-2 border-[#D2CEBE] rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-[#55685F] block">Your Locality / Ward</span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full font-extrabold text-sm text-[#11241C] focus:outline-none border-b border-transparent focus:border-[#063B2C]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-[#55685F]">Select Jalpaiguri Area:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Kadamtala',
                  'Dinbazar',
                  'Mohitnagar',
                  'Silpasamiti Para',
                  'Paharpur',
                  'Pandapara',
                  'Hakimpara',
                  'Deshbandhu Para'
                ].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(`${loc}, Jalpaiguri`)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      location.includes(loc)
                        ? 'bg-[#063B2C] text-white border-[#063B2C]'
                        : 'bg-white text-[#11241C] border-[#D2CEBE] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="pt-6">
        <button
          onClick={handleNext}
          className="w-full bg-[#063B2C] text-white font-extrabold text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer"
        >
          <span>{step === 5 ? 'Save & Start Exploring' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
