import React, { useState } from 'react';
import { ArrowRight, MapPin, Check, Heart, User, Sparkles, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { BloodGroup } from '../../types';

export const ProfileOnboardingView: React.FC = () => {
  const { completeOnboarding, user } = useAuth();
  const { replaceView } = useNav();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || 'Ananya Sen');
  const [age, setAge] = useState<number>(27);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Female');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [location, setLocation] = useState('Jalpaiguri, WB (Kadamtala)');
  const [locationDetected, setLocationDetected] = useState(true);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "I don't know"];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      completeOnboarding({
        name,
        age,
        gender,
        bloodGroup,
        location
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
            Profile Setup
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#E8E4DA] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-[#063B2C] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              What should we call you?
            </h2>
            <p className="text-sm text-[#55685F]">
              Your name helps local workers, neighbors, and community members address you.
            </p>
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#11241C] uppercase mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-white border-2 border-[#D2CEBE] rounded-2xl px-4 py-3.5 text-base font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none shadow-xs"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: Age */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              How old are you?
            </h2>
            <p className="text-sm text-[#55685F]">
              Helps us personalize healthcare support, community activities, and volunteer roles.
            </p>
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#11241C] uppercase mb-1.5">
                Age in Years
              </label>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                className="w-full bg-white border-2 border-[#D2CEBE] rounded-2xl px-4 py-3.5 text-base font-semibold text-[#11241C] focus:border-[#063B2C] focus:outline-none shadow-xs"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 3: Gender */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              Tell us a little about yourself
            </h2>
            <p className="text-sm text-[#55685F]">
              Select your gender for tailored local services and community groups.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {(['Male', 'Female', 'Other', 'Prefer not to say'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`p-4 rounded-2xl border-2 text-sm font-bold text-left transition-all cursor-pointer ${
                    gender === g
                      ? 'bg-[#E6F4EA] border-[#063B2C] text-[#063B2C] shadow-xs'
                      : 'bg-white border-[#D2CEBE] text-[#11241C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {g}
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
              <span className="text-xs font-bold uppercase tracking-wider">Life-Saving Info</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              What’s your blood group?
            </h2>
            <p className="text-sm text-[#55685F]">
              Optional: Helps match you with emergency blood requests in Jalpaiguri.
            </p>
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-3.5 px-2 rounded-2xl border-2 text-sm font-bold text-center transition-all cursor-pointer ${
                    bloodGroup === bg
                      ? 'bg-[#FFEBEA] border-[#D9383A] text-[#D9383A] shadow-xs'
                      : 'bg-white border-[#D2CEBE] text-[#11241C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Location */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              Where are you located?
            </h2>
            <p className="text-sm text-[#55685F]">
              Your approximate location helps show nearby workers, doctors, jobs, and civic alerts.
            </p>

            <div className="bg-white border-2 border-[#D2CEBE] rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-[#55685F] block">Detected Area</span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full font-bold text-sm text-[#11241C] focus:outline-none border-b border-transparent focus:border-[#063B2C]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLocation('Jalpaiguri, WB (Auto-detected)');
                    setLocationDetected(true);
                  }}
                  className="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-[#FAF8F5] text-[#063B2C] border border-[#D2CEBE] hover:bg-[#E6F4EA] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Use GPS Location</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-[#55685F]">Or Choose Locality:</span>
              <div className="flex flex-wrap gap-2">
                {['Kadamtala', 'Mohitnagar', 'Silpasamiti Para', 'Dinbazar', 'Paharpur', 'Adarpara'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(`${loc}, Jalpaiguri`)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-[#D2CEBE] text-[#11241C] hover:bg-[#E6F4EA] cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="pt-6">
        <button
          onClick={handleNext}
          className="w-full bg-[#063B2C] text-white font-bold text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-[#084D3A] active:scale-98 transition-all cursor-pointer"
        >
          <span>{step === 5 ? 'Finish & Open Jalpaiguri Connect' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
