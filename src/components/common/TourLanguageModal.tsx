import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNav } from '../../context/NavigationContext';

export const TourLanguageModal: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { isBengali } = useLanguage();
  const { currentView } = useNav();
  const [selectedLang, setSelectedLang] = useState<'English' | 'বাংলা'>(isBengali ? 'বাংলা' : 'English');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show only if user is logged in, profile complete, tour hasn't started, AND on home view
  const shouldShow = user && 
                     user.tourCompleted === undefined && 
                     !user.tourLanguage && 
                     currentView === 'home';

  const handleStartTour = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateProfile({ 
        tourLanguage: selectedLang,
        tourCompleted: false, // Mark as starting
        tourVersion: 1
      });
    } catch (error) {
      console.error('Failed to start tour:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 w-full max-w-[340px] shadow-2xl border border-blue-50 dark:border-white/10 relative overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-xl" />
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-sm">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1 tracking-tight">
            Welcome to MYJPG
          </h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
            Let's take a quick tour of the app.
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {/* English Option */}
          <button
            onClick={() => setSelectedLang('English')}
            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              selectedLang === 'English'
                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-900/20 shadow-sm'
                : 'border-slate-100 dark:border-slate-800 bg-transparent hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                Aa
              </div>
              <div className="text-left">
                <p className="font-black text-slate-900 dark:text-white text-[15px]">English</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">English</p>
              </div>
            </div>
            {selectedLang === 'English' && (
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center animate-in zoom-in duration-300">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </button>

          {/* Bengali Option */}
          <button
            onClick={() => setSelectedLang('বাংলা')}
            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              selectedLang === 'বাংলা'
                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-900/20 shadow-sm'
                : 'border-slate-100 dark:border-slate-800 bg-transparent hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm font-bengali">
                অ
              </div>
              <div className="text-left">
                <p className="font-black text-slate-900 dark:text-white text-[15px] font-bengali">বাংলা</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-bengali">বাংলায়</p>
              </div>
            </div>
            {selectedLang === 'বাংলা' && (
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center animate-in zoom-in duration-300">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </button>
        </div>

        <button
          onClick={handleStartTour}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer group text-sm"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Start App Tour</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};
