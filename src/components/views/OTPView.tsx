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
  PhoneCall,
  WifiOff,
  RotateCcw,
  Edit3,
  ShieldCheck,
  Smartphone,
  Lock,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useExpo } from '../../context/ExpoContext';

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
        appTitle: 'Messages',
        category: 'SMS',
        title: 'Jalpaiguri Connect Verification',
        body: `Your verification code is ${availableOtp}. Tap to auto-fill.`,
        code: availableOtp,
        actionLabel: 'Auto-Fill'
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
      setErrorMsg('Please enter all 6 digits to verify.');
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
        setErrorMsg(res.message || 'Incorrect verification code. Please check and try again.');
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setLoading(false);
      setShake(true);
      triggerHaptic('error');
      setErrorType('network');
      setErrorMsg('Network connectivity issue. Please check your connection or retry.');
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
            appTitle: 'Messages',
            category: 'SMS',
            title: 'Jalpaiguri Connect Verification',
            body: `Your new verification code is ${res.otp}. Tap to auto-fill.`,
            code: res.otp,
            actionLabel: 'Auto-Fill'
          });
        }
      } else {
        setErrorType('network');
        setErrorMsg(res.message || 'Failed to dispatch new OTP. Please retry.');
      }
    } catch (err: any) {
      setResending(false);
      setErrorType('network');
      setErrorMsg('Failed to reach verification service. Tap retry to attempt again.');
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
      className="min-h-screen bg-white dark:bg-[#0F1A15] text-[#11241C] dark:text-white flex flex-col justify-between p-4 max-w-md mx-auto select-none relative shadow-2xl transition-colors"
      onPaste={handlePaste}
    >
      {/* Hidden input for mobile keyboard and clipboard paste auto-detection */}
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

      {/* Top Navigation Header Bar */}
      <div className="w-full flex items-center justify-between pt-1 pb-1">
        <button
          onClick={handleRestartFlow}
          className="p-1.5 -ml-1.5 text-gray-700 dark:text-[#A2B3AA] hover:text-black dark:hover:text-white active:scale-95 transition-all cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-1 text-xs font-semibold"
          aria-label="Go Back & Change Number"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          <span>Back</span>
        </button>

        <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
          Verify Phone
        </h1>

        <button
          onClick={handleRestartFlow}
          className="text-xs font-semibold text-[#2F74E9] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          title="Change Phone Number"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Change</span>
        </button>
      </div>

      {/* Main Verification Content Area */}
      <div className="flex flex-col items-center text-center space-y-3 my-auto w-full px-2">
        {/* Instruction Subtitle */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-[#A2B3AA]">
            Enter the 6-digit verification code sent to
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-100/90 dark:bg-[#17231E] px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 transition-colors">
            <span className="text-sm font-bold text-gray-900 dark:text-white font-mono tracking-wide">
              {pendingPhone || '+91 90915 63912'}
            </span>
            <button
              onClick={handleRestartFlow}
              className="text-[11px] font-semibold text-[#2F74E9] dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Security Shield & Expiry Badge */}
        <div className="w-full max-w-xs flex items-center justify-between text-[11px] text-gray-500 dark:text-[#A2B3AA] bg-gray-50/80 dark:bg-[#121E19] px-2.5 py-1.5 rounded-xl border border-gray-100 dark:border-white/10 transition-colors">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Anti-Hack 256-Bit OTP</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 dark:text-[#A2B3AA] font-mono text-[10px]">
            <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            <span>Expires in 5m</span>
          </div>
        </div>

        {/* Instant Auto-Fill Banner Pill */}
        {availableOtp && (
          <div className="w-full max-w-xs bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/40 rounded-2xl p-2.5 flex items-center justify-between shadow-xs animate-in zoom-in-95 duration-200 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#2F74E9] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                  Instant SMS Code
                </p>
                <p className="text-sm font-black text-[#2F74E9] dark:text-blue-400 font-mono tracking-widest leading-none">
                  {availableOtp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCopyOtp(availableOtp)}
                className="p-1.5 rounded-lg text-gray-500 dark:text-[#A2B3AA] hover:text-gray-800 dark:hover:text-white hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                title="Copy Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleAutoFillClick(availableOtp)}
                className="py-1 px-2.5 bg-[#2F74E9] hover:bg-[#2563EB] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>Auto-Fill</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Rich Error Alerts with Retry Actions */}
        {errorMsg && (
          <div
            className={`w-full max-w-xs rounded-2xl p-3 text-xs border shadow-xs animate-in fade-in zoom-in-95 duration-200 ${
              errorType === 'network'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {errorType === 'network' ? (
                <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-left flex-1">
                <p className="text-[12px] font-semibold leading-snug">{errorMsg}</p>
                <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-rose-200/60 dark:border-rose-800/40">
                  <button
                    type="button"
                    onClick={handleClearDigits}
                    className="text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Digits</span>
                  </button>
                  <span className="text-rose-300 dark:text-rose-700">•</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[11px] font-bold text-[#2F74E9] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    <span>Resend Code</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2 font-bold max-w-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs">Phone verified successfully! Redirecting...</p>
          </div>
        )}

        {/* 6 OTP Input Boxes with Dynamic Error/Success States */}
        <div className={`flex items-center justify-center gap-2 py-1 ${shake ? 'animate-shake' : ''}`}>
          {digits.map((digit, idx) => {
            const isFilled = Boolean(digit);
            const isActive = idx === currentCursorIndex && !isFilled;
            const hasError = Boolean(errorMsg);

            let borderStyle = 'border-2 border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-[#17231E] hover:border-gray-300 dark:hover:border-white/20';
            if (isSuccess) {
              borderStyle = 'border-2 border-emerald-500 dark:border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm';
            } else if (hasError) {
              borderStyle = isFilled
                ? 'border-2 border-rose-500 dark:border-rose-400 bg-rose-50/50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 shadow-sm'
                : 'border-2 border-rose-300 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-950/20';
            } else if (isActive) {
              borderStyle = 'border-2 border-[#2F74E9] dark:border-blue-400 bg-white dark:bg-[#17231E] ring-4 ring-blue-100/60 dark:ring-blue-900/40 shadow-sm';
            } else if (isFilled) {
              borderStyle = 'border-2 border-[#2F74E9] dark:border-blue-400 bg-white dark:bg-[#17231E] shadow-sm';
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  triggerHaptic('light');
                  hiddenInputRef.current?.focus();
                  const newDigits = [...digits];
                  for (let i = idx; i < 6; i++) newDigits[i] = '';
                  setDigits(newDigits);
                }}
                className={`w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-2xl flex items-center justify-center transition-all duration-150 relative cursor-pointer ${borderStyle}`}
              >
                {isFilled ? (
                  <span className={`text-lg font-bold font-mono ${hasError ? 'text-rose-800 dark:text-rose-300' : isSuccess ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
                    {digit}
                  </span>
                ) : isActive ? (
                  <div className="w-[2px] h-5 bg-[#2F74E9] dark:bg-blue-400 rounded-full animate-pulse"></div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Resend & Retry Actions Panel */}
        <div className="flex items-center justify-center gap-3 text-xs pt-1">
          {resendCountdown > 0 ? (
            <p className="text-gray-500 dark:text-[#A2B3AA] font-normal">
              Resend code in <span className="font-semibold text-gray-700 dark:text-white font-mono">00:{formattedSeconds}</span>
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={loading || resending}
              className="font-semibold text-[#2F74E9] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Sending Code...' : 'Resend Code'}</span>
            </button>
          )}

          <span className="text-gray-300 dark:text-white/20">•</span>

          <button
            onClick={handleRestartFlow}
            className="text-gray-600 dark:text-[#A2B3AA] hover:text-gray-900 dark:hover:text-white font-medium hover:underline cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Try Another Number</span>
          </button>
        </div>

        {/* Verify Action Button */}
        <div className="w-full px-1 pt-1">
          <button
            id="btn-verify-otp"
            onClick={() => verifyCode(digits.join(''))}
            disabled={loading || digits.some((d) => !d) || isSuccess}
            className="w-full h-[48px] rounded-xl bg-[#2F74E9] hover:bg-[#2563EB] active:scale-[0.99] text-white font-semibold text-[14px] flex items-center justify-center shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying...</span>
              </div>
            ) : isSuccess ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Verified!</span>
              </div>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </div>
      </div>

      {/* iOS-Style Custom On-Screen Numeric Keypad */}
      <div className="w-full max-w-[340px] mx-auto bg-[#E5E9F0]/80 dark:bg-[#121E19] p-2 rounded-2xl shadow-inner mt-2 mb-1 transition-colors">
        <div className="grid grid-cols-3 gap-1.5">
          {keypadRows.flat().map((key, i) => {
            if (key.isBlank) {
              return <div key={i} className="h-10"></div>;
            }

            if (key.isBackspace) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-10 rounded-lg flex items-center justify-center text-gray-800 dark:text-white hover:bg-white/60 dark:hover:bg-white/10 active:bg-white/90 active:scale-95 transition-all cursor-pointer"
                  aria-label="Backspace"
                >
                  <div className="w-7 h-5 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                      <line x1="18" y1="9" x2="12" y2="15"></line>
                      <line x1="12" y1="9" x2="18" y2="15"></line>
                    </svg>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleKeypadPress(key.num)}
                className="h-10 bg-white dark:bg-[#17231E] rounded-lg flex flex-col items-center justify-center shadow-xs border border-white/80 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1E2E27] active:bg-gray-200/80 active:scale-95 transition-all cursor-pointer select-none"
              >
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                  {key.num}
                </span>
                {key.letters && (
                  <span className="text-[7px] font-bold text-gray-500 dark:text-[#A2B3AA] tracking-widest uppercase mt-0.5 leading-none">
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

