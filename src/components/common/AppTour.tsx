import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
  Wrench,
  CheckCircle2
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

  // Handle body overflow to fix scrolling after tour
  useEffect(() => {
    const isTourActive = isReady && currentView === 'home' && !user?.tourCompleted && isProfileComplete;
    
    if (isTourActive) {
      document.body.style.overflow = 'hidden';
      // Also prevent scrolling on touch devices
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
    // Only proceed if we are on the home view and profile is complete
    if (currentView !== 'home' || !isProfileComplete) return;

    const updateRect = () => {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Auto-scroll to keep element in view if it's outside
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

    // Initial delay to let HomeView render completely
    const timer = setTimeout(() => {
      updateRect();
      setIsReady(true);
    }, 600);

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
      // Ensure scrolling is restored immediately
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      await updateProfile({ tourCompleted: true, tourVersion: 1 });
    }
  };

  if (!user || user.tourCompleted || !isReady || currentView !== 'home' || !isProfileComplete) return null;

  // Calculate info card position
  const getCardStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%' };

    const padding = 12;
    const cardWidth = Math.min(window.innerWidth - 32, 240); // Maximum 240px width
    const cardHeightEstimate = 140; 
    const spaceAbove = targetRect.top;
    const spaceBelow = window.innerHeight - targetRect.bottom;

    let top: number;
    
    // Position below if space exists, otherwise above, otherwise center
    if (spaceBelow > cardHeightEstimate + padding) {
      top = targetRect.bottom + padding;
    } else if (spaceAbove > cardHeightEstimate + padding) {
      top = targetRect.top - cardHeightEstimate - padding;
    } else {
      top = window.innerHeight / 2 - cardHeightEstimate / 2;
    }

    // Boundary checks to ensure it stays on screen
    const maxTop = window.innerHeight - cardHeightEstimate - 16;
    const minTop = 16;
    top = Math.max(minTop, Math.min(top, maxTop));

    return {
      top,
      left: '50%',
      width: `${cardWidth}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed Overlay with Hole */}
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-auto overflow-hidden">
            {targetRect && (
          <motion.div 
            layoutId="spotlight"
            className="absolute bg-transparent pointer-events-auto"
            initial={false}
            animate={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 260, 
              damping: 26,
              mass: 0.8
            }}
            style={{
              borderRadius: '12px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
              zIndex: 1
            }}
          >
            {/* Pulsing Accent */}
            <motion.div 
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 border-2 border-blue-400/30 rounded-xl"
            />
          </motion.div>
        )}
      </div>

      {/* Info Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 15, x: '-50%', scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: 10, x: '-50%', scale: 0.95 }}
          transition={{ 
            type: 'spring',
            stiffness: 300,
            damping: 25
          }}
          className="absolute z-[102] pointer-events-auto"
          style={getCardStyle()}
        >
            <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl border border-blue-100/50 dark:border-blue-900/30 p-2.5 relative overflow-hidden">
            {/* Animated Background Glow */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8 blur-xl" />

            {/* Header */}
            <div className="flex items-start gap-1.5 mb-1 relative z-10">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0"
              >
                {React.cloneElement(currentStep.icon as React.ReactElement<any>, { className: 'w-3 h-3' })}
              </motion.div>
              <div className="flex-1 min-w-0 pt-0.5">
                <motion.h4 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-[11px] font-black text-slate-900 dark:text-white leading-tight truncate"
                >
                  {displayBengali ? currentStep.titleBn : currentStep.titleEn}
                </motion.h4>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {TOUR_STEPS.map((_, idx) => (
                    <motion.div 
                      key={idx}
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        idx === currentStepIndex 
                          ? 'w-2 bg-blue-600' 
                          : idx < currentStepIndex 
                            ? 'w-1 bg-blue-300 dark:bg-blue-800' 
                            : 'w-1 bg-slate-100 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <button 
                onClick={handleSkip}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight mb-2.5 px-0.5 relative z-10"
            >
              {displayBengali ? currentStep.descBn : currentStep.descEn}
            </motion.p>

            {/* Actions */}
            <div className="flex items-center justify-between relative z-10">
              <button
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className={`flex items-center gap-0.5 text-[10px] font-bold transition-colors ${
                  currentStepIndex === 0 
                    ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-2.5 h-2.5" />
                <span>{displayBengali ? 'পিছনে' : 'Back'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSkip}
                  className="text-[9px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {displayBengali ? 'এড়িয়ে যান' : 'Skip'}
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>
                    {currentStepIndex === TOUR_STEPS.length - 1 
                      ? (displayBengali ? 'শুরু' : 'Finish') 
                      : (displayBengali ? 'পরবর্তী' : 'Next')}
                  </span>
                  {currentStepIndex < TOUR_STEPS.length - 1 && <ChevronRight className="w-2.5 h-2.5" />}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip Confirmation Dialog */}
      <AnimatePresence>
        {showSkipConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 w-full max-w-[320px] shadow-2xl border border-blue-50 dark:border-white/10"
            >
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5">
                {displayBengali ? 'ট্যুরটি এড়িয়ে যাবেন?' : 'Skip the tour?'}
              </h3>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-5">
                {displayBengali 
                  ? 'গাইডেড ট্যুরের মাধ্যমে MYJPG-এর কিছু বৈশিষ্ট্য আবিষ্কার করা সহজ হতে পারে।' 
                  : 'Guided tour helps discover MYJPG features easier.'}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleComplete}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-600 font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
                >
                  {displayBengali ? 'ট্যুর এড়িয়ে যান' : 'Skip Tour'}
                </button>
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer text-sm"
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
