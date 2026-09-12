import React from 'react';
import { motion } from 'motion/react';

interface AnimatedProcessingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

export const AnimatedProcessing: React.FC<AnimatedProcessingProps> = ({ 
  size = 'md', 
  color = '#2563EB' 
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-[6px]'
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow / Pulse */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`${sizeMap[size].split(' ')[0]} ${sizeMap[size].split(' ')[1]} rounded-full absolute`}
        style={{ backgroundColor: color }}
      />

      {/* Main Spinning Circle */}
      <div className={`relative ${sizeMap[size]} rounded-full border-gray-200/30 dark:border-white/5`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute inset-0 rounded-full border-t-transparent border-l-transparent border-r-transparent`}
          style={{ borderColor: color, borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }}
        />
        
        {/* Secondary Faster Spin */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute inset-0 rounded-full border-t-transparent border-b-transparent border-r-transparent opacity-60`}
          style={{ borderLeftColor: color }}
        />
      </div>

      {/* Center Dot */}
      <motion.div
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-2 h-2 rounded-full absolute"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};
