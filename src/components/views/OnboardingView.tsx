import React from 'react';
import { CommunityIllustration } from '../common/CommunityIllustration';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

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
    <div className="min-h-screen bg-white dark:bg-[#0F1A15] text-[#11241C] dark:text-white flex flex-col justify-between p-6 max-w-md mx-auto select-none shadow-2xl transition-colors">
      {/* Top bar with Language Switcher */}
      <div className="w-full pt-1 flex justify-end">
        <button
          onClick={toggleLanguage}
          className="h-8 px-3 rounded-full bg-[#FAF8F5] dark:bg-[#1A2822] border border-[#E8E4DA] dark:border-white/10 text-xs font-bold text-[#063B2C] dark:text-[#4ECCA3] flex items-center gap-1.5 shadow-2xs hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isBengali ? 'English' : 'বাংলা'}</span>
        </button>
      </div>

      {/* Center Community Illustration & Information */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 my-auto pt-2">
        {/* Vector Illustration */}
        <div className="w-full max-w-[320px] mb-8 flex justify-center transform transition-transform hover:scale-102">
          <CommunityIllustration />
        </div>

        {/* Title */}
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#064E3B] dark:text-emerald-400 tracking-tight mb-3 font-sans leading-tight">
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
        <p className="text-xs sm:text-[13px] text-[#4B5563] dark:text-[#A2B3AA] leading-relaxed max-w-[320px] mx-auto font-normal">
          {isBengali
            ? 'স্থানীয় সেবা, জরুরি রক্তদাতা, চিকিৎসকের তালিকা ও পৌর সমস্যা জানান—সবকিছু এক ঠিকানায়।'
            : 'Discover local services, find blood donors, access medical directories, and report civic issues—all in one place.'}
        </p>
      </div>

      {/* Bottom Action Button & Login Link */}
      <div className="space-y-3.5 pt-2 pb-1">
        <button
          id="get-started-btn"
          onClick={handleGetStarted}
          className="w-full py-3.5 rounded-full bg-[#00A859] hover:bg-[#00924D] active:scale-98 text-white font-bold text-sm tracking-wide shadow-sm transition-all cursor-pointer"
        >
          {isBengali ? 'শুরু করুন' : 'Get Started'}
        </button>

        <div className="text-center">
          <p className="text-xs text-[#6B7280] dark:text-[#A2B3AA] font-normal">
            {isBengali ? 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
            <button
              onClick={handleLogin}
              className="font-bold text-[#00A859] dark:text-emerald-400 hover:underline cursor-pointer ml-0.5"
            >
              {isBengali ? 'লগইন' : 'Login'}
            </button>
          </p>
        </div>

        {/* Bottom iOS Home Indicator */}
        <div className="w-full flex justify-center pt-2">
          <div className="w-32 h-1 bg-black/80 dark:bg-white/60 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};




