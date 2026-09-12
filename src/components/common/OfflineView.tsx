import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useLanguage } from '../../context/LanguageContext';

export const OfflineView: React.FC = () => {
  const { refreshStatus } = useOnlineStatus();
  const { isBengali } = useLanguage();
  const [isChecking, setIsChecking] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleRetry = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    setShowError(false);
    
    // Simulate a short delay for checking state
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const isActuallyOnline = await refreshStatus();
    
    if (!isActuallyOnline) {
      setShowError(true);
      setIsChecking(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-white dark:bg-[#020617] flex flex-col items-center justify-center p-8 text-center select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xs w-full flex flex-col items-center"
      >
        {/* Illustration Area */}
        <div className="relative mb-10">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
          />
          <div className="relative w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center shadow-inner">
            <WifiOff className="w-16 h-16 text-blue-600 dark:text-blue-400 stroke-[1.5]" />
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border border-blue-100 dark:border-white/10 flex items-center justify-center"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          </motion.div>
        </div>

        {/* Typography */}
        <h1 className="text-2xl font-black text-[#11241C] dark:text-white tracking-tight mb-3">
          {isBengali ? 'ইন্টারনেট নেই' : 'No Connection'}
        </h1>
        <p className="text-sm font-semibold text-[#55685F] dark:text-[#94A3B8] leading-relaxed mb-10 px-4">
          {isBengali 
            ? 'আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে ডেটা বা ওয়াইফাই পরীক্ষা করে আবার চেষ্টা করুন।' 
            : 'It looks like you are offline. Please check your internet connection and try again to access MYJPG.'}
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full h-14 bg-[#2563EB] dark:bg-[#3B82F6] hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isBengali ? 'আবার চেষ্টা করুন' : 'Try Again'}</span>
          </button>

          <button
            className="w-full h-14 bg-[#FAF8F5] dark:bg-[#111C35] border border-[#E8E4DA] dark:border-white/10 text-[#11241C] dark:text-white font-black text-sm rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E293B]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isBengali ? 'সাপোর্ট সেন্টারে কথা বলুন' : 'Contact Support'}</span>
          </button>

          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-red-500 dark:text-red-400 text-[11px] font-bold py-2"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{isBengali ? 'এখনও সংযোগ পাওয়া যায়নি' : 'Still disconnected'}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Branding Footer */}
        <div className="mt-12 flex items-center gap-1.5 opacity-40">
          <span className="text-[10px] font-black text-[#11241C] dark:text-white tracking-widest uppercase">
            MYJPG
          </span>
          <div className="w-1 h-1 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-[#55685F] dark:text-[#94A3B8] uppercase tracking-wider">
            Offline Mode
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
