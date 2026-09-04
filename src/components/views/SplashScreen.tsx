import React, { useEffect } from 'react';
import { SplashLeafLogo } from '../common/SplashLeafLogo';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';

export const SplashScreen: React.FC = () => {
  const { replaceView } = useNav();
  const { isBengali, t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      replaceView('onboarding');
    }, 1800);

    return () => clearTimeout(timer);
  }, [replaceView]);

  const handleScreenTap = () => {
    replaceView('onboarding');
  };

  return (
    <div
      onClick={handleScreenTap}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#26C174] via-[#1EBA6E] to-[#0A8C60] dark:from-[#0B3B26] dark:via-[#082E1E] dark:to-[#051C12] text-white flex flex-col justify-between p-6 select-none cursor-pointer max-w-md mx-auto overflow-hidden shadow-2xl transition-colors"
    >
      {/* Top spacing */}
      <div className="w-full pt-4"></div>

      {/* Center Branding matching Splash screen */}
      <div className="flex flex-col items-center justify-center text-center my-auto px-4">
        {/* Leaf & Connected Nodes Emblem */}
        <div className="relative mb-8 transform transition-transform duration-700 hover:scale-105">
          <SplashLeafLogo size="xl" className="w-28 h-28" />
        </div>

        {/* Brand Headline */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2.5 font-sans drop-shadow-xs">
          {isBengali ? 'জলপাইগুড়ি কানেক্ট' : 'Jalpaiguri Connect'}
        </h1>

        {/* Subtitle */}
        <p className="text-sm font-normal text-white/90 tracking-wide">
          {isBengali ? 'আপনার শহর। আপনার মানুষ। এক স্থানে।' : 'Your City. Your People. One Place.'}
        </p>
      </div>

      {/* Bottom iOS Home Indicator */}
      <div className="w-full flex justify-center pb-2">
        <div className="w-32 h-1 bg-white/70 rounded-full"></div>
      </div>
    </div>
  );
};



