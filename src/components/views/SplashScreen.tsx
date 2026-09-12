import React, { useEffect } from 'react';
import { useNav } from '../../context/NavigationContext';
import { motion } from 'motion/react';

export const SplashScreen: React.FC = () => {
  const { replaceView } = useNav();

  useEffect(() => {
    // Mark splash as shown in this session to avoid loops on reloads/redirects
    sessionStorage.setItem('jpg_splash_shown', 'true');
  }, []);

  const handleScreenTap = () => {
    replaceView('onboarding');
  };

  return (
    <div
      onClick={handleScreenTap}
      className="fixed inset-0 z-50 bg-[#e6f4fc] flex flex-col justify-center items-center select-none cursor-pointer max-w-md mx-auto overflow-hidden shadow-2xl relative"
    >
      <motion.img
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        src="/screen.png"
        alt="Splash Screen"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback if the user hasn't uploaded the image yet
          (e.target as HTMLImageElement).src = '/logo.png';
          (e.target as HTMLImageElement).className = 'w-32 h-32 object-contain m-auto';
        }}
      />
      
      {/* Animated dots overlay matching the image's static dots position */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-[28%] flex items-center justify-center gap-2 z-10"
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#1e61b5]"
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#3587db]"
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#62b0f2]"
        />
      </motion.div>
    </div>
  );
};






