import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  Home, 
  Search, 
  MapPin, 
  Compass, 
  User, 
  Wrench
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface TourStep {
  id: string;
  targetId: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: 'home-top-logo',
    titleEn: 'Welcome to MYJPG',
    titleBn: 'MYJPG-এ আপনাকে স্বাগতম',
    descEn: 'Your local gateway to Jalpaiguri. Find useful services, discover places, get help, and stay connected with your community from one app.',
    descBn: 'MYJPG হলো জলপাইগুড়ির আপনার স্থানীয় কমিউনিটি অ্যাপ। এক জায়গা থেকেই পরিষেবা খুঁজুন, নতুন জায়গা আবিষ্কার করুন এবং স্থানীয় মানুষের সঙ্গে যুক্ত থাকুন।',
    icon: <Home className="w-5 h-5" />
  },
  {
    id: 'ai-assistant',
    targetId: 'home-ai-assistant-box',
    titleEn: 'Meet your MYJPG AI Assistant',
    titleBn: 'আপনার MYJPG AI অ্যাসিস্ট্যান্ট',
    descEn: 'Ask questions naturally and get help finding local services, places, transport, doctors, workers, shops and more across Jalpaiguri.',
    descBn: 'MYJPG AI Assistant-কে স্বাভাবিক ভাষায় প্রশ্ন করুন এবং জলপাইগুড়ির পরিষেবা, জায়গা, পরিবহন, ডাক্তার, কর্মী, দোকানসহ আরও অনেক কিছু খুঁজে পেতে সাহায্য নিন।',
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 'city-services',
    targetId: 'home-city-services',
    titleEn: 'City Services',
    titleBn: 'শহরের পরিষেবা',
    descEn: 'Find everyday services available across Jalpaiguri, from workers and medical help to transport, jobs, rentals, shops and other useful local services.',
    descBn: 'জলপাইগুড়ির দৈনন্দিন প্রয়োজনীয় পরিষেবাগুলি এক জায়গায় খুঁজে নিন। কর্মী, চিকিৎসা, পরিবহন, চাকরি, ভাড়া, দোকান এবং আরও অনেক স্থানীয় পরিষেবা এখানে পাওয়া যাবে।',
    icon: <Wrench className="w-5 h-5" />
  },
  {
    id: 'discovery',
    targetId: 'home-discovery',
    titleEn: 'Discover Jalpaiguri',
    titleBn: 'জলপাইগুড়ি আবিষ্কার করুন',
    descEn: 'Explore places around Jalpaiguri, including parks, landmarks, markets, restaurants, institutions and other places worth knowing about.',
    descBn: 'জলপাইগুড়ির বিভিন্ন জায়গা আবিষ্কার করুন। পার্ক, দর্শনীয় স্থান, বাজার, রেস্তোরাঁ, প্রতিষ্ঠান এবং আরও অনেক স্থান খুঁজে দেখুন।',
    icon: <Compass className="w-5 h-5" />
  },
  {
    id: 'search',
    targetId: 'home-search-bar',
    titleEn: 'Search MYJPG',
    titleBn: 'MYJPG-এ খুঁজুন',
    descEn: 'Search for local services, people, places and information, or simply describe what you need.',
    descBn: 'স্থানীয় পরিষেবা, মানুষ, জায়গা ও তথ্য খুঁজুন অথবা আপনার প্রয়োজনটি সরাসরি লিখে জানান।',
    icon: <Search className="w-5 h-5" />
  },
  {
    id: 'map',
    targetId: 'home-live-map',
    titleEn: 'Explore with the Map',
    titleBn: 'ম্যাপের মাধ্যমে জানুন',
    descEn: 'Use your real location to discover nearby services and places. Tap any point on the map to view detailed location information.',
    descBn: 'আপনার আসল অবস্থান ব্যবহার করে কাছাকাছি পরিষেবা ও জায়গা খুঁজুন। ম্যাপে যেকোনো জায়গায় ট্যাপ করে বিস্তারিত অবস্থানের তথ্য দেখুন।',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'navigation',
    targetId: 'nav-home',
    titleEn: 'Quick Navigation',
    titleBn: 'দ্রুত নেভিগেশন',
    descEn: 'Your main navigation keeps MYJPG\'s key sections within easy reach.',
    descBn: 'মূল নেভিগেশন থেকে MYJPG-এর গুরুত্বপূর্ণ বিভাগগুলিতে সহজেই যেতে পারবেন।',
    icon: <Compass className="w-5 h-5" />
  },
  {
    id: 'profile',
    targetId: 'home-profile-btn',
    titleEn: 'Your Profile',
    titleBn: 'আপনার প্রোফাইল',
    descEn: 'Manage your account, preferences, saved items, language, settings and other personal MYJPG options from your profile.',
    descBn: 'আপনার প্রোফাইল থেকে অ্যাকাউন্ট, পছন্দ, সংরক্ষিত আইটেম, ভাষা, সেটিংস এবং অন্যান্য MYJPG অপশন পরিচালনা করুন।',
    icon: <User className="w-5 h-5" />
  }
];

