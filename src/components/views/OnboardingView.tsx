import React from 'react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { JPGLogo } from '../common/JPGLogo';
import { Globe } from 'lucide-react';
import { MyJpgLetterMaskHero } from '../common/MyJpgLetterMaskHero';

export const OnboardingView: React.FC = () => {
  const { replaceView } = useNav();
  const { isBengali, toggleLanguage } = useLanguage();

  const handleGetStarted = () => {
    localStorage.setItem('jpg_has_onboarded', 'true');
    replaceView('auth');
  };

  const handleLogin = () => {
    localStorage.setItem('jpg_has_onboarded', 'true');
    replaceView('auth');
  };

  return (
    <div className="w-full min-h-[100dvh] bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-[#F1F5F9] dark:from-[#030712] dark:via-[#0B1329] dark:to-[#020617] text-[#0F172A] dark:text-[#F8FAFC] px-5 py-5 sm:px-6 sm:py-7 select-none transition-colors overflow-y-auto">
      <div className="w-full max-w-lg mx-auto min-h-[calc(100dvh-2.5rem)] sm:min-h-[calc(100dvh-3.5rem)] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-y-5 sm:gap-y-7">
      {/* Top bar with Language Switcher */}
      <div className="w-full flex items-center justify-between">
        <JPGLogo size="sm" showText={true} />
        <button
          onClick={toggleLanguage}
          className="h-8 px-3 rounded-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 text-xs font-bold text-[#007AFF] dark:text-blue-400 flex items-center gap-1.5 shadow-2xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isBengali ? 'English' : 'বাংলা'}</span>
        </button>
      </div>

      {/* Center Community Illustration & Information */}
      <div className="min-h-0 flex flex-col items-center justify-center text-center px-2 py-2 sm:py-4">
        {/* Community Illustration Clipped Inside the Letters 'MY JPG' */}
        <MyJpgLetterMaskHero className="w-full max-w-[430px] mb-5 sm:mb-7" />

        {/* Title */}
        <h1 className="text-[26px] sm:text-[29px] font-extrabold text-[#002D62] dark:text-blue-300 tracking-tight mb-3 font-sans leading-tight">
          {isBengali ? (
            <>
              আপনার নিজের শহরের<br />সাথে যুক্ত থাকুন
            </>
          ) : (
            <>
              Connect with Your<br />Community
            </>
          )}
        </h1>

        {/* Description */}
        <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-[340px] mx-auto font-normal">
          {isBengali
            ? 'স্থানীয় সেবা, জরুরি রক্তদাতা, চিকিৎসকের তালিকা ও পৌর সমস্যা জানান—সবকিছু এক ঠিকানায়।'
            : 'Discover local services, find blood donors, access medical directories, and report civic issues—all in one place.'}
        </p>
      </div>

      {/* Bottom Action Button & Login Link */}
      <div className="space-y-3 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <button
          id="get-started-btn"
          onClick={handleGetStarted}
          className="w-full py-3.5 rounded-2xl bg-[#007AFF] hover:bg-blue-600 active:scale-98 text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer"
        >
          {isBengali ? 'শুরু করুন (সাইন ইন)' : 'Get Started (Sign In)'}
        </button>

        <button
          id="explore-guest-btn"
          onClick={() => {
            localStorage.setItem('jpg_has_onboarded', 'true');
            replaceView('home');
          }}
          className="w-full py-2.5 rounded-2xl bg-white dark:bg-[#1E293B] hover:bg-gray-50 dark:hover:bg-[#2A3B52] text-[#007AFF] dark:text-blue-400 border border-gray-200 dark:border-white/10 font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>🏪</span>
          <span>{isBengali ? 'লগইন ছাড়া অ্যাপ ও বাজার দেখুন (গেস্ট)' : 'Explore App & Local Shops as Guest'}</span>
        </button>

        <div className="text-center pt-0.5">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
            {isBengali ? 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <button
              onClick={handleLogin}
              className="font-bold text-[#007AFF] dark:text-blue-400 hover:underline cursor-pointer ml-0.5"
            >
              {isBengali ? 'লগইন' : 'Login'}
            </button>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};




