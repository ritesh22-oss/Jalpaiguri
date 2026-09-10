import React from 'react';
import { ExpoPushBanner } from './ExpoPushBanner';
import { ExpoDevMenuModal } from './ExpoDevMenuModal';
import { ExpoQrModal } from './ExpoQrModal';

export const ExpoDeviceShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#FAF8F5] dark:bg-[#020617] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col relative transition-colors">
      {/* Expo Push Notification Banner */}
      <ExpoPushBanner />

      {/* Main Application View - Real full-screen container */}
      <div className="flex-1 w-full flex flex-col relative">
        {children}
      </div>

      {/* Global Modals */}
      <ExpoDevMenuModal />
      <ExpoQrModal />
    </div>
  );
};
