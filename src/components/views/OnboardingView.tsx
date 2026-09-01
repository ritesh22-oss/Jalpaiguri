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
    <div className="min-h-screen bg-white text-[#11241C] flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      {/* Center Community Illustration & Information */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 my-auto pt-6">
        {/* Vector Illustration */}
        <div className="w-full mb-8 flex justify-center transform transition-transform hover:scale-102">
          <CommunityIllustration />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0D4A38] tracking-tight mb-3 font-sans">
          Connect with Your Community
        </h1>

        {/* Description */}
        <p className="text-sm text-[#55685F] leading-relaxed max-w-[310px] mx-auto font-normal">
          Discover local services, find blood donors, access medical directories, and report civic issues—all in one place.
        </p>
      </div>

      {/* Bottom Action Button & Login Link */}
      <div className="space-y-4 pt-4 pb-4">
        <button
          id="get-started-btn"
          onClick={handleGetStarted}
          className="w-full py-4 rounded-full bg-[#0FA958] hover:bg-[#0D944D] active:scale-98 text-white font-bold text-base shadow-md transition-all cursor-pointer"
        >
          Get Started
        </button>

        <div className="text-center">
          <p className="text-xs text-[#55685F] font-medium">
            Already have an account?{' '}
            <button
              onClick={handleLogin}
              className="font-bold text-[#0FA958] hover:underline cursor-pointer ml-1"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

