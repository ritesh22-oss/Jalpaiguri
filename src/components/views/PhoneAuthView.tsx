import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  Loader2,
  AlertCircle,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useExpo } from '../../context/ExpoContext';
import { useLanguage } from '../../context/LanguageContext';
import { WritingCaptcha } from '../common/WritingCaptcha';

export const PhoneAuthView: React.FC = () => {
  const { sendPhoneOtp, pendingPhone, setPendingPhone } = useAuth();
  const { navigate } = useNav();
  const { triggerHaptic, triggerPushNotification, setLatestOtp } = useExpo();
  const { isBengali, language, setLanguage } = useLanguage();

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
      setErrorMsg(isBengali ? 'অনুগ্রহ করে একটি সঠিক ১০-সংখ্যার মোবাইল নম্বর লিখুন।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!isCaptchaValid) {
      triggerHaptic('warning');
      setErrorMsg(isBengali ? 'এগিয়ে যাওয়ার আগে নিরাপত্তা অক্ষরগুলি সঠিকভাবে লিখুন।' : 'Please enter the security characters correctly before continuing.');
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
            appTitle: isBengali ? 'বার্তা' : 'Messages',
            category: 'SMS',
            title: isBengali ? 'জলপাইগুড়ি কানেক্ট যাচাইকরণ' : 'MYJPG Verification',
            body: isBengali ? `আপনার ওটিপি কোড হলো ${res.otp}। স্বয়ংক্রিয়ভাবে পূরণ করতে ট্যাপ করুন।` : `Your verification code is ${res.otp}. Tap to auto-fill.`,
            code: res.otp,
            actionLabel: isBengali ? 'স্বয়ংক্রিয় পূরণ' : 'Auto-Fill'
          });
        }
        navigate('otp');
      } else {
        triggerHaptic('warning');
        setErrorMsg(res?.message || (isBengali ? 'এসএমএস কোড পাঠানো যায়নি। নম্বরটি যাচাই করে আবার চেষ্টা করুন।' : 'Failed to send SMS code. Please check the number and try again.'));
      }
    } catch (err: any) {
      setLoading(false);
      triggerHaptic('warning');
      setErrorMsg(err?.message || (isBengali ? 'এসএমএস পাঠাতে ব্যর্থ হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।' : 'Failed to send SMS code. Please check your network and retry.'));
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FBFF] dark:bg-[#020617] text-[#11241C] dark:text-white flex flex-col p-6 select-none relative transition-colors overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-between">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-8 z-10">
        <button
          onClick={() => navigate('auth')}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer rounded-full"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
          {isBengali ? 'ফোন নম্বর দিয়ে প্রবেশ' : 'Phone Sign In'}
        </h1>

        <div className="flex items-center bg-white/50 dark:bg-white/5 backdrop-blur-sm p-1 rounded-full border border-blue-100 dark:border-white/10 shadow-sm">
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="text-[10px] font-bold px-3 py-1 rounded-full text-[#2563EB] dark:text-[#3B82F6] hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            {language === 'bn' ? 'EN' : 'বাংলা'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6 z-10">
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-[#11241C] dark:text-white">
            {isBengali ? 'আপনার নম্বর লিখুন' : 'Enter your number'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-[13px] font-medium">
            {isBengali 
              ? 'আমরা আপনার নম্বর যাচাই করতে একটি ওটিপি পাঠাবো।' 
              : 'We will send a 6-digit verification code.'}
          </p>
        </div>

        {/* Phone Number Input & Writing CAPTCHA Card */}
        <form onSubmit={handleSendOtp} className="space-y-5 w-full">
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/40 rounded-xl p-3 text-rose-800 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold leading-snug">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="w-full bg-white dark:bg-[#111C35] border border-gray-200 dark:border-white/10 rounded-xl p-1.5 flex items-center focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/20 transition-all">
              <div className="flex items-center gap-1 pl-2 pr-2 py-2 shrink-0 select-none bg-gray-50 dark:bg-blue-900/10 rounded-lg border border-gray-100 dark:border-blue-800/20">
                <span className="text-xs font-black text-gray-800 dark:text-white">+91</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>

              <div className="h-6 w-[1px] bg-gray-100 dark:bg-white/10 mx-2 shrink-0"></div>

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
                className="w-full py-2 px-1 bg-transparent text-base font-black tracking-widest text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 focus:outline-none"
              />
            </div>
          </div>

          {/* User-Friendly Writing CAPTCHA */}
          <div className="bg-white dark:bg-[#111C35] p-0.5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <WritingCaptcha onVerifyChange={setIsCaptchaValid} />
          </div>

          <div id="recaptcha-container"></div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rawPhone.length < 10 || !isCaptchaValid}
            className="w-full h-12 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isBengali ? 'কোড পাঠানো হচ্ছে...' : 'Sending Code...'}</span>
              </div>
            ) : (
              <span>{isBengali ? 'ওটিপি পাঠান' : 'Send Verification Code'}</span>
            )}
          </button>
        </form>
      </div>

      {/* Privacy Note */}
      <div className="w-full text-center py-6">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
          {isBengali ? 'নিরাপদ ও এনক্রিপ্টেড সংযোগ' : 'Secure & Encrypted Connection'}
        </p>
      </div>
      </div>
    </div>
  );
};
