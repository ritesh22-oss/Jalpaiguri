import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  CheckCircle2,
  ArrowDown,
  ArrowUp
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
    categoryEn: 'COMMUNITY PORTAL',
    categoryBn: 'নাগরিক পোর্টাল',
    titleEn: 'Welcome to MYJPG',
    titleBn: 'MYJPG-এ আপনাকে স্বাগতম',
    descEn: 'Your unified digital gateway to Jalpaiguri. Connect with verified civic services, local workers, doctors, hospitals, and community resources instantly.',
    descBn: 'জলপাইগুড়ির নিজস্ব ডিজিটাল নাগরিক প্ল্যাটফর্ম। এক জায়গা থেকেই জরুরি পরিষেবা, কর্মী, ডাক্তার, হাসপাতাল ও কমিউনিটি সুবিধাসমূহ সহজে পান।',
    icon: <Home className="w-5 h-5" />,
    accentColor: '#007AFF'
  },
  {
    id: 'locality',
    targetId: 'home-locality-btn',
    categoryEn: 'GEO LOCATION',
    categoryBn: 'এলাকা ও ওয়ার্ড নির্বাচন',
    titleEn: 'Select Your Area or Ward',
    titleBn: 'আপনার এলাকা বা ওয়ার্ড বেছে নিন',
    descEn: 'Choose your locality (Kadamtala, Dinbazar, Hakimpada, etc.) or tap GPS to automatically discover the nearest services in your ward.',
    descBn: 'আপনার পাড়া বা ওয়ার্ড (কদমতলা, দিনবাজার, হাকিমপাড়া ইত্যাদি) নির্বাচন করুন বা জিপিএস দিয়ে আপনার সবচেয়ে কাছের পরিষেবাগুলো দেখুন।',
    icon: <MapPin className="w-5 h-5" />,
    accentColor: '#0284C7'
  },
  {
    id: 'search',
    targetId: 'home-search-bar',
    categoryEn: 'SMART SEARCH',
    categoryBn: 'দ্রুত অনুসন্ধান',
    titleEn: 'Instant Universal Search',
    titleBn: 'স্মার্ট অনুসন্ধান ও ভয়েস সার্চ',
    descEn: 'Type or speak naturally to find electricians, doctors, medicine, shops, bus timings, emergency contacts, or anything you need.',
    descBn: 'প্রয়োজনীয় কর্মী, ডাক্তার, ওষুধ, দোকান বা যেকোনো পরিষেবা খুঁজে পেতে টাইপ করুন অথবা মাইক্রোফোনে স্বাভাবিক ভাষায় কথা বলুন।',
    icon: <Search className="w-5 h-5" />,
    accentColor: '#2563EB'
  },
  {
    id: 'ai-assistant',
    targetId: 'home-ai-assistant-box',
    categoryEn: 'AI CIVIC AGENT',
    categoryBn: 'এআই নাগরিক সহকারী',
    titleEn: 'MYJPG AI City Assistant',
    titleBn: 'আপনার ২৪x৭ এআই সহকারী',
    descEn: 'Ask questions in English or Bengali! Get instant answers about bus schedules, emergency helplines, municipal offices, and local recommendations.',
    descBn: 'বাংলা বা ইংরেজিতে সরাসরি যেকোনো প্রশ্ন করুন! বাস সময়সূচী, জরুরি হেল্পলাইন, পুরসভার তথ্য ও স্থানীয় পরামর্শ মুহূর্তেই জেনে নিন।',
    icon: <Sparkles className="w-5 h-5" />,
    accentColor: '#7C3AED'
  },
  {
    id: 'city-services',
    targetId: 'home-city-services',
    categoryEn: 'CIVIC SERVICES',
    categoryBn: 'শহরের পরিষেবা',
    titleEn: 'All City Services in One Tap',
    titleBn: 'শহরের সকল প্রয়োজনীয় পরিষেবা',
    descEn: 'Explore 16+ verified local service categories: Plumbers, Electricians, Transport, Courier, Education, Banks, Rentals, and Government portals.',
    descBn: '১৬টিরও বেশি দরকারি ক্যাটাগরি: মেকানিক, প্লাম্বার, পরিবহন, কুরিয়ার, শিক্ষা, এটিএম, বাড়ি ভাড়া ও সরকারি ডিজিটাল সেবা।',
    icon: <Wrench className="w-5 h-5" />,
    accentColor: '#059669'
  },
  {
    id: 'marketplace',
    targetId: 'home-marketplace-card',
    categoryEn: 'LOCAL MARKETPLACE',
    categoryBn: 'স্থানীয় বাজার ও দোকান',
    titleEn: 'Neighborhood Shops & Catalogs',
    titleBn: 'পাড়ার দোকান ও লাইভ পণ্য ক্যাটালগ',
    descEn: 'Discover local grocery, sweets, pharmacy, apparel, and electronics stores with verified phone numbers and direct WhatsApp ordering.',
    descBn: 'জলপাইগুড়ির স্থানীয় মুদিখানা, মিষ্টি, ওষুধ ও পোশাকের দোকান ব্রাউজ করুন এবং দোকানদারের সাথে সরাসরি হোয়াটসঅ্যাপে অর্ডার করুন।',
    icon: <Store className="w-5 h-5" />,
    accentColor: '#D97706'
  },
  {
    id: 'map',
    targetId: 'home-live-map',
    categoryEn: 'LIVE MAP',
    categoryBn: 'লাইভ মানচিত্র',
    titleEn: 'Interactive Civic Map',
    titleBn: 'ইন্টারেক্টিভ লাইভ ম্যাপ',
    descEn: 'View real-time locations of nearby clinics, pharmacies, ATMs, landmark places, and municipal flood or traffic telemetry on the map.',
    descBn: 'কাছাকাছি হাসপাতাল, এটিএম, থানা, ফার্মেসি ও দর্শনীয় স্থানগুলোর অবস্থান ম্যাপে সরাসরি দেখুন এবং এক ক্লিকে ডিরেকশন নিন।',
    icon: <Compass className="w-5 h-5" />,
    accentColor: '#EA580C'
  },
  {
    id: 'blood',
    targetId: 'nav-blood',
    categoryEn: 'EMERGENCY NETWORK',
    categoryBn: 'জরুরি রক্তদান নেটওয়ার্ক',
    titleEn: '24x7 Blood Donor Network',
    titleBn: '২৪x৭ জরুরি রক্তদাতা নেটওয়ার্ক',
    descEn: 'Tap the emergency blood icon anytime to find verified blood donors in Jalpaiguri by blood group, or submit an urgent blood request.',
    descBn: 'জরুরি প্রয়োজনে যেকোনো সময় রক্তের গ্রুপ অনুযায়ী রক্তদাতাদের সাথে যোগাযোগ করুন অথবা রক্ত চেয়ে তাৎক্ষণিক রিকোয়েস্ট পোস্ট করুন।',
    icon: <Droplet className="w-5 h-5" />,
    accentColor: '#DC2626'
  },
  {
    id: 'navigation',
    targetId: 'nav-home',
    categoryEn: 'QUICK NAVIGATION',
    categoryBn: 'সহজ নেভিগেশন',
    titleEn: 'Effortless Bottom Navigation',
    titleBn: 'সহজ নেভিগেশন বার',
    descEn: 'Quickly switch between Home, Local Shops, Blood Network, City Discovery, and your Profile settings anytime.',
    descBn: 'হোম, দোকান, রক্তদান, শহর অনুসন্ধান ও আপনার প্রোফাইল সেটিংসের মাঝে নিমেষেই চলাচল করুন।',
    icon: <Compass className="w-5 h-5" />,
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

  const animationFrameRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<any>(null);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const displayBengali = tourLang === 'bn';

  // Toggle internal and global language
  const handleToggleLanguage = () => {
    const nextLang = tourLang === 'bn' ? 'en' : 'bn';
    setTourLang(nextLang);
    globalToggleLanguage();
  };

  // Synchronize language if external changes
  useEffect(() => {
    setTourLang(isBengali ? 'bn' : 'en');
  }, [isBengali]);

  // Lock body scroll cleanly during tour
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

  // Measurement function that reads the DOM node bounding rect
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
      // Fallback: if element is not in DOM, provide sensible center area
      const w = Math.min(window.innerWidth - 48, 360);
      const h = 140;
      setTargetRect({
        top: Math.max(80, window.innerHeight * 0.2),
        left: (window.innerWidth - w) / 2,
        width: w,
        height: h,
        bottom: Math.max(80, window.innerHeight * 0.2) + h,
        right: (window.innerWidth - w) / 2 + w
      });
    }
  }, [currentStep.targetId, currentView, isProfileComplete]);

  // Scroll target into view and update rect smoothly
  useEffect(() => {
    if (currentView !== 'home' || !isProfileComplete) return;

    setIsReady(false);

    const el = document.getElementById(currentStep.targetId);
    if (el) {
      // Smoothly scroll the element into view centered
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Measure continuously for 650ms during smooth scroll
    let count = 0;
    const startPolling = () => {
      measureTarget();
      count++;
      if (count < 22) {
        animationFrameRef.current = requestAnimationFrame(startPolling);
      } else {
        setIsReady(true);
      }
    };

    const initialTimer = setTimeout(() => {
      startPolling();
    }, 80);

    // Event listeners on capture phase
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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      scrollContainer?.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('replay-app-tour', handleReplay);
    };
  }, [currentStep.targetId, currentStepIndex, measureTarget, updateProfile, currentView, isProfileComplete]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (user?.tourCompleted || currentView !== 'home' || !isProfileComplete) return;

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      } else if (e.key === 'Escape') {
        setShowSkipConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, user?.tourCompleted, currentView, isProfileComplete]);

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
    localStorage.setItem('jpg_has_seen_tour', 'true');
    await updateProfile({ tourCompleted: true, tourVersion: 1 });
  };

  const hasSeenTourLocal = localStorage.getItem('jpg_has_seen_tour') === 'true';

  if (!user || user.tourCompleted || hasSeenTourLocal || currentView !== 'home' || !isProfileComplete) {
    return null;
  }

  // Calculate spotlight box coordinates with comfortable padding
  const pad = 10;
  const spotlight = targetRect
    ? {
        x: Math.max(4, targetRect.left - pad),
        y: Math.max(4, targetRect.top - pad),
        w: Math.min(window.innerWidth - 8, targetRect.width + pad * 2),
        h: targetRect.height + pad * 2,
        r: targetRect.width < 60 && targetRect.height < 60 ? 28 : 20
      }
    : {
        x: 20,
        y: 100,
        w: window.innerWidth - 40,
        h: 180,
        r: 20
      };

  // Determine card placement (above vs below the highlighted element)
  // Determine card dimensions dynamically based on mobile screen width
  const isMobile = window.innerWidth < 640;
  const cardWidth = isMobile ? Math.min(window.innerWidth - 24, 320) : Math.min(window.innerWidth - 32, 380);
  const cardEstimatedHeight = isMobile ? 180 : 230;
  const cardPadding = isMobile ? 12 : 16;

  const spaceAbove = targetRect ? targetRect.top : 200;
  const spaceBelow = targetRect ? window.innerHeight - targetRect.bottom : 200;

  let isCardAbove = false;
  let cardTop = 100;

  if (spaceBelow >= cardEstimatedHeight + cardPadding * 2) {
    // Plenty of space below the element
    isCardAbove = false;
    cardTop = (targetRect?.bottom || 150) + cardPadding;
  } else if (spaceAbove >= cardEstimatedHeight + cardPadding * 2) {
    // Plenty of space above the element
    isCardAbove = true;
    cardTop = Math.max(8, (targetRect?.top || 300) - cardEstimatedHeight - cardPadding);
  } else {
    // In between: center or place where more room exists
    if (spaceBelow >= spaceAbove) {
      isCardAbove = false;
      cardTop = Math.min(window.innerHeight - cardEstimatedHeight - cardPadding, (targetRect?.bottom || 100) + cardPadding);
    } else {
      isCardAbove = true;
      cardTop = Math.max(8, (targetRect?.top || 300) - cardEstimatedHeight - cardPadding);
    }
  }

  // Ensure cardTop stays strictly inside viewport boundaries with comfortable breathing room
  cardTop = Math.max(8, Math.min(cardTop, window.innerHeight - cardEstimatedHeight - 8));

  return (
    <div className="fixed inset-0 z-[100] select-none pointer-events-none">
      {/* 
        CRITICAL ARCHITECTURE: SVG Mask Cut-out (ZERO BLUR)
        - The backdrop uses pure SVG mask cutout.
        - The cutout is 100% transparent with NO backdrop-blur.
        - The underlying section on HomeView is 100% crisp, razor-sharp, with true vibrant colors!
      */}
      <svg 
        className="fixed inset-0 w-full h-full pointer-events-auto cursor-pointer"
        onClick={handleNext}
        aria-hidden="true"
      >
        <defs>
          <mask id="app-tour-spotlight-mask">
            {/* White area = opaque backdrop covering the page */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout = 100% crystal-clear transparent hole with zero overlay */}
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

        {/* Crisp, deep dark scrim that highlights the cut-out section without any blur */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(11, 17, 32, 0.76)"
          mask="url(#app-tour-spotlight-mask)"
        />
      </svg>

      {/* Dynamic Animated Spotlight Frame (Surrounds the crystal-clear section) */}
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
          stiffness: 380,
          damping: 32,
          mass: 0.6
        }}
      >
        {/* Glowing Neon Outline */}
        <div 
          className="absolute inset-0 rounded-[inherit] border-2 transition-colors duration-300 shadow-[0_0_24px_rgba(0,122,255,0.7)]"
          style={{ borderColor: currentStep.accentColor }}
        />

        {/* Dynamic Pulsing Halo */}
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.9, 0.35, 0.9]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute -inset-1 rounded-[inherit] border transition-colors duration-300"
          style={{ borderColor: currentStep.accentColor }}
        />

        {/* 4 Precision Corner Accent Markers (Modern High-Tech HUD Style) */}
        <div 
          className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2"
          style={{ borderColor: currentStep.accentColor }}
        />
        <div 
          className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2"
          style={{ borderColor: currentStep.accentColor }}
        />
        <div 
          className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2"
          style={{ borderColor: currentStep.accentColor }}
        />
        <div 
          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2"
          style={{ borderColor: currentStep.accentColor }}
        />
      </motion.div>

      {/* Upgraded Dynamic Info Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: isCardAbove ? -18 : 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isCardAbove ? -12 : 12, scale: 0.96 }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 28,
            mass: 0.7
          }}
          className="fixed z-[105] pointer-events-auto"
          style={{
            top: cardTop,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${cardWidth}px`
          }}
        >
          {/* Directional Visual Pointer Arrow */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none transition-all ${
              isCardAbove ? '-bottom-3 text-white dark:text-[#0B1224]' : '-top-3 text-white dark:text-[#0B1224]'
            }`}
          >
            {isCardAbove ? (
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white dark:border-t-[#0F172A] filter drop-shadow-[0_4px_3px_rgba(0,0,0,0.1)]" />
            ) : (
              <div className="w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white dark:border-b-[#0F172A] filter drop-shadow-[0_-4px_3px_rgba(0,0,0,0.1)]" />
            )}
          </div>

          <div className="bg-white/98 dark:bg-[#0F172A]/98 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.3)] border border-slate-200/80 dark:border-white/10 p-3.5 sm:p-5 relative overflow-hidden ring-1 ring-black/5">
            {/* Top Accent Gradient Bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 transition-colors duration-300"
              style={{ background: `linear-gradient(90deg, ${currentStep.accentColor}, #38BDF8)` }}
            />

            {/* Header: Category Badge, Step Counter & Controls */}
            <div className="flex items-center justify-between gap-1.5 mb-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span 
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${currentStep.accentColor}18`,
                    color: currentStep.accentColor
                  }}
                >
                  {displayBengali ? currentStep.categoryBn : currentStep.categoryEn}
                </span>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-400">
                  {currentStepIndex + 1} / {TOUR_STEPS.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Language Switcher Button inside Tour */}
                <button
                  type="button"
                  onClick={handleToggleLanguage}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-[9px] sm:text-[10px] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Switch Language"
                >
                  <Languages className="w-2.5 h-2.5 text-blue-500" />
                  <span>{displayBengali ? 'EN' : 'বাংলা'}</span>
                </button>

                {/* Dismiss / Skip Button */}
                <button
                  type="button"
                  onClick={handleSkip}
                  className="p-0.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Tour"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title & Icon Row */}
            <div className="flex items-start gap-2.5 mb-2">
              <motion.div
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md [&_svg]:w-4 [&_svg]:h-4 [&_svg]:sm:w-5 [&_svg]:sm:h-5"
                style={{ backgroundColor: currentStep.accentColor }}
              >
                {currentStep.icon}
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] sm:text-[15px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {displayBengali ? currentStep.titleBn : currentStep.titleEn}
                </h3>
                <p className="text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 font-normal">
                  {displayBengali ? currentStep.descBn : currentStep.descEn}
                </p>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="flex items-center gap-1 my-2.5 sm:my-3.5">
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
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
                className={`flex items-center gap-0.5 text-[11px] sm:text-xs font-black py-1 px-2 rounded-lg transition-all cursor-pointer ${
                  currentStepIndex === 0
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{displayBengali ? 'আগেরটি' : 'Previous'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-[11px] sm:text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-1.5 py-1 transition-colors cursor-pointer"
                >
                  {displayBengali ? 'এড়িয়ে যান' : 'Skip'}
                </button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-600 to-[#007AFF] hover:from-blue-700 hover:to-blue-600 text-white font-black text-[11px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>
                    {currentStepIndex === TOUR_STEPS.length - 1
                      ? displayBengali
                        ? 'ট্যুর সম্পন্ন করুন'
                        : 'Finish Tour'
                      : displayBengali
                      ? 'পরবর্তী'
                      : 'Next'}
                  </span>
                  {currentStepIndex < TOUR_STEPS.length - 1 ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip Confirmation Dialog */}
      <AnimatePresence>
        {showSkipConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-white/10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {displayBengali ? 'ট্যুরটি কি এড়িয়ে যেতে চান?' : 'Skip the app tour?'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {displayBengali
                    ? 'ট্যুর সম্পন্ন করলে আপনি জলপাইগুড়ির সমস্ত দরকারী বৈশিষ্ট্য এবং জরুরি পরিষেবা সহজে ব্যবহার করতে পারবেন।'
                    : 'The guided tour helps you discover all key civic services, AI assistance, and emergency features.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleComplete}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {displayBengali ? 'হ্যাঁ, বন্ধ করুন' : 'Yes, Skip'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSkipConfirm(false)}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
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
