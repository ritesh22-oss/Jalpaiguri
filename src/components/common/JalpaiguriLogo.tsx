import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  showSubtitle?: boolean;
  textColor?: string;
  variant?: 'inline' | 'badge' | 'icon-only';
  outline?: boolean;
}

export const JalpaiguriLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = true,
  textColor,
  variant = 'inline',
  outline = false
}) => {
  const iconSizes = {
    xs: 'w-6 h-7',
    sm: 'w-8 h-9',
    md: 'w-11 h-12',
    lg: 'w-16 h-18',
    xl: 'w-24 h-28',
    '2xl': 'w-32 h-36'
  };

  const textSizes = {
    xs: 'text-xs font-black tracking-tight',
    sm: 'text-sm font-black tracking-tight',
    md: 'text-lg font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-3xl font-black tracking-tight',
    '2xl': 'text-4xl font-black tracking-tight'
  };

  const subtitleSizes = {
    xs: 'text-[7px] tracking-[0.18em]',
    sm: 'text-[8.5px] tracking-[0.2em]',
    md: 'text-[9.5px] tracking-[0.22em]',
    lg: 'text-[11px] tracking-[0.24em]',
    xl: 'text-[13px] tracking-[0.25em]',
    '2xl': 'text-[15px] tracking-[0.26em]'
  };

  // The Exact Map Pin Emblem SVG matching user-uploaded logo
  const Emblem = (
    <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          <linearGradient id="jpgPinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="65%" stopColor="#1E5AF3" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id="jpgPinGlow" x="-20%" y="-15%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#1D4ED8" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* The Vibrant Blue Teardrop Pin */}
        <path
          d="M 37.8 61.5 A 28 28 0 1 1 82.2 61.5 L 60 92.5 Z"
          fill="url(#jpgPinGradient)"
          filter="url(#jpgPinGlow)"
          stroke={outline ? "#FFFFFF" : "#2563EB"}
          strokeWidth={outline ? 2.5 : 1.2}
          strokeLinejoin="round"
        />

        {/* White circular cutout inside upper area of pin */}
        <circle cx="60" cy="42" r="16.5" fill="#FFFFFF" />

        {/* 3 Connected Community Network Nodes */}
        {/* Connection lines */}
        <line x1="60" y1="34" x2="52.8" y2="44.8" stroke="#1D4ED8" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="60" y1="34" x2="67.2" y2="44.8" stroke="#1D4ED8" strokeWidth="2.8" strokeLinecap="round" />
        {/* Circular dots */}
        <circle cx="60" cy="34" r="3.4" fill="#1D4ED8" />
        <circle cx="52.8" cy="44.8" r="3.4" fill="#1D4ED8" />
        <circle cx="67.2" cy="44.8" r="3.4" fill="#1D4ED8" />

        {/* White Sans-Serif 'J' inside the lower tapered section */}
        <path
          d="M 60 64.5 V 77.5 C 60 81.2 57 83.5 54 83.5 C 51 83.5 49 81.2 49 78"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );

  // Full Badge Variant (Squircle card matching the full uploaded graphic)
  if (variant === 'badge') {
    return (
      <div className={`flex flex-col items-center justify-center p-5 bg-white dark:bg-[#0B1329] border border-blue-100/80 dark:border-white/10 rounded-3xl shadow-lg select-none text-center ${className}`}>
        {Emblem}
        <div className="mt-2 flex flex-col items-center">
          <div className="flex items-center tracking-tight leading-none">
            <span className={`${textSizes[size]} text-[#0F172A] dark:text-white font-black`}>MY</span>
            <span className={`${textSizes[size]} text-[#2563EB] dark:text-[#38BDF8] font-black`}>JPG</span>
          </div>
          {showSubtitle && (
            <span className={`mt-1 font-extrabold text-[#1D4ED8] dark:text-[#60A5FA] uppercase ${subtitleSizes[size]}`}>
              Jalpaiguri Connected
            </span>
          )}
        </div>
      </div>
    );
  }

  // Icon only
  if (!showText || variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {Emblem}
      </div>
    );
  }

  // Standard Inline Variant (Emblem + Text)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {Emblem}

      <div className="flex flex-col leading-tight">
        <div className="flex items-center tracking-tight">
          <span className={`${textSizes[size]} ${textColor || 'text-[#0F172A] dark:text-white'}`}>
            MY
          </span>
          <span className={`${textSizes[size]} text-[#2563EB] dark:text-[#38BDF8]`}>
            JPG
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-extrabold text-[#1D4ED8] dark:text-[#60A5FA] uppercase mt-0.5 ${subtitleSizes[size]}`}>
            Jalpaiguri Connected
          </span>
        )}
      </div>
    </div>
  );
};
