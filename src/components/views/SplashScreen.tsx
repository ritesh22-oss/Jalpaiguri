import React, { useEffect } from 'react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { motion } from 'motion/react';

export const SplashScreen: React.FC = () => {
  const { replaceView } = useNav();
  const { isAuthenticated, isProfileComplete } = useAuth();
  const { serviceAreaStatus } = useLocation();

  useEffect(() => {
    sessionStorage.setItem('jpg_splash_shown', 'true');
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#e6f4fc] flex flex-col justify-center items-center select-none overflow-hidden"
    >
      <motion.img
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        src="/screen.png"
        alt="Splash Screen"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/logo.png';
          (e.target as HTMLImageElement).className = 'w-32 h-32 object-contain m-auto';
        }}
      />
      
      {/* Animated dots overlay matching the image's static dots position */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute bottom-[28%] flex items-center justify-center gap-2 z-10"
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#1e61b5]"
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#3587db]"
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#62b0f2]"
        />
      </motion.div>
    </div>
  );
};
