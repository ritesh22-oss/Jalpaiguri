import React, { useEffect, useState } from 'react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { motion, AnimatePresence } from 'motion/react';
import { Bus, Store, MapPin, HeartPulse, Sparkles } from 'lucide-react';
import { isAuthorizedAdminEmail } from '../../types';

const SERVICE_ITEMS = [
  { icon: Bus, label: 'Finding neighbourhood transit & buses...' },
  { icon: Store, label: 'Finding neighbourhood shops...' },
  { icon: MapPin, label: 'Connecting Jalpaiguri localities...' },
  { icon: HeartPulse, label: 'Discovering emergency & health services...' },
  { icon: Sparkles, label: 'Making Jalpaiguri smarter...' }
];

export const SplashScreen: React.FC = () => {
  const { replaceView } = useNav();
  const { isAuthenticated, isProfileComplete, user, firebaseUser } = useAuth();
  const { serviceAreaStatus } = useLocation();
  const [serviceIndex, setServiceIndex] = useState(0);

  useEffect(() => {
    sessionStorage.setItem('jpg_splash_shown', 'true');

    // Cycle through messages smoothly every 750ms
    const interval = setInterval(() => {
      setServiceIndex((prev) => (prev + 1) % SERVICE_ITEMS.length);
    }, 750);

    // Target splash display time: ~2.4 seconds to let the rich blue splash breath
    const timer = window.setTimeout(() => {
      if (isAuthenticated) {
        const isOfficialAdmin = user?.role === 'admin' || isAuthorizedAdminEmail(user?.email || firebaseUser?.email);
        if (isOfficialAdmin) {
          replaceView('admin-dashboard');
        } else if (!isProfileComplete) {
          replaceView('profile-setup');
        } else if (serviceAreaStatus === 'outside') {
          replaceView('outside-area');
        } else {
          replaceView('home');
        }
      } else {
        replaceView('onboarding');
      }
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isAuthenticated, isProfileComplete, serviceAreaStatus, replaceView, user, firebaseUser]);

  const CurrentIcon = SERVICE_ITEMS[serviceIndex].icon;

  return (
    <div
      style={{
        background: 'radial-gradient(circle at 50% 36%, rgba(40, 126, 240, 0.28) 0%, rgba(169, 208, 255, 0) 65%), linear-gradient(180deg, #A9D0FF 0%, #D0E5FF 50%, #EDF5FF 100%)'
      }}
      className="fixed inset-0 z-50 flex flex-col justify-between items-center select-none overflow-hidden px-6 py-12"
    >
      {/* Top Spacer for perfect vertical centering */}
      <div className="w-full h-4" />

      {/* Center Branding & Loading Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-sm">
        
        {/* Official MYJPG Logo inside a clean, elegant rounded white card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.90, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-[#0756D9]/15 border border-white/80 w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center mb-6"
        >
          {/* Subtle Ambient Radial Highlight inside card */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-blue-50/40 to-transparent pointer-events-none" />
          
          <img
            src="./logo.png"
            alt="MYJPG Logo"
            className="w-full h-full object-contain relative z-10"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
        </motion.div>

        {/* Animated Service Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-14 h-14 rounded-full bg-white/90 border border-[#A9D0FF] shadow-md shadow-[#0756D9]/10 flex items-center justify-center mb-4 text-[#0756D9]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={serviceIndex}
              initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 15 }}
              transition={{ duration: 0.25 }}
            >
              <CurrentIcon className="w-6 h-6 stroke-[2.2]" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Rotating Message Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F2F7FF]/95 border border-[#A9D0FF] shadow-sm mb-5 max-w-[92%]"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0756D9] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0756D9]" />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={serviceIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[#0756D9] font-medium text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {SERVICE_ITEMS[serviceIndex].label}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Three Animated Smooth Pulse Dots */}
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
            className="w-2.5 h-2.5 rounded-full bg-[#0756D9]"
          />
          <motion.div
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            className="w-2.5 h-2.5 rounded-full bg-[#287EF0]"
          />
          <motion.div
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="w-2.5 h-2.5 rounded-full bg-[#A9D0FF]"
          />
        </div>

      </div>

      {/* Bottom Branding Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col items-center justify-center gap-1"
      >
        <div className="text-xl sm:text-2xl font-black tracking-tight text-[#102B55]">
          MY<span className="text-[#287EF0]">JPG</span>
        </div>
        <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#0756D9] uppercase">
          • JALPAIGURI CONNECTED •
        </div>
      </motion.div>
    </div>
  );
};
