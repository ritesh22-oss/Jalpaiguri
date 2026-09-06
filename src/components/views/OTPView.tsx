import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useExpo } from '../../context/ExpoContext';
import { useLanguage } from '../../context/LanguageContext';

export const OTPView: React.FC = () => {
  const { pendingPhone, verifyPhoneOtp, sendPhoneOtp, activeOtp } = useAuth();
  const { navigate, replaceView } = useNav();
  const {
    autoFillOtpTrigger,
    clearAutoFillRequest,
    triggerHaptic,
    latestOtp,
    triggerPushNotification
  } = useExpo();
  const { isBengali, language, setLanguage } = useLanguage();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorType, setErrorType] = useState<'invalid' | 'network' | 'expired' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Suggested OTP from backend or SSE
  const availableOtp = activeOtp || latestOtp;

  // Active cursor index (first empty index, or 5 if all filled)
  const activeIndex = digits.findIndex((d) => d === '');
  const currentCursorIndex = activeIndex === -1 ? 5 : activeIndex;

  // Auto-focus hidden input on mount for physical keyboard & paste support
  useEffect(() => {
    hiddenInputRef.current?.focus();

    // If an OTP exists, trigger push notification for seamless testing
    if (availableOtp) {
      triggerPushNotification({
        appTitle: isBengali ? 'বার্তা' : 'Messages',
        category: 'SMS',
        title: isBengali ? 'জলপাইগুড়ি কানেক্ট যাচাইকরণ' : 'MYJPG Verification',
        body: isBengali ? `আপনার যাচাইকরণ কোড হলো ${availableOtp}। স্বয়ংক্রিয়ভাবে পূরণ করতে ট্যাপ করুন।` : `Your verification code is ${availableOtp}. Tap to auto-fill.`,
        code: availableOtp,
        actionLabel: isBengali ? 'স্বয়ংক্রিয় পূরণ' : 'Auto-Fill'
      });
    }
  }, []);

  // Listen to external Auto-Fill trigger from ExpoPushBanner
  useEffect(() => {
    if (autoFillOtpTrigger && autoFillOtpTrigger.length === 6) {
      const newDigits = autoFillOtpTrigger.split('');
      setDigits(newDigits);
      clearAutoFillRequest();
      triggerHaptic('success');
      verifyCode(autoFillOtpTrigger);
    }
  }, [autoFillOtpTrigger]);

  // 30 second resend timer countdown
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Apply Auto-Fill directly
  const handleAutoFillClick = (code: string) => {
    const cleanCode = code.trim().slice(0, 6);
    if (cleanCode.length === 6) {
      setDigits(cleanCode.split(''));
      setErrorMsg('');
      setErrorType(null);
      triggerHaptic('medium');
      verifyCode(cleanCode);
    }
  };

  // Handle keypad press or typing
  const handleKeypadPress = (val: string) => {
    if (loading || isSuccess) return;
    triggerHaptic('light');

    if (val === 'backspace') {
      const lastFilledIndex = digits.reduce((last, d, idx) => (d !== '' ? idx : last), -1);
      if (lastFilledIndex !== -1) {
        const newDigits = [...digits];
        newDigits[lastFilledIndex] = '';
        setDigits(newDigits);
        setErrorMsg('');
        setErrorType(null);
      }
      return;
    }

    // Add digit to first empty slot
    const firstEmptyIndex = digits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      const newDigits = [...digits];
      newDigits[firstEmptyIndex] = val;
      setDigits(newDigits);
      setErrorMsg('');
      setErrorType(null);

      // When all 6 are filled, trigger OTP verification
      if (firstEmptyIndex === 5) {
        verifyCode(newDigits.join(''));
      }
    }
  };

  // Clipboard Paste Handler
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (loading || isSuccess) return;

    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setDigits(newDigits);
      setErrorMsg('');
      setErrorType(null);
      triggerHaptic('medium');

      if (pastedData.length === 6) {
        verifyCode(pastedData);
      }
    }
  };

  // Allow physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || isSuccess) return;
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadPress('backspace');
      } else if (e.key === 'Enter') {
        const code = digits.join('');
        if (code.length === 6) {
          verifyCode(code);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [digits, loading, isSuccess]);

  const verifyCode = async (codeToVerify: string) => {
    if (codeToVerify.length < 6) {
      setErrorType('invalid');
      setErrorMsg(isBengali ? 'যাচাই করতে অনুগ্রহ করে সবকটি ৬টি সংখ্যা লিখুন।' : 'Please enter all 6 digits to verify.');
      triggerHaptic('warning');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setErrorType(null);

    try {
      const res = await verifyPhoneOtp(codeToVerify);
      setLoading(false);

      if (res.success) {
        setIsSuccess(true);
        triggerHaptic('success');
        setTimeout(() => {
          if (res.isNewUser) {
            replaceView('profile-setup');
          } else {
            replaceView('home');
          }
        }, 500);
      } else {
        setShake(true);
        triggerHaptic('error');
        setErrorType('invalid');
        setErrorMsg(res.message || (isBengali ? 'ভুল যাচাইকরণ কোড। যাচাই করে আবার চেষ্টা করুন।' : 'Incorrect verification code. Please check and try again.'));
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setLoading(false);
      setShake(true);
      triggerHaptic('error');
      setErrorType('network');
      setErrorMsg(isBengali ? 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।' : 'Network connectivity issue. Please check your connection or retry.');
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleResendOtp = async () => {
    if (resending || loading) return;

    setResending(true);
    setErrorMsg('');
    setErrorType(null);
    triggerHaptic('medium');

    try {
      const phoneToUse = pendingPhone || '+91 90915 63912';
      const res = await sendPhoneOtp(phoneToUse);
      setResending(false);

      if (res.success) {
        setResendCountdown(30);
        setDigits(['', '', '', '', '', '']);
        triggerHaptic('success');
        if (res.otp) {
          triggerPushNotification({
            appTitle: isBengali ? 'বার্তা' : 'Messages',
            category: 'SMS',
            title: isBengali ? 'জলপাইগুড়ি কানেক্ট যাচাইকরণ' : 'MYJPG Verification',
            body: isBengali ? `আপনার নতুন যাচাইকরণ কোড হলো ${res.otp}। স্বয়ংক্রিয়ভাবে পূরণ করতে ট্যাপ করুন।` : `Your new verification code is ${res.otp}. Tap to auto-fill.`,
            code: res.otp,
            actionLabel: isBengali ? 'স্বয়ংক্রিয় পূরণ' : 'Auto-Fill'
          });
        }
      } else {
        setErrorType('network');
        setErrorMsg(res.message || (isBengali ? 'নতুন ওটিপি পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Failed to dispatch new OTP. Please retry.'));
      }
    } catch (err: any) {
      setResending(false);
      setErrorType('network');
      setErrorMsg(isBengali ? 'যাচাইকরণ সার্ভিসে সংযোগ করা যাচ্ছে না। পুনরায় চেষ্টা করুন।' : 'Failed to reach verification service. Tap retry to attempt again.');
    }
  };

  // Re-trigger whole auth flow / change number without page reload
  const handleRestartFlow = () => {
    triggerHaptic('light');
    setDigits(['', '', '', '', '', '']);
    setErrorMsg('');
    setErrorType(null);
    navigate('phone-auth');
  };

  const handleClearDigits = () => {
    triggerHaptic('light');
    setDigits(['', '', '', '', '', '']);
    setErrorMsg('');
    setErrorType(null);
    hiddenInputRef.current?.focus();
  };

  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    triggerHaptic('light');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedSeconds = resendCountdown < 10 ? `0${resendCountdown}` : `${resendCountdown}`;

  const keypadRows = [
    [
      { num: '1', letters: '' },
      { num: '2', letters: 'ABC' },
      { num: '3', letters: 'DEF' }
    ],
    [
      { num: '4', letters: 'GHI' },
      { num: '5', letters: 'JKL' },
      { num: '6', letters: 'MNO' }
    ],
    [
      { num: '7', letters: 'PQRS' },
      { num: '8', letters: 'TUV' },
      { num: '9', letters: 'WXYZ' }
    ],
    [
      { num: '', letters: '', isBlank: true },
      { num: '0', letters: '' },
      { num: 'backspace', letters: '', isBackspace: true }
    ]
  ];

  return (
    <div
      className="min-h-screen bg-[#F8FBFF] dark:bg-[#020617] text-[#11241C] dark:text-white flex flex-col p-6 max-w-md mx-auto select-none relative transition-colors overflow-hidden"
      onPaste={handlePaste}
    >
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hidden input for mobile keyboard */}
      <input
        ref={hiddenInputRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        className="opacity-0 absolute -z-10 w-0 h-0"
        onPaste={handlePaste}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
          if (val.length > 0) {
            const newDigits = ['', '', '', '', '', ''];
            for (let i = 0; i < val.length; i++) newDigits[i] = val[i];
            setDigits(newDigits);
            if (val.length === 6) verifyCode(val);
          }
        }}
      />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-8 z-10">
        <button
          onClick={handleRestartFlow}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer rounded-full"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
          {isBengali ? 'কোড যাচাই করুন' : 'Verify Code'}
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
        {/* Instruction Section */}
        <div className="text-center space-y-1.5">
          <p className="text-gray-500 dark:text-gray-400 text-[13px] font-medium">
            {isBengali ? 'আমরা একটি ৬-সংখ্যার কোড পাঠিয়েছি:' : 'We sent a 6-digit verification code to:'}
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800/20">
            <span className="text-sm font-black text-[#2563EB] dark:text-blue-400 font-mono tracking-wider">
              {pendingPhone || '+91 90915 63912'}
            </span>
            <button
              onClick={handleRestartFlow}
              className="text-[9px] font-black text-blue-400 dark:text-blue-500 hover:text-blue-600 uppercase tracking-tighter cursor-pointer"
            >
              {isBengali ? 'বদলান' : 'Change'}
            </button>
          </div>
        </div>

        {/* Security Shield */}
        <div className="w-full flex items-center justify-center gap-3 text-[9px] font-black text-blue-400/50 dark:text-blue-500/50 uppercase tracking-[0.15em]">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>{isBengali ? 'সুরক্ষিত যাচাইকরণ' : 'Secure Verification'}</span>
          </div>
          <div className="w-0.5 h-0.5 bg-blue-100 dark:bg-blue-800 rounded-full"></div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>{isBengali ? 'এনক্রিপ্টেড' : 'Encrypted'}</span>
          </div>
        </div>

        {/* Auto-Fill Prompt */}
        {availableOtp && (
          <div className="w-full bg-white dark:bg-[#111C35] border border-blue-50 dark:border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-sm animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">
                  {isBengali ? 'অটো-ফিল কোড' : 'Auto-fill'}
                </p>
                <p className="text-base font-black text-[#2563EB] dark:text-white font-mono tracking-widest leading-tight">
                  {availableOtp}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAutoFillClick(availableOtp)}
              className="px-3 py-1.5 bg-[#2563EB] dark:bg-[#3B82F6] text-white text-[10px] font-black rounded-lg active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{isBengali ? 'পূরণ' : 'Fill'}</span>
            </button>
          </div>
        )}

        {/* Status Alerts */}
        <div className="w-full space-y-2">
          {errorMsg && (
            <div className={`rounded-xl p-3 text-[11px] border animate-in fade-in slide-in-from-top-1 duration-300 ${
              errorType === 'network'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed flex-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40 rounded-xl p-3 text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2.5 font-bold animate-in fade-in duration-300">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs">{isBengali ? 'সফলভাবে যাচাই করা হয়েছে!' : 'Verified Successfully!'}</span>
            </div>
          )}
        </div>

        {/* 6 OTP Input Boxes */}
        <div className={`flex items-center justify-center gap-2 ${shake ? 'animate-shake' : ''}`}>
          {digits.map((digit, idx) => {
            const isFilled = Boolean(digit);
            const isActive = idx === currentCursorIndex && !isFilled;
            
            let borderStyle = 'border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111C35]';
            if (isSuccess) {
              borderStyle = 'border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
            } else if (isActive) {
              borderStyle = 'border-2 border-[#2563EB] dark:border-blue-400 bg-white dark:bg-[#111C35] ring-2 ring-blue-50 dark:ring-blue-900/20';
            } else if (isFilled) {
              borderStyle = 'border border-[#2563EB] dark:border-blue-400 bg-white dark:bg-[#111C35] shadow-xs';
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  triggerHaptic('light');
                  hiddenInputRef.current?.focus();
                }}
                className={`w-10 h-12 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${borderStyle}`}
              >
                {isFilled ? (
                  <span className="text-lg font-black text-gray-900 dark:text-white font-mono">
                    {digit}
                  </span>
                ) : isActive ? (
                  <div className="w-0.5 h-5 bg-[#2563EB] dark:bg-blue-400 rounded-full animate-pulse"></div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Resend Logic */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-3 text-[12px] font-bold">
            {resendCountdown > 0 ? (
              <p className="text-gray-400 dark:text-gray-500">
                {isBengali ? 'কোড পুনরায় পাঠান ' : 'Resend in '}
                <span className="text-[#2563EB] dark:text-blue-400 font-mono">00:{formattedSeconds}</span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={loading || resending}
                className="text-[#2563EB] dark:text-blue-400 hover:text-[#1D4ED8] flex items-center gap-1.5 cursor-pointer group"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{isBengali ? 'আবার কোড পাঠান' : 'Resend Code'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => verifyCode(digits.join(''))}
            disabled={loading || digits.some(d => !d) || isSuccess}
            className="w-full h-12 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span>{isBengali ? 'যাচাই করুন' : 'Verify & Proceed'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Numerical Keypad */}
      <div className="w-full max-w-[320px] mx-auto bg-white/50 dark:bg-[#111C35]/50 backdrop-blur-md p-2.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm z-10">
        <div className="grid grid-cols-3 gap-1.5">
          {keypadRows.flat().map((key, i) => {
            if (key.isBlank) return <div key={i} className="h-11"></div>;
            
            if (key.isBackspace) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-11 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 active:scale-90 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              );
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleKeypadPress(key.num)}
                className="h-11 bg-white dark:bg-[#1E293B] rounded-xl flex flex-col items-center justify-center border border-gray-50 dark:border-white/5 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-lg font-black text-gray-900 dark:text-white group-active:text-[#2563EB]">
                  {key.num}
                </span>
                {key.letters && (
                  <span className="text-[6px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">
                    {key.letters}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


