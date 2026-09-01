import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Signal,
  Wifi,
  Battery,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';

export const PhoneAuthView: React.FC = () => {
  const { sendPhoneOtp, setupRecaptcha, setPendingPhone } = useAuth();
  const { navigate } = useNav();

  const [rawPhone, setRawPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setupRecaptcha('recaptcha-container-phoneview');
    } catch (e) {
      console.warn('reCAPTCHA init:', e);
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = rawPhone.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const formattedNumber = `+91 ${digitsOnly.slice(-10)}`;
    setPendingPhone(formattedNumber);
    setErrorMsg('');
    setLoading(true);

    try {
      const verifier = setupRecaptcha('recaptcha-container-phoneview');
      if (verifier) {
        await sendPhoneOtp(formattedNumber, verifier);
      }
      setLoading(false);
      navigate('otp');
    } catch (err: any) {
      setLoading(false);
      // Still allow navigation to OTP with demo flow
      navigate('otp');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#11241C] flex flex-col justify-between p-5 max-w-md mx-auto select-none relative shadow-2xl">
      <div id="recaptcha-container-phoneview" ref={recaptchaContainerRef}></div>

      {/* Top Mobile Status Bar */}
      <div className="w-full flex items-center justify-between pt-1 px-1 text-gray-900 text-xs font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 fill-current" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center">
            <Battery className="w-4 h-4 fill-current" />
          </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="w-full flex items-center justify-between pt-3">
        <button
          onClick={() => navigate('auth')}
          className="p-1 -ml-1 text-gray-800 hover:text-black active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-bold text-gray-900 tracking-tight">
          Phone Sign In
        </h1>

        <div className="w-6"></div>
      </div>

      {/* Phone Number Input Card */}
      <form onSubmit={handleSendOtp} className="space-y-4 my-auto w-full px-1">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">
            Enter your mobile number
          </label>
          <div className="w-full bg-white border border-gray-300 rounded-2xl p-1.5 flex items-center shadow-2xs focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <div className="flex items-center gap-1 pl-2.5 pr-2 py-1.5 shrink-0 select-none">
              <span className="text-sm font-bold text-gray-800">+91</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </div>

            <div className="h-6 w-[1px] bg-gray-200 mx-1.5 shrink-0"></div>

            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              autoFocus
              value={rawPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setRawPhone(val);
              }}
              placeholder="98765 43210"
              className="w-full py-2 px-2 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rawPhone.length < 10}
          className="w-full h-[48px] rounded-xl bg-[#2F74E9] hover:bg-[#2563EB] active:scale-[0.99] text-white font-semibold text-[14px] flex items-center justify-center shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Sending Code...</span>
            </div>
          ) : (
            <span>Continue</span>
          )}
        </button>
      </form>

      {/* Bottom iOS Home Indicator */}
      <div className="w-full flex justify-center pb-1 pt-2">
        <div className="w-32 h-1 bg-black/80 rounded-full"></div>
      </div>
    </div>
  );
};
