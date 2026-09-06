import React from 'react';
import {
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';
import { useExpo, ExpoDeviceType } from '../../context/ExpoContext';
import { useTheme } from '../../context/ThemeContext';
import { ExpoPushBanner } from './ExpoPushBanner';
import { ExpoDevMenuModal } from './ExpoDevMenuModal';
import { ExpoQrModal } from './ExpoQrModal';

export const ExpoDeviceShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    deviceType,
    triggerHaptic
  } = useExpo();

  const isFullscreen = deviceType === 'fullscreen';

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-3 select-none">
      {/* Main Device Shell Container - No Expo Dev Toolbar in production app view */}
      <div
        className={`w-full transition-all duration-300 flex justify-center ${
          isFullscreen
            ? 'max-w-none'
            : deviceType === 'iphone-16-pro'
            ? 'max-w-[412px] my-0 sm:my-2'
            : deviceType === 'pixel-9'
            ? 'max-w-[400px] my-0 sm:my-2'
            : 'max-w-md my-0'
        }`}
      >
        <div
          className={`w-full bg-[#F8FAFC] dark:bg-[#020617] relative flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            isFullscreen
              ? 'min-h-screen rounded-none'
              : deviceType === 'iphone-16-pro'
              ? 'rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-[8px] border-[#1E293B] ring-1 ring-white/10 min-h-[850px] max-h-[96vh]'
              : deviceType === 'pixel-9'
              ? 'rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border-[7px] border-[#1E293B] ring-1 ring-white/10 min-h-[840px] max-h-[96vh]'
              : 'rounded-none sm:rounded-3xl shadow-2xl min-h-screen sm:min-h-[820px]'
          }`}
        >
          {/* Realistic Native Status Bar removed per user request */}

          {/* Expo Push Notification Banner */}
          <ExpoPushBanner />

          {/* Inner Application View */}
          <div className="flex-1 w-full overflow-y-auto flex flex-col justify-between relative bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
            {children}
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <ExpoDevMenuModal />
      <ExpoQrModal />
    </div>
  );
};
