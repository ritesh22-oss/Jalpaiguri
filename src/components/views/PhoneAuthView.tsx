import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useExpo } from '../../context/ExpoContext';
import { WritingCaptcha } from '../common/WritingCaptcha';

export const PhoneAuthView: React.FC = () => {
  const { sendPhoneOtp, pendingPhone, setPendingPhone } = useAuth();
  const { navigate } = useNav();
  const { triggerHaptic, triggerPushNotification, setLatestOtp } = useExpo();

  const [rawPhone, setRawPhone] = useState(() => {
    if (pendingPhone) {
      const digits = pendingPhone.replace(/\D/g, '');
      return digits.slice(-10);
    }
    return '';
  });
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = rawPhone.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
      triggerHaptic('warning');
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!isCaptchaValid) {
      triggerHaptic('warning');
      setErrorMsg('Please enter the security characters correctly before continuing.');
      return;
    }

    const formattedNumber = `+91 ${digitsOnly.slice(-10)}`;
    setPendingPhone(formattedNumber);
    setErrorMsg('');
    setLoading(true);
    triggerHaptic('medium');

    try {
      const res = await sendPhoneOtp(formattedNumber);
      setLoading(false);

      if (res && res.success) {
        triggerHaptic('success');
        if (res.otp) {
          setLatestOtp(res.otp);
          triggerPushNotification({
            appTitle: 'Messages',
            category: 'SMS',
            title: 'Jalpaiguri Connect Verification',
            body: `Your verification code is ${res.otp}. Tap to auto-fill.`,
            code: res.otp,
            actionLabel: 'Auto-Fill'
          });
        }
        navigate('otp');
      } else {
        triggerHaptic('warning');
        setErrorMsg(res?.message || 'Failed to send SMS code. Please check the number and try again.');
      }
    } catch (err: any) {
      setLoading(false);
      triggerHaptic('warning');
      setErrorMsg(err?.message || 'Failed to send SMS code. Please check your network and retry.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1A15] text-[#11241C] dark:text-white flex flex-col justify-between p-5 max-w-md mx-auto select-none relative shadow-2xl transition-colors">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pt-2 pb-2">
        <button
          onClick={() => navigate('auth')}
          className="p-1 -ml-1 text-gray-800 dark:text-white hover:text-black dark:hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
          Phone Sign In
        </h1>

        <div className="w-6"></div>
      </div>

      {/* Phone Number Input & Writing CAPTCHA Card */}
      <form onSubmit={handleSendOtp} className="space-y-3.5 my-auto w-full px-1">
        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-3 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-[#A2B3AA]">
            Enter your mobile number
          </label>
          <div className="w-full bg-white dark:bg-[#17231E] border border-gray-300 dark:border-white/10 rounded-2xl p-1.5 flex items-center shadow-2xs focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/40 transition-all">
            <div className="flex items-center gap-1 pl-2.5 pr-2 py-1.5 shrink-0 select-none">
              <span className="text-sm font-bold text-gray-800 dark:text-white">+91</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-[#A2B3AA]" />
            </div>

            <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10 mx-1.5 shrink-0"></div>

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
              className="w-full py-2 px-2 bg-transparent text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* User-Friendly Writing CAPTCHA (Canvas Security Characters) */}
        <WritingCaptcha onVerifyChange={setIsCaptchaValid} />

        {/* Firebase Invisible reCAPTCHA DOM Anchor */}
        <div id="recaptcha-container"></div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rawPhone.length < 10 || !isCaptchaValid}
          className="w-full h-[48px] rounded-xl bg-[#2F74E9] hover:bg-[#2563EB] active:scale-[0.99] text-white font-semibold text-[14px] flex items-center justify-center shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Sending Code...</span>
            </div>
          ) : (
            <span>Send OTP / Continue</span>
          )}
        </button>
      </form>

      {/* Bottom iOS Home Indicator */}
      <div className="w-full flex justify-center pb-1 pt-2">
        <div className="w-32 h-1 bg-black/80 dark:bg-white/40 rounded-full"></div>
      </div>
    </div>
  );
};
