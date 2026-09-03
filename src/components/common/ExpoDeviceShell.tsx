import React from 'react';
import {
  Smartphone,
  Wifi,
  BatteryCharging,
  RefreshCw,
  QrCode,
  Sliders,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronDown,
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
    setDeviceType,
    simulatedTime,
    batteryLevel,
    setDevMenuOpen,
    setQrModalOpen,
    triggerHaptic,
    latestOtp
  } = useExpo();
  const { isDarkMode, toggleTheme } = useTheme();

  // Keyboard shortcut listener for Expo Dev Menu (⌘D or Ctrl+M)
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey && e.key === 'd') || (e.ctrlKey && e.key === 'm')) {
        e.preventDefault();
        setDevMenuOpen(true);
        triggerHaptic('medium');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setDevMenuOpen, triggerHaptic]);

  const isFullscreen = deviceType === 'fullscreen';

  return (
    <div className="min-h-screen bg-[#1E2022] text-[#11241C] flex flex-col items-center justify-start p-0 sm:p-4 select-none">
      {/* Top Expo Go Developer Toolbar */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 mb-2 bg-[#282B30]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg text-white">
        {/* Left: Expo Go Branding */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-black flex items-center justify-center font-black text-xs tracking-tighter border border-white/20 shadow-xs">
            EX
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-white">Expo Go</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
            </div>
            <p className="text-[10px] font-mono text-gray-400 truncate max-w-[200px] sm:max-w-xs">
              exp://jalpaiguri-connect.expo.dev
            </p>
          </div>
        </div>

        {/* Center/Right: Device Selector & Quick Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Device Selector Pill */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            {(
              [
                { id: 'iphone-16-pro', label: 'iPhone 16' },
                { id: 'pixel-9', label: 'Pixel 9' },
                { id: 'compact', label: 'Mobile' },
                { id: 'fullscreen', label: 'Full' }
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setDeviceType(item.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  deviceType === item.id
                    ? 'bg-[#2F74E9] text-white shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* QR Code button */}
          <button
            onClick={() => {
              setQrModalOpen(true);
              triggerHaptic('light');
            }}
            title="Scan QR on Mobile Device"
            className="h-8 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline text-[11px]">Scan QR</span>
          </button>

          {/* Dev Menu button */}
          <button
            onClick={() => {
              setDevMenuOpen(true);
              triggerHaptic('medium');
            }}
            title="Expo Dev Menu (⌘D)"
            className="h-8 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px]">Dev Menu</span>
          </button>

          {/* Theme Toggle in Developer Bar */}
          <button
            onClick={() => {
              triggerHaptic('light');
              toggleTheme();
            }}
            title={isDarkMode ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            className="h-8 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-gray-300" />}
            <span className="hidden sm:inline text-[11px]">{isDarkMode ? 'Dark' : 'Light'}</span>
          </button>

          {/* Reload button */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              window.location.reload();
            }}
            title="Reload JavaScript bundle"
            className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-300" />
          </button>
        </div>
      </header>

      {/* Main Device Shell Container */}
      <div
        className={`w-full transition-all duration-300 flex justify-center ${
          isFullscreen
            ? 'max-w-none'
            : deviceType === 'iphone-16-pro'
            ? 'max-w-[412px] my-1'
            : deviceType === 'pixel-9'
            ? 'max-w-[400px] my-1'
            : 'max-w-md my-0 sm:my-1'
        }`}
      >
        <div
          className={`w-full bg-[#FAF8F5] dark:bg-[#0F1713] relative flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            isFullscreen
              ? 'min-h-screen rounded-none'
              : deviceType === 'iphone-16-pro'
              ? 'rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[10px] border-[#2A2B2E] ring-1 ring-white/20 min-h-[850px] max-h-[92vh]'
              : deviceType === 'pixel-9'
              ? 'rounded-[42px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[8px] border-[#1A1A1A] ring-1 ring-white/20 min-h-[840px] max-h-[92vh]'
              : 'rounded-none sm:rounded-3xl shadow-2xl min-h-screen sm:min-h-[800px]'
          }`}
        >
          {/* Realistic Native Status Bar */}
          {!isFullscreen && (
            <div className="w-full bg-white/95 dark:bg-[#15211B]/95 backdrop-blur-md pt-3.5 px-6 pb-2 flex items-center justify-between text-xs text-gray-900 dark:text-gray-100 z-40 border-b border-gray-100 dark:border-white/10 select-none transition-colors">
              {/* Left: Time */}
              <span className="font-bold text-[13px] tracking-tight">{simulatedTime}</span>

              {/* Center: Dynamic Island or Notch */}
              {deviceType === 'iphone-16-pro' ? (
                <div
                  onClick={() => {
                    setDevMenuOpen(true);
                    triggerHaptic('light');
                  }}
                  className="w-24 h-6 bg-black rounded-full flex items-center justify-between px-2 cursor-pointer hover:scale-105 transition-transform"
                  title="Dynamic Island • Tap for Dev Menu"
                >
                  <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[8px] font-bold text-gray-300 font-mono">EXPO</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-950 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                  </div>
                </div>
              ) : deviceType === 'pixel-9' ? (
                <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-gray-800"></div>
              ) : null}

              {/* Right: Cellular "Jio 5G", Wifi, Battery */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">5G</span>
                <Wifi className="w-3.5 h-3.5 text-gray-800 dark:text-gray-200 stroke-[2.2]" />
                <div className="flex items-center gap-0.5 font-bold text-[11px] text-gray-900 dark:text-gray-100">
                  <span>{batteryLevel}%</span>
                  <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                </div>
              </div>
            </div>
          )}

          {/* Expo Push Notification Banner */}
          <ExpoPushBanner />

          {/* Inner Application View */}
          <div className="flex-1 w-full overflow-y-auto flex flex-col justify-between relative bg-[#FAF8F5] dark:bg-[#0F1713] text-[#11241C] dark:text-[#E8ECE9] transition-colors">
            {children}
          </div>

          {/* Native Bottom Home Indicator Bar */}
          {!isFullscreen && (
            <div className="w-full bg-white/95 dark:bg-[#15211B]/95 backdrop-blur-md flex justify-center py-2 z-40 border-t border-gray-100 dark:border-white/10 select-none transition-colors">
              <div className="w-36 h-1.5 bg-black/80 dark:bg-white/40 rounded-full hover:bg-black dark:hover:bg-white/60 transition-colors cursor-grab active:scale-95"></div>
            </div>
          )}
        </div>
      </div>

      {/* Global Modals */}
      <ExpoDevMenuModal />
      <ExpoQrModal />
    </div>
  );
};
