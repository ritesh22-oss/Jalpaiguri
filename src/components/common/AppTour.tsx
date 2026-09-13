import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
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
  Wrench,
  Store,
  Droplet,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface TourStep {
  id: string;
  targetId: string;
  categoryEn: string;
  categoryBn: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  icon: React.ReactNode;
  accentColor: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targetId: 'home-top-logo',
    categoryEn: 'PORTAL',
    categoryBn: 'পোর্টাল',
    titleEn: 'Welcome to MYJPG',
    titleBn: 'MYJPG-এ স্বাগতম',
    descEn: 'Your digital civic hub for Jalpaiguri services, workers, and community resources.',
    descBn: 'জলপাইগুড়ির নিজস্ব ডিজিটাল নাগরিক পোর্টাল। সকল সেবা এক ক্লিকে পান।',
    icon: <Home className="w-3.5 h-3.5" />,
    accentColor: '#007AFF'
  },
  {
    id: 'locality',
    targetId: 'home-locality-btn',
    categoryEn: 'LOCATION',
    categoryBn: 'এলাকা',
    titleEn: 'Select Your Area',
    titleBn: 'আপনার এলাকা নির্বাচন',
    descEn: 'Pick your ward or tap GPS to discover nearby services and shops around you.',
    descBn: 'ওয়ার্ড নির্বাচন করুন বা জিপিএস দিয়ে কাছের পরিষেবাগুলো দেখুন।',
    icon: <MapPin className="w-3.5 h-3.5" />,
    accentColor: '#0284C7'
  },
  {
    id: 'search',
    targetId: 'home-search-bar',
    categoryEn: 'SEARCH',
    categoryBn: 'অনুসন্ধান',
    titleEn: 'Instant Search',
    titleBn: 'দ্রুত অনুসন্ধান',
    descEn: 'Search or speak to find doctors, electricians, shops, bus timings, and helplines.',
    descBn: 'ডাক্তার, কারিগর, দোকান বা হেল্পলাইন লিখে বা মুখে বলে সহজেই খুঁজুন।',
    icon: <Search className="w-3.5 h-3.5" />,
    accentColor: '#2563EB'
  },
  {
    id: 'ai-assistant',
    targetId: 'home-ai-assistant-box',
    categoryEn: 'AI AGENT',
    categoryBn: 'এআই সহকারী',
    titleEn: 'AI City Assistant',
    titleBn: 'এআই নাগরিক সহকারী',
    descEn: 'Ask civic questions 24/7 in English or Bengali for instant local guidance.',
    descBn: 'যেকোনো নাগরিক তথ্যের জন্য বাংলা বা ইংরেজিতে প্রশ্ন করে উত্তর জানুন।',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    accentColor: '#7C3AED'
  },
  {
    id: 'city-services',
    targetId: 'home-city-services',
    categoryEn: 'SERVICES',
    categoryBn: 'পরিষেবা',
    titleEn: 'City Services',
    titleBn: 'শহরের সকল পরিষেবা',
    descEn: '16+ categories: Mechanics, Plumbers, Health, Transport, and Govt portals.',
    descBn: '১৬টিরও বেশি ক্যাটাগরি: মেকানিক, চিকিৎসা, পরিবহন ও সরকারি সেবা।',
    icon: <Wrench className="w-3.5 h-3.5" />,
    accentColor: '#059669'
  },
  {
    id: 'marketplace',
    targetId: 'home-marketplace-card',
    categoryEn: 'MARKET',
    categoryBn: 'বাজার',
    titleEn: 'Neighborhood Shops',
    titleBn: 'পাড়ার দোকান ও বাজার',
    descEn: 'Discover local shops and catalogs with direct WhatsApp ordering.',
    descBn: 'স্থানীয় দোকানগুলো ব্রাউজ করুন এবং সরাসরি কল বা হোয়াটসঅ্যাপে অর্ডার করুন।',
    icon: <Store className="w-3.5 h-3.5" />,
    accentColor: '#D97706'
  },
  {
    id: 'map',
    targetId: 'home-live-map',
    categoryEn: 'LIVE MAP',
    categoryBn: 'ম্যাপ',
    titleEn: 'Interactive Map',
    titleBn: 'লাইভ মানচিত্র',
    descEn: 'View nearby clinics, pharmacies, ATMs, and landmark places on the live map.',
    descBn: 'কাছের হাসপাতাল, এটিএম ও গুরুত্বপূর্ণ স্থানের অবস্থান ম্যাপে সরাসরি দেখুন।',
    icon: <Compass className="w-3.5 h-3.5" />,
    accentColor: '#EA580C'
  },
  {
    id: 'blood',
    targetId: 'nav-blood',
    categoryEn: 'EMERGENCY',
    categoryBn: 'জরুরি',
    titleEn: 'Blood Donor Network',
    titleBn: 'জরুরি রক্তদাতা নেটওয়ার্ক',
    descEn: 'Find verified donors by group or post an urgent blood request anytime.',
    descBn: 'রক্তের গ্রুপ অনুযায়ী রক্তদাতা খুঁজুন অথবা রক্তের জরুরি আবেদন জানান।',
    icon: <Droplet className="w-3.5 h-3.5" />,
    accentColor: '#DC2626'
  },
  {
    id: 'navigation',
    targetId: 'nav-home',
    categoryEn: 'NAVIGATION',
    categoryBn: 'নেভিগেশন',
    titleEn: 'Quick Navigation',
    titleBn: 'সহজ নেভিগেশন',
    descEn: 'Switch between Home, Shops, Blood Donors, City Hub, and Profile anytime.',
    descBn: 'হোম, দোকান, রক্তদান ও প্রোফাইলের মাঝে সহজে চলাফেরা করুন।',
    icon: <Compass className="w-3.5 h-3.5" />,
    accentColor: '#007AFF'
  }
];

