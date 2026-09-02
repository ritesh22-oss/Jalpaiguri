import React, { useState } from 'react';
import {
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { HandshakePinLogo } from '../common/HandshakePinLogo';

export const AuthView: React.FC = () => {
  const { loginWithGoogle, sendPhoneOtp, setPendingPhone } = useAuth();
  const { navigate, replaceView } = useNav();

  const [rawPhone, setRawPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleClick = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginWithGoogle();
      setLoading(false);

      if (res.success) {
        setSuccessMsg(res.isNewUser ? 'Welcome! Setting up your profile...' : 'Welcome back!');
        setTimeout(() => {
          if (res.isNewUser) {
            replaceView('profile-setup');
          } else {
            replaceView('home');
          }
        }, 500);
      } else {
        if (res.message) {
          setErrorMsg(res.message);
        }
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Google sign-in could not be completed. You can sign in with your Phone Number.');
    }
  };

  const handlePhoneContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = rawPhone.replace(/\D/g, '');

    if (digitsOnly.length > 0) {
      const formattedNumber = `+91 ${digitsOnly.slice(-10)}`;
      setPendingPhone(formattedNumber);
    }
    navigate('phone-auth');
  };

  return (
    <div className="min-h-screen bg-white text-[#11241C] flex flex-col justify-between p-5 max-w-md mx-auto select-none relative shadow-2xl">
      {/* Top Navigation Bar with Back Button & Centered "Sign In" */}
      <div className="w-full flex items-center justify-between pt-2 pb-2">
        <button
          onClick={() => navigate('onboarding')}
          className="p-1 -ml-1 text-gray-800 hover:text-black active:scale-95 transition-all cursor-pointer"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <h1 className="text-base font-bold text-gray-900 tracking-tight">
          Sign In
        </h1>

        {/* Empty placeholder to ensure perfect center alignment */}
        <div className="w-6"></div>
      </div>


      {/* Main Content Area */}
      <div className="w-full px-1 my-auto flex flex-col items-center">
        {/* Brand Logo: Handshake with Pin & Jalpaiguri Connect */}
        <div className="my-10 flex items-center justify-center">
          <HandshakePinLogo size="lg" showText={true} />
        </div>

        {/* Status Alerts */}
        <div className="w-full space-y-2 mb-3">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-snug">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 flex items-center gap-2 font-bold animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs">{successMsg}</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="w-full space-y-4">
          {/* PRIMARY: Continue with Google Button */}
          <button
            id="btn-google-auth"
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full h-[48px] rounded-xl bg-[#2F74E9] hover:bg-[#2563EB] active:scale-[0.99] text-white font-semibold text-[14px] flex items-center justify-center relative shadow-sm transition-all cursor-pointer disabled:opacity-70 px-4"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span className="font-semibold text-white">Signing in...</span>
              </div>
            ) : (
              <>
                {/* White square badge with Google G icon */}
                <div className="absolute left-2.5 w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-2xs shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-white tracking-normal">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Divider: "or sign in with phone" */}
          <div className="flex items-center justify-center my-2">
            <span className="text-xs text-gray-500 font-normal">
              or sign in with phone
            </span>
          </div>

          {/* Phone Input Box */}
          <form onSubmit={handlePhoneContinue} className="space-y-3.5">
            <div className="w-full bg-white border border-gray-300 rounded-xl px-2 py-1 flex items-center shadow-2xs focus-within:border-[#2F74E9] focus-within:ring-1 focus-within:ring-[#2F74E9] transition-all">
              {/* Country code pill */}
              <div className="flex items-center gap-1 pl-1.5 pr-2 py-1.5 shrink-0 select-none">
                <span className="text-sm font-semibold text-gray-900">+91</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 stroke-[2]" />
              </div>

              {/* Vertical divider */}
              <div className="h-5 w-[1px] bg-gray-200 mx-1 shrink-0"></div>

              {/* Input field */}
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={rawPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setRawPhone(val);
                }}
                placeholder="Phone Number"
                className="w-full py-2 px-2 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            {/* SECONDARY: Continue Button */}
            <button
              id="btn-phone-continue"
              type="submit"
              disabled={phoneLoading || rawPhone.replace(/\D/g, '').length < 10}
              className="w-full h-[48px] rounded-xl bg-[#2F74E9] hover:bg-[#2563EB] active:scale-[0.99] text-white font-semibold text-[14px] flex items-center justify-center shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {phoneLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending OTP...</span>
                </div>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom iOS Home Indicator */}
      <div className="w-full flex justify-center pb-1 pt-4">
        <div className="w-32 h-1 bg-black/80 rounded-full"></div>
      </div>
    </div>
  );
};

