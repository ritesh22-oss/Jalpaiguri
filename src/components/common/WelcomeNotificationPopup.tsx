import React from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';

interface WelcomeNotificationPopupProps {
  userName: string;
  onClose: () => void;
  isBengali?: boolean;
}

export const WelcomeNotificationPopup: React.FC<WelcomeNotificationPopupProps> = ({
  userName,
  onClose,
  isBengali = false
}) => {
  const { navigate } = useNav();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-full bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-900/50 p-4 animate-in fade-in slide-in-from-top-6 duration-500">
      <div className="flex items-start gap-3.5">
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#007AFF] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
          <Bell className="w-5 h-5 animate-bounce" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0F172A] rounded-full animate-ping" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-black text-[#11241C] dark:text-[#F8FAFC] tracking-tight">
              {isBengali ? `MYJPG-তে স্বাগতম, ${userName}! 👋` : `Welcome to MYJPG, ${userName}! 👋`}
            </h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-[#55685F] dark:text-[#94A3B8] mt-1 leading-relaxed">
            {isBengali 
              ? `আমরা আপনাকে পেয়ে আনন্দিত। জলপাইগুড়ির সমস্ত স্থানীয় পরিষেবা এবং তথ্য এখন আপনার হাতের মুঠোয়।`
              : `We're happy to have you here. Explore MYJPG and discover Jalpaiguri with real-time updates.`}
          </p>
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/10">
            <button
              onClick={() => {
                onClose();
                navigate('notifications');
              }}
              className="py-1.5 px-3 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>{isBengali ? 'বিজ্ঞপ্তি দেখুন' : 'View Notifications'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="py-1.5 px-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              {isBengali ? 'বাতিল' : 'Dismiss'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
