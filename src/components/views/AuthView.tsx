import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { JalpaiguriLogo } from '../common/JalpaiguriLogo';

export const AuthView: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const { navigate, replaceView } = useNav();
  const { isBengali, language, setLanguage } = useLanguage();

  // Loading & Alert states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Google Sign-In
  const handleGoogleClick = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginWithGoogle();
      setLoading(false);

      if (res.success) {
        setSuccessMsg(res.isNewUser ? (isBengali ? 'MYJPG-এ স্বাগতম!' : 'Welcome to MYJPG!') : (isBengali ? 'আবার স্বাগতম!' : 'Welcome back!'));
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
      setErrorMsg(isBengali ? 'গুগল সাইন ইন সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' : 'Google sign-in could not be completed. Please try again.');
    }
  };

  // 2. Admin Google Sign-In
  const handleAdminGoogleClick = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await loginWithGoogle({ asAdmin: true });
      setLoading(false);

      if (res.success) {
        setSuccessMsg(isBengali ? 'অ্যাডমিন ড্যাশবোর্ডে স্বাগতম!' : 'Welcome to Admin Dashboard!');
        setTimeout(() => {
          replaceView('admin-dashboard');
        }, 500);
      } else {
        // Specifically show the exact message requested by the user, if denied
        if (res.message) {
          if (res.message.toLowerCase().includes('denied')) {
            setErrorMsg('Admin access denied by the developer.');
          } else {
            setErrorMsg(res.message);
          }
        } else {
          setErrorMsg('Admin access denied by the developer.');
        }
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Admin access denied by the developer.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FBFF] dark:bg-[#020617] text-[#11241C] dark:text-white flex flex-col p-6 select-none relative transition-colors overflow-hidden">
      {/* Background Orbs for Depth */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-between">
      {/* Top Navigation */}
      <div className="w-full flex items-center justify-between mb-8 z-10">
        <button
          onClick={() => navigate('onboarding')}
          className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer rounded-full"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center bg-white/50 dark:bg-white/5 backdrop-blur-sm p-1 rounded-full border border-blue-100 dark:border-white/10 shadow-sm">
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="text-[11px] font-bold px-3 py-1 rounded-full text-[#2563EB] dark:text-[#3B82F6] hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            {language === 'bn' ? 'ENGLISH' : 'বাংলা'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 z-10">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Transparent Logo without background card or border */}
          <div className="flex flex-col items-center select-none">
            <div className="relative mb-3 flex items-center justify-center">
              <JalpaiguriLogo size="xl" showText={false} />
            </div>

            {/* Unified Brand Typography: MY in black, JPG in brand blue */}
            <div className="flex items-center tracking-tight leading-none text-3xl sm:text-4xl font-black font-sans">
              <span className="text-black dark:text-white font-black">
                MY
              </span>
              <span className="text-[#2563EB] dark:text-[#38BDF8] font-black ml-1">
                JPG
              </span>
            </div>

            {/* Subtitle: Your Jalpaiguri Connected */}
            <span className="mt-2 font-extrabold text-[#1D4ED8] dark:text-[#60A5FA] text-[9.5px] sm:text-[10.5px] tracking-[0.24em] uppercase font-sans">
              {isBengali ? 'আপনার জলপাইগুড়ি, সংযুক্ত' : 'Your Jalpaiguri Connected'}
            </span>
          </div>
          
          <div className="space-y-1 px-2 pt-1">
            <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-relaxed max-w-[280px] mx-auto font-medium">
              {isBengali 
                ? 'নির্ভরযোগ্য স্থানীয় পরিষেবা, দোকান, শ্রমিক এবং স্বাস্থ্যসেবার সাথে সরাসরি সংযুক্ত হন।'
                : 'Connect with trusted local services, shops, workers, and healthcare.'}
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        <div className="w-full max-w-sm px-4">
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/40 rounded-xl p-3 text-rose-900 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/40 rounded-xl p-3 text-blue-900 dark:text-blue-200 flex items-center gap-2.5 font-bold animate-in fade-in slide-in-from-top-1 duration-300">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-[12px] leading-snug">{successMsg}</p>
            </div>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="w-full max-w-[320px] space-y-3">
          {/* Google Sign In */}
          <button
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-white dark:bg-[#111C35] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white font-bold text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>{isBengali ? 'গুগল দিয়ে প্রবেশ' : 'Sign in with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-gray-100 dark:border-white/5"></div>
            <span className="flex-shrink mx-3 text-[9px] font-black text-gray-300 dark:text-white/20 uppercase tracking-widest">
              {isBengali ? 'অথবা' : 'OR'}
            </span>
            <div className="flex-grow border-t border-gray-100 dark:border-white/5"></div>
          </div>

          {/* Phone Sign In */}
          <button
            onClick={() => navigate('phone-auth')}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Phone className="w-4 h-4" />
            <span>{isBengali ? 'ফোন নম্বর দিয়ে প্রবেশ' : 'Continue with Phone'}</span>
          </button>

          {/* Admin Divider */}
          <div className="relative flex items-center pt-4 pb-2">
            <div className="flex-grow border-t border-gray-200 dark:border-white/10 border-dashed"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {isBengali ? 'অ্যাডমিনিস্ট্রেটর' : 'Administrator'}
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/10 border-dashed"></div>
          </div>

          {/* Admin Google Sign In */}
          <button
            onClick={handleAdminGoogleClick}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{isBengali ? 'অ্যাডমিন লগইন (গুগল)' : 'Admin Sign in (Google)'}</span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="w-full flex flex-col items-center pb-6 z-10">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {isBengali ? 'জলপাইগুড়ি পৌরসভা দ্বারা চালিত' : 'Powered by Jalpaiguri Municipality'}
        </p>
      </div>
      </div>
    </div>
  );
};
