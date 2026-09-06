import React from 'react';

interface SplashLeafLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SplashLeafLogo: React.FC<SplashLeafLogoProps> = ({
  className = '',
  size = 'lg'
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-28 h-28'
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md select-none"
      >
        <defs>
          <linearGradient id="splashPinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="65%" stopColor="#1E5AF3" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id="splashPinGlow" x="-20%" y="-15%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1D4ED8" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* The Blue Teardrop Pin */}
        <path
          d="M 37.8 61.5 A 28 28 0 1 1 82.2 61.5 L 60 92.5 Z"
          fill="url(#splashPinGrad)"
          filter="url(#splashPinGlow)"
          stroke="#2563EB"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* White circular cutout inside upper area of pin */}
        <circle cx="60" cy="42" r="16.5" fill="#FFFFFF" />

        {/* 3 Connected Community Network Nodes */}
        <line x1="60" y1="34" x2="52.8" y2="44.8" stroke="#1D4ED8" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="60" y1="34" x2="67.2" y2="44.8" stroke="#1D4ED8" strokeWidth="2.8" strokeLinecap="round" />
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
};