export const AppTour: React.FC = () => {
  const { user, updateProfile, isProfileComplete } = useAuth();
  const { isBengali, toggleLanguage: globalToggleLanguage } = useLanguage();
  const { currentView } = useNav();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    bottom: number;
    right: number;
  } | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [tourLang, setTourLang] = useState<'bn' | 'en'>(isBengali ? 'bn' : 'en');

  // Dynamic viewport tracking
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 360,
    height: typeof window !== 'undefined' ? window.innerHeight : 640
  });

  // Dynamic card height measurement
  const cardRef = useRef<HTMLDivElement>(null);
  const [measuredCardHeight, setMeasuredCardHeight] = useState(110);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (cardRef.current) {
      const h = cardRef.current.offsetHeight;
      if (h > 0 && Math.abs(h - measuredCardHeight) > 2) {
        setMeasuredCardHeight(h);
      }
    }
  }, [currentStepIndex, tourLang, measuredCardHeight]);

  // Keep local tour language in sync with global language context
  useEffect(() => {
    setTourLang(isBengali ? 'bn' : 'en');
  }, [isBengali]);

  const handleToggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLang = tourLang === 'bn' ? 'en' : 'bn';
    setTourLang(nextLang);
    globalToggleLanguage();
  };

  const displayBengali = tourLang === 'bn';
  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  // Measurement function reading DOM node bounding rect
  const measureTarget = useCallback(() => {
    if (currentView !== 'home' || !isProfileComplete) return;

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setTargetRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          bottom: r.bottom,
          right: r.right
        });
      }
    } else {
      // Fallback area centered in top half
      const w = Math.min(window.innerWidth - 32, 260);
      const h = 80;
      setTargetRect({
        top: Math.max(60, window.innerHeight * 0.15),
        left: (window.innerWidth - w) / 2,
        width: w,
        height: h,
        bottom: Math.max(60, window.innerHeight * 0.15) + h,
        right: (window.innerWidth - w) / 2 + w
      });
    }
  }, [currentStep.targetId, currentView, isProfileComplete]);

  // Scroll target smoothly and update rect
  useEffect(() => {
    if (currentView !== 'home' || !isProfileComplete) return;

    setIsReady(false);

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      const isFixedBottom = currentStep.targetId.startsWith('nav-');
      if (!isFixedBottom) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    let count = 0;
    const startPolling = () => {
      measureTarget();
      count++;
      if (count < 20) {
        animationFrameRef.current = requestAnimationFrame(startPolling);
      } else {
        setIsReady(true);
      }
    };

    const initialTimer = setTimeout(() => {
      startPolling();
    }, 60);

    const handleScrollOrResize = () => {
      measureTarget();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    const scrollContainer = document.getElementById('app-root-scroll');
    scrollContainer?.addEventListener('scroll', handleScrollOrResize);

    const handleReplay = () => {
      setCurrentStepIndex(0);
      setIsReady(true);
      updateProfile({ tourCompleted: false });
    };

    window.addEventListener('replay-app-tour', handleReplay);

    return () => {
      clearTimeout(initialTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      scrollContainer?.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('replay-app-tour', handleReplay);
    };
  }, [currentStepIndex, currentView, isProfileComplete, measureTarget, updateProfile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      } else if (e.key === 'Escape') {
        setShowSkipConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const handleComplete = async () => {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    try {
      localStorage.setItem('jpg_has_seen_tour', 'true');
    } catch (_) {}
    await updateProfile({ tourCompleted: true, tourVersion: 1 });
  };

  const hasSeenTourLocal = localStorage.getItem('jpg_has_seen_tour') === 'true';

  if (!user || user.tourCompleted || hasSeenTourLocal || currentView !== 'home' || !isProfileComplete) {
    return null;
  }

  // Compact spotlight calculation
  const pad = 6;
  const spotlight = targetRect
    ? {
        x: Math.max(4, Math.min(targetRect.left - pad, viewport.width - (Math.min(viewport.width - 8, targetRect.width + pad * 2)) - 4)),
        y: Math.max(4, targetRect.top - pad),
        w: Math.min(viewport.width - 8, targetRect.width + pad * 2),
        h: targetRect.height + pad * 2,
        r: targetRect.width < 50 && targetRect.height < 50 ? 20 : 12
      }
    : {
        x: 16,
        y: 70,
        w: viewport.width - 32,
        h: 90,
        r: 12
      };

  const cardHeight = measuredCardHeight || 110;

  // Vertical placement math: strictly inside viewport boundaries
  const targetTop = spotlight.y;
  const targetBottom = spotlight.y + spotlight.h;
  const spaceAbove = targetTop - 8;
  const spaceBelow = viewport.height - targetBottom - 8;

  let isCardAbove = false;
  if (spaceBelow >= cardHeight + 8) {
    if (targetTop > viewport.height * 0.58 && spaceAbove >= cardHeight + 8) {
      isCardAbove = true;
    } else {
      isCardAbove = false;
    }
  } else {
    isCardAbove = true;
  }

  const desiredTop = isCardAbove ? targetTop - cardHeight - 6 : targetBottom + 6;
  const minTop = 10;
  const maxTop = Math.max(minTop, viewport.height - cardHeight - 12);
  const cardTop = Math.min(Math.max(desiredTop, minTop), maxTop);

  return (
    <div className="fixed inset-0 z-[100] select-none pointer-events-none">
      {/* SVG Mask Cut-out (Crystal clear section spotlight) */}
      <svg 
        className="fixed inset-0 w-full h-full pointer-events-auto cursor-pointer"
        onClick={handleNext}
        aria-hidden="true"
      >
        <defs>
          <mask id="app-tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={spotlight.x}
              y={spotlight.y}
              width={spotlight.w}
              height={spotlight.h}
              rx={spotlight.r}
              ry={spotlight.r}
              fill="black"
            />
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(11, 17, 32, 0.76)"
          mask="url(#app-tour-spotlight-mask)"
        />
      </svg>

      {/* Dynamic Animated Spotlight Frame */}
      <motion.div
        className="fixed pointer-events-none z-[101]"
        initial={false}
        animate={{
          top: spotlight.y,
          left: spotlight.x,
          width: spotlight.w,
          height: spotlight.h,
          borderRadius: spotlight.r
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 34,
          mass: 0.5
        }}
      >
        <div 
          className="absolute inset-0 rounded-[inherit] border-2 transition-colors duration-300 shadow-[0_0_16px_rgba(0,122,255,0.6)]"
          style={{ borderColor: currentStep.accentColor }}
        />

        <div 
          className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2"
          style={{ borderColor: currentStep.accentColor }}
        />
        <div 
          className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2"
          style={{ borderColor: currentStep.accentColor }}
        />
        <div 
          className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2"
          style={{ borderColor: currentStep.accentColor }}
        />
        <div 
          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2"
          style={{ borderColor: currentStep.accentColor }}
        />
      </motion.div>

      {/* Container wrapper for horizontal centering without transform conflicts */}
      <div 
        className="fixed inset-x-0 z-[105] pointer-events-none flex justify-center px-3"
        style={{ top: `${cardTop}px` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            ref={cardRef}
            initial={{ opacity: 0, y: isCardAbove ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isCardAbove ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-[260px] pointer-events-auto relative"
          >
            {/* Direction Pointer */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none transition-all ${
                isCardAbove ? '-bottom-1.5' : '-top-1.5'
              }`}
            >
              {isCardAbove ? (
                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white dark:border-t-[#0F172A]" />
              ) : (
                <div className="w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-white dark:border-b-[#0F172A]" />
              )}
            </div>

            <div className="bg-white/98 dark:bg-[#0F172A]/98 backdrop-blur-xl rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] border border-slate-200/90 dark:border-white/10 p-2.5 relative overflow-hidden">
              {/* Top Accent Gradient Line */}
              <div 
                className="absolute top-0 left-0 right-0 h-0.5 transition-colors duration-300"
                style={{ background: `linear-gradient(90deg, ${currentStep.accentColor}, #38BDF8)` }}
              />

              {/* Header: Category Badge, Step Counter & Controls */}
              <div className="flex items-center justify-between gap-1 mb-1 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span 
                    className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${currentStep.accentColor}18`,
                      color: currentStep.accentColor
                    }}
                  >
                    {displayBengali ? currentStep.categoryBn : currentStep.categoryEn}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {currentStepIndex + 1}/{TOUR_STEPS.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Language Switcher */}
                  <button
                    type="button"
                    onClick={handleToggleLanguage}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[8.5px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Switch Language"
                  >
                    <Languages className="w-2.5 h-2.5 text-blue-500" />
                    <span>{displayBengali ? 'EN' : 'বাং'}</span>
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    title="Close Tour"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Icon Row */}
              <div className="flex items-start gap-1.5 mb-1">
                <div
                  className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5"
                  style={{ backgroundColor: currentStep.accentColor }}
                >
                  {currentStep.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {displayBengali ? currentStep.titleBn : currentStep.titleEn}
                  </h3>
                  <p className="text-[9.5px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5 line-clamp-2">
                    {displayBengali ? currentStep.descBn : currentStep.descEn}
                  </p>
                </div>
              </div>

              {/* Slim Progress Bar */}
              <div className="flex items-center gap-0.5 my-1">
                {TOUR_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-0.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentStepIndex
                        ? 'bg-blue-600 dark:bg-blue-400 shadow-sm'
                        : idx < currentStepIndex
                        ? 'bg-blue-200 dark:bg-blue-900'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                    title={displayBengali ? step.titleBn : step.titleEn}
                  />
                ))}
              </div>

              {/* Action Buttons: Back, Skip, Next / Complete */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className={`flex items-center gap-0.5 text-[9.5px] font-bold py-1 px-1 rounded transition-all cursor-pointer ${
                    currentStepIndex === 0
                      ? 'opacity-25 cursor-not-allowed text-slate-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>{displayBengali ? 'আগের' : 'Prev'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-[9.5px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-1 py-0.5 cursor-pointer"
                  >
                    {displayBengali ? 'বাদ দিন' : 'Skip'}
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5 cursor-pointer transition-all"
                  >
                    <span>
                      {currentStepIndex === TOUR_STEPS.length - 1
                        ? displayBengali
                          ? 'সম্পন্ন'
                          : 'Finish'
                        : displayBengali
                        ? 'পরবর্তী'
                        : 'Next'}
                    </span>
                    {currentStepIndex < TOUR_STEPS.length - 1 ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Skip Confirmation Dialog (Compact for mobile) */}
      <AnimatePresence>
        {showSkipConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/70 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              className="bg-white dark:bg-[#0F172A] rounded-xl p-3.5 w-full max-w-[250px] shadow-2xl border border-slate-200 dark:border-white/10 space-y-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Compass className="w-4 h-4 animate-pulse" />
              </div>

              <div className="text-center space-y-0.5">
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                  {displayBengali ? 'ট্যুর এড়িয়ে যাবেন?' : 'Skip tour?'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                  {displayBengali
                    ? 'আপনি পরেও প্রোফাইল থেকে পুনরায় ট্যুরটি দেখতে পারবেন।'
                    : 'You can replay the tour anytime from your Profile.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleComplete}
                  className="py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {displayBengali ? 'হ্যাঁ, বন্ধ' : 'Yes, Skip'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSkipConfirm(false)}
                  className="py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow transition-all cursor-pointer"
                >
                  {displayBengali ? 'চালিয়ে যান' : 'Continue'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
