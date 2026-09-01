import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Signal,
  Wifi,
  Battery,
  Delete,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';

export const OTPView: React.FC = () => {
  const { pendingPhone, verifyPhoneOtp, sendPhoneOtp, setupRecaptcha } = useAuth();
  const { navigate, replaceView } = useNav();

  const [digits, setDigits] = useState<string[]>(['1', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(28);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // Active cursor index (first empty index, or 3 if all filled)
  const activeIndex = digits.findIndex((d) => d === '');
  const currentCursorIndex = activeIndex === -1 ? 3 : activeIndex;

  // 28 second timer countdown
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleKeypadPress = (val: string) => {
    if (loading || isSuccess) return;

    if (val === 'backspace') {
      // Find the last filled digit
      const lastFilledIndex = digits.reduce((last, d, idx) => (d !== '' ? idx : last), -1);
      if (lastFilledIndex !== -1) {
        const newDigits = [...digits];
        newDigits[lastFilledIndex] = '';
        setDigits(newDigits);
        setErrorMsg('');
      }
      return;
    }

    // Add digit to first empty spot
    const firstEmptyIndex = digits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      const newDigits = [...digits];
      newDigits[firstEmptyIndex] = val;
      setDigits(newDigits);
      setErrorMsg('');

      // If all 4 filled, trigger verification
      if (firstEmptyIndex === 3) {
        verifyCode(newDigits.join(''));
      }
    }
  };

  // Allow physical keyboard input as well
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || isSuccess) return;
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadPress('backspace');
      } else if (e.key === 'Enter') {
        const filled = digits.filter(Boolean);
        if (filled.length >= 4) {
          verifyCode(digits.join(''));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [digits, loading, isSuccess]);

  const verifyCode = async (codeToVerify: string) => {
    if (codeToVerify.length < 4) {
      setErrorMsg('Please enter all 4 digits.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyPhoneOtp(codeToVerify);
      setLoading(false);

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          if (res.isNewUser) {
            replaceView('profile-setup');
          } else {
            replaceView('home');
          }
        }, 600);
      } else {
        setShake(true);
        setErrorMsg(res.message || 'Incorrect verification code. Please check and try again.');
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setLoading(false);
      setShake(true);
      setErrorMsg('Verification failed. Please try entering the code again.');
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const verifier = setupRecaptcha('recaptcha-resend-box');
      if (verifier && pendingPhone) {
        await sendPhoneOtp(pendingPhone, verifier);
      }
      setLoading(false);
      setResendCountdown(28);
      setDigits(['', '', '', '']);
    } catch (err: any) {
      setLoading(false);
      setResendCountdown(28);
      setDigits(['', '', '', '']);
    }
  };

  // Format seconds as 00:ss
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
    <div className="min-h-screen bg-white text-[#11241C] flex flex-col justify-between p-5 max-w-md mx-auto select-none relative shadow-2xl">
      <div id="recaptcha-resend-box"></div>

      {/* Top Mobile Status Bar (9:41, Cellular, WiFi, Battery) */}
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

      {/* Top Navigation Header Bar with Back button & Centered Title */}
      <div className="w-full flex items-center justify-between pt-2 pb-2">
        <button
          onClick={() => navigate('auth')}
          className="p-1 -ml-1 text-gray-800 hover:text-black active:scale-95 transition-all cursor-pointer"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-bold text-gray-900 tracking-tight">
          Verify Phone
        </h1>

        <div className="w-6"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col items-center text-center space-y-5 pt-3 pb-2 my-auto">
        {/* Instruction Subtitle */}
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-gray-900">
            Enter the 4-digit code sent to
          </p>
          <p className="text-sm font-bold text-gray-900 tracking-wide">
            {pendingPhone || '+91 98765 43210'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 flex items-center gap-2 max-w-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p className="text-[11px] leading-tight text-left">{errorMsg}</p>
          </div>
        )}

        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 flex items-center gap-2 font-bold max-w-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs">Phone verified successfully!</p>
          </div>
        )}

        {/* 4 Circular OTP Input Display matching image */}
        <div className={`flex items-center justify-center gap-3.5 py-1 ${shake ? 'animate-shake' : ''}`}>
          {digits.map((digit, idx) => {
            const isFilled = Boolean(digit);
            const isActive = idx === currentCursorIndex && !isFilled;

            return (
              <div
                key={idx}
                onClick={() => {
                  const newDigits = [...digits];
                  for (let i = idx; i < 4; i++) newDigits[i] = '';
                  setDigits(newDigits);
                }}
                className={`w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
                  isActive
                    ? 'border-2 border-[#2F74E9] bg-white ring-2 ring-blue-100 shadow-2xs'
                    : isFilled
                    ? 'border-2 border-[#2F74E9] bg-white shadow-2xs'
                    : 'border-2 border-gray-200 bg-gray-50/60'
                }`}
              >
                {isFilled ? (
                  <div className="w-3.5 h-3.5 rounded-full bg-[#111827]"></div>
                ) : isActive ? (
                  <div className="w-[2px] h-6 bg-[#2F74E9] rounded-full animate-pulse"></div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Resend Code Timer */}
        <div>
          {resendCountdown > 0 ? (
            <p className="text-xs text-gray-500 font-normal">
              Resend code in <span className="font-semibold text-gray-700">00:{formattedSeconds}</span>
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-xs font-semibold text-[#2F74E9] hover:underline cursor-pointer"
            >
              Resend code
            </button>
          )}
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
            ) : (
              <span>Verify</span>
            )}
          </button>
        </div>
      </div>

      {/* iOS-Style Custom On-Screen Numeric Keypad matching screenshot */}
      <div className="w-full max-w-[340px] mx-auto bg-[#E5E9F0]/80 p-2.5 rounded-2xl shadow-inner mt-2 mb-2">
        <div className="grid grid-cols-3 gap-2">
          {keypadRows.flat().map((key, i) => {
            if (key.isBlank) {
              return <div key={i} className="h-11"></div>;
            }

            if (key.isBackspace) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-11 rounded-lg flex items-center justify-center text-gray-800 hover:bg-white/60 active:bg-white/90 active:scale-95 transition-all cursor-pointer"
                  aria-label="Backspace"
                >
                  <div className="w-7 h-5 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className="h-11 bg-white rounded-lg flex flex-col items-center justify-center shadow-xs border border-white/80 hover:bg-gray-50 active:bg-gray-200/80 active:scale-95 transition-all cursor-pointer select-none"
              >
                <span className="text-xl font-bold text-gray-900 leading-none">
                  {key.num}
                </span>
                {key.letters && (
                  <span className="text-[8px] font-bold text-gray-500 tracking-widest uppercase mt-0.5 leading-none">
                    {key.letters}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom iOS Home Indicator */}
      <div className="w-full flex justify-center pb-1 pt-1">
        <div className="w-32 h-1 bg-black/80 rounded-full"></div>
      </div>
    </div>
  );
};

