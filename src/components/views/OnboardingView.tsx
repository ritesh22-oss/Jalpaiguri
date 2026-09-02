import React from 'react';
import { CommunityIllustration } from '../common/CommunityIllustration';
import { useNav } from '../../context/NavigationContext';

export const OnboardingView: React.FC = () => {
  const { replaceView } = useNav();

  const handleGetStarted = () => {
    localStorage.setItem('jpg_has_onboarded', 'true');
    replaceView('auth');
  };

  const handleLogin = () => {
    localStorage.setItem('jpg_has_onboarded', 'true');
    replaceView('auth');
  };

  return (
    <div className="min-h-screen bg-white text-[#11241C] flex flex-col justify-between p-6 max-w-md mx-auto select-none shadow-2xl">
      {/* Top spacing */}
      <div className="w-full pt-3"></div>

      {/* Center Community Illustration & Information */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 my-auto pt-2">
        {/* Vector Illustration */}
        <div className="w-full max-w-[320px] mb-8 flex justify-center transform transition-transform hover:scale-102">
          <CommunityIllustration />
        </div>

        {/* Title */}
        <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#064E3B] tracking-tight mb-3 font-sans leading-tight">
          Connect with Your<br />Community
        </h1>

        {/* Description */}
        <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed max-w-[320px] mx-auto font-normal">
          Discover local services, find blood donors, access medical directories, and report civic issues—all in one place.
        </p>
      </div>

      {/* Bottom Action Button & Login Link */}
      <div className="space-y-3.5 pt-2 pb-1">
        <button
          id="get-started-btn"
          onClick={handleGetStarted}
          className="w-full py-3.5 rounded-full bg-[#00A859] hover:bg-[#00924D] active:scale-98 text-white font-bold text-sm tracking-wide shadow-sm transition-all cursor-pointer"
        >
          Get Started
        </button>

        <div className="text-center">
          <p className="text-xs text-[#6B7280] font-normal">
            Already have an account?{' '}
            <button
              onClick={handleLogin}
              className="font-bold text-[#00A859] hover:underline cursor-pointer ml-0.5"
            >
              Login
            </button>
          </p>
        </div>

        {/* Bottom iOS Home Indicator */}
        <div className="w-full flex justify-center pt-2">
          <div className="w-32 h-1 bg-black/80 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};



