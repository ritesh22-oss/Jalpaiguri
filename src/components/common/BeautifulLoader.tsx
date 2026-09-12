import React from 'react';
import { motion } from 'motion/react';

interface BeautifulLoaderProps {
  size?: number;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const BeautifulLoader: React.FC<BeautifulLoaderProps> = ({
  size = 80,
  className = '',
  primaryColor = '#2563EB', // blue-600
  secondaryColor = '#60A5FA' // blue-400
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Outer Rotating Ring */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeDasharray="1 15"
          strokeLinecap="round"
          className="opacity-20"
        />
      </motion.svg>

      {/* Main Spinner Ring */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        <motion.circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="url(#spinner-gradient)"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ strokeDasharray: "20 200", strokeDashoffset: 0 }}
          animate={{ 
            strokeDasharray: ["20 200", "150 200", "20 200"],
            strokeDashoffset: [0, -50, -200]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.svg>

      {/* Inner Complementary Ring */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full opacity-40"
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2"
          strokeDasharray="40 100"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Center Dynamic Core */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [0.8, 1.1, 0.8],
            boxShadow: [
              `0 0 0px ${primaryColor}`,
              `0 0 15px ${primaryColor}`,
              `0 0 0px ${primaryColor}`
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-4 h-4 rounded-full z-10"
          style={{ backgroundColor: primaryColor }}
        />
        <motion.div
          animate={{ 
            scale: [1, 2.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className="absolute w-4 h-4 rounded-full border border-blue-400"
        />
      </div>
    </div>
  );
};
