import React, { useEffect } from 'react';
import { JalpaiguriLogo } from '../common/JalpaiguriLogo';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'motion/react';

export const SplashScreen: React.FC = () => {
  const { replaceView } = useNav();
  const { isBengali } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      replaceView('onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, [replaceView]);

  const handleScreenTap = () => {
    replaceView('onboarding');
  };

  return (
    <div
      onClick={handleScreenTap}
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#38BDF8] text-white flex flex-col justify-between items-center py-12 px-6 select-none cursor-pointer max-w-md mx-auto overflow-hidden shadow-2xl"
    >
      {/* Top spacing */}
      <div className="w-full"></div>

      {/* Animated Center Branding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center text-center my-auto relative z-10"
      >
        {/* Floating Map Pin Emblem without white background card */}
        <motion.div
          animate={{ scale: [1, 1.04, 1], y: [0, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-5 select-none drop-shadow-2xl flex items-center justify-center"
        >
          <JalpaiguriLogo size="2xl" showText={false} outline={true} />
        </motion.div>

        {/* Unified Typography: Single line 'MY' in black and 'JPG' in white */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="flex items-center justify-center tracking-tight leading-none text-4xl sm:text-5xl font-black font-sans"
        >
          <span className="text-black font-black select-none drop-shadow-[0_1px_3px_rgba(255,255,255,0.35)]">
            MY
          </span>
          <span className="text-white font-black select-none drop-shadow-md ml-0.5">
            JPG
          </span>
        </motion.div>

        {/* Single Subtitle Line underneath: Your Jalpaiguri Connected */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-2.5 text-xs sm:text-sm font-extrabold text-white tracking-[0.24em] uppercase font-sans select-none drop-shadow-sm max-w-[300px]"
        >
          {isBengali ? 'আপনার জলপাইগুড়ি, সংযুক্ত' : 'Your Jalpaiguri Connected'}
        </motion.p>
      </motion.div>

      {/* Bottom Dot Dot Dot Loading Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="w-full flex flex-col items-center gap-4 pb-4"
      >
        {/* Pulsing Dot Dot Dot */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};






