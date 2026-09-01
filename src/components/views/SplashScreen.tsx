import React, { useEffect } from 'react';
import { SplashLeafLogo } from '../common/SplashLeafLogo';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';

export const SplashScreen: React.FC = () => {
  const { replaceView } = useNav();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        replaceView('home');
      } else {
        const hasOnboarded = localStorage.getItem('jpg_has_onboarded');
        replaceView(hasOnboarded ? 'auth' : 'onboarding');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [replaceView, user]);

  const handleScreenTap = () => {
    if (user) {
      replaceView('home');
    } else {
      const hasOnboarded = localStorage.getItem('jpg_has_onboarded');
      replaceView(hasOnboarded ? 'auth' : 'onboarding');
    }
  };

  return (
    <div
      onClick={handleScreenTap}
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#2EC27E] via-[#1AA66B] to-[#0B8050] text-white flex flex-col justify-center items-center p-6 select-none cursor-pointer max-w-md mx-auto"
    >
      {/* Center Branding matching Splash screen */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        {/* Leaf & Connected Nodes Emblem */}
        <div className="relative mb-8 transform transition-transform duration-700 hover:scale-105">
          <SplashLeafLogo size="xl" />
        </div>

        {/* Brand Headline */}
        <h1 className="text-3xl sm:text-[32px] font-extrabold tracking-tight text-white mb-2 font-sans">
          Jalpaiguri Connect
        </h1>

        {/* Subtitle */}
        <p className="text-sm font-medium text-white/95 tracking-wide">
          Your City. Your People. One Place.
        </p>
      </div>
    </div>
  );
};

