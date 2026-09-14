import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#007AFF] text-white text-xs font-bold shadow-sm hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
        title="Install MYJPG App"
        aria-label="Install MYJPG App"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#007AFF]/10 text-[#007AFF] dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold hover:bg-[#007AFF]/20 active:scale-95 transition-all cursor-pointer"
          title="Install MYJPG on iOS"
          aria-label="Install MYJPG on iOS"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0F172A] p-6 shadow-2xl border border-gray-100 dark:border-white/10 relative">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-base font-bold text-[#11241C] dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-[#007AFF]" />
                Install MYJPG on iPhone/iPad
              </h3>
              
              <p className="mt-3 text-sm text-[#55685F] dark:text-gray-300 leading-relaxed">
                To install this app on your iOS device, follow these quick steps in Safari:
              </p>
              
              <ol className="mt-4 space-y-2.5 text-xs text-[#11241C] dark:text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-xs font-bold text-[#007AFF] shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button at the bottom toolbar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-xs font-bold text-[#007AFF] shrink-0">2</span>
                  <span>Scroll down the share sheet and select <strong>Add to Home Screen</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-xs font-bold text-[#007AFF] shrink-0">3</span>
                  <span>Confirm by tapping <strong>Add</strong> in the top-right corner.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback banner for other environments if we want, but returning null keeps it tidy
  return null;
};
