import React, { useEffect } from 'react';
import { SplashLeafLogo } from '../common/SplashLeafLogo';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { Wifi, Battery, Signal } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { replaceView } = useNav();
  const { user } = useAuth();

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
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#34C77B] via-[#1EB86E] to-[#12A066] text-white flex flex-col justify-between p-6 select-none cursor-pointer max-w-md mx-auto overflow-hidden shadow-2xl"
    >
      {/* Top Mobile Status Bar (9:41, Cellular, WiFi, Battery) */}
      <div className="w-full flex items-center justify-between pt-1 px-1 text-white/90 text-xs font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 fill-current" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center">
            <Battery className="w-4 h-4 fill-current" />
          </div>
        </div>
      </div>

      {/* Center Branding matching Splash screen */}
      <div className="flex flex-col items-center justify-center text-center my-auto px-4">
        {/* Leaf & Connected Nodes Emblem */}
        <div className="relative mb-6 transform transition-transform duration-700 hover:scale-105">
          <SplashLeafLogo size="xl" className="w-28 h-28" />
        </div>

        {/* Brand Headline */}
        <h1 className="text-3xl font-black tracking-tight text-white mb-2 font-sans drop-shadow-xs">
          Jalpaiguri Connect
        </h1>

        {/* Subtitle */}
        <p className="text-sm font-medium text-white/95 tracking-wide">
          Your City. Your People. One Place.
        </p>
      </div>

      {/* Bottom iOS Home Indicator */}
      <div className="w-full flex justify-center pb-2">
        <div className="w-32 h-1 bg-white/70 rounded-full"></div>
      </div>
    </div>
  );
};