export const AppTour: React.FC = () => {
  const { user, updateProfile, isProfileComplete } = useAuth();
  const { isBengali } = useLanguage();
  const { currentView } = useNav();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const tourLanguage = user?.tourLanguage || (isBengali ? 'বাংলা' : 'English');
  const displayBengali = tourLanguage === 'বাংলা';

  // Handle body overflow
  useEffect(() => {
    const isTourActive = isReady && currentView === 'home' && !user?.tourCompleted && isProfileComplete;
    
    if (isTourActive) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isReady, currentView, user?.tourCompleted, isProfileComplete]);

  // Update target rect when step changes or window resizes
  useEffect(() => {
    if (currentView !== 'home' || !isProfileComplete) return;

    const updateRect = () => {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (!isVisible) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    const timer = setTimeout(() => {
      updateRect();
      setIsReady(true);
    }, 400);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    const handleReplay = () => {
      setCurrentStepIndex(0);
      setIsReady(true);
      updateProfile({ tourCompleted: false });
    };

    window.addEventListener('replay-app-tour', handleReplay);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('replay-app-tour', handleReplay);
      clearTimeout(timer);
    };
  }, [currentStep.targetId, currentStepIndex, updateProfile, currentView, isProfileComplete]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const handleComplete = async () => {
    if (user) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      localStorage.setItem('jpg_has_seen_tour', 'true');
      await updateProfile({ tourCompleted: true, tourVersion: 1 });
    }
  };

  if (!user || user.tourCompleted || !isReady || currentView !== 'home' || !isProfileComplete) return null;

  // Calculate dynamic professional card position
  const getCardStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%' };

    const padding = 16;
    const cardWidth = Math.min(window.innerWidth - 32, 320);
    const cardHeightEstimate = 180;
    const spaceAbove = targetRect.top;
    const spaceBelow = window.innerHeight - targetRect.bottom;

    let top: number;
    
    if (spaceBelow > cardHeightEstimate + padding) {
      top = targetRect.bottom + padding;
    } else if (spaceAbove > cardHeightEstimate + padding) {
      top = targetRect.top - cardHeightEstimate - padding;
    } else {
      top = window.innerHeight / 2 - cardHeightEstimate / 2;
    }

    const maxTop = window.innerHeight - cardHeightEstimate - 24;
    const minTop = 24;
    top = Math.max(minTop, Math.min(top, maxTop));

    return {
      top,
      left: '50%',
      width: `${cardWidth}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dynamic Animated Spotlight Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-all duration-500 pointer-events-auto overflow-hidden">
        {targetRect && (
          <motion.div 
            layoutId="spotlight"
            className="absolute bg-transparent pointer-events-auto"
            initial={false}
            animate={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 28,
              mass: 0.7
            }}
            style={{
              borderRadius: '20px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65), 0 0 25px 4px rgba(0, 122, 255, 0.5)',
              zIndex: 1
            }}
          >
            {/* Pulsing Outer Aura */}
            <motion.div 
              animate={{ 
                scale: [1, 1.04, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 1.8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 border-2 border-blue-400 rounded-2xl shadow-[0_0_15px_rgba(0,122,255,0.8)]"
            />
          </motion.div>
        )}
      </div>

      {/* Professional Animated Info Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 25, x: '-50%', scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -15, x: '-50%', scale: 0.9 }}
          transition={{ 
            type: 'spring',
            stiffness: 320,
            damping: 26
          }}
          className="absolute z-[102] pointer-events-auto"
          style={getCardStyle()}
        >
          <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-200/60 dark:border-blue-500/30 p-5 relative overflow-hidden ring-4 ring-blue-500/10">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />

            {/* Header */}
            <div className="flex items-start gap-3 mb-3 relative z-10">
              <motion.div 
                initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-[#007AFF] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0"
              >
                {currentStep.icon}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {displayBengali ? `ধাপ ${currentStepIndex + 1} / ${TOUR_STEPS.length}` : `Step ${currentStepIndex + 1} of ${TOUR_STEPS.length}`}
                  </span>
                  <button 
                    onClick={handleSkip}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <motion.h4 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-snug truncate"
                >
                  {displayBengali ? currentStep.titleBn : currentStep.titleEn}
                </motion.h4>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-1.5 mb-3.5 relative z-10">
              {TOUR_STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-all duration-400 ${
                    idx === currentStepIndex 
                      ? 'bg-blue-600 shadow-xs shadow-blue-500/50' 
                      : idx < currentStepIndex 
                        ? 'bg-blue-300 dark:bg-blue-800' 
                        : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 relative z-10 font-normal"
            >
              {displayBengali ? currentStep.descBn : currentStep.descEn}
            </motion.p>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10 relative z-10">
              <button
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className={`flex items-center gap-1 text-xs font-bold transition-all ${
                  currentStepIndex === 0 
                    ? 'opacity-30 cursor-not-allowed text-slate-400' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer active:scale-95'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{displayBengali ? 'পূর্ববর্তী' : 'Back'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer px-2 py-1 transition-colors"
                >
                  {displayBengali ? 'এড়িয়ে যান' : 'Skip'}
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-[#007AFF] hover:from-blue-700 hover:to-blue-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>
                    {currentStepIndex === TOUR_STEPS.length - 1 
                      ? (displayBengali ? 'শুরু করুন' : 'Finish Tour') 
                      : (displayBengali ? 'পরবর্তী' : 'Next')}
                  </span>
                  {currentStepIndex < TOUR_STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip Confirmation Dialog */}
      <AnimatePresence>
        {showSkipConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-white/10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {displayBengali ? 'ট্যুরটি এড়িয়ে যাবেন?' : 'Skip the app tour?'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {displayBengali 
                    ? 'গাইডেড ট্যুরের মাধ্যমে MYJPG-এর সমস্ত দরকারী বৈশিষ্ট্যগুলো দ্রুত জেনে নেওয়া যায়।' 
                    : 'The guided tour helps you quickly discover all key features of MYJPG.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleComplete}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {displayBengali ? 'হ্যাঁ, এড়িয়ে যান' : 'Yes, Skip'}
                </button>
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/30 transition-all cursor-pointer"
                >
                  {displayBengali ? 'ট্যুর চালিয়ে যান' : 'Continue Tour'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
