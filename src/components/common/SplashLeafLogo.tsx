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
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_16px_rgba(255,255,255,0.35)]"
      >
        {/* Central stem & connected node lines */}
        {/* Left top node branch */}
        <circle cx="28" cy="45" r="5" fill="#A8F0C6" />
        <path d="M28 45H50" stroke="#A8F0C6" strokeWidth="5.5" strokeLinecap="round" />

        {/* Left bottom node branch */}
        <circle cx="28" cy="65" r="5" fill="#A8F0C6" />
        <path d="M28 65H50" stroke="#A8F0C6" strokeWidth="5.5" strokeLinecap="round" />

        {/* Main central vertical stem */}
        <path d="M50 24V76" stroke="#A8F0C6" strokeWidth="5.5" strokeLinecap="round" />

        {/* Bottom center node */}
        <circle cx="50" cy="76" r="5" fill="#A8F0C6" />

        {/* Right bottom node branch */}
        <circle cx="72" cy="65" r="5" fill="#A8F0C6" />
        <path d="M50 65H72" stroke="#A8F0C6" strokeWidth="5.5" strokeLinecap="round" />

        {/* Leaf outline extending upward to top right */}
        <path
          d="M50 24C50 24 74 20 76 45C77 56 64 62 50 62"
          stroke="#A8F0C6"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner leaf vein */}
        <path
          d="M50 42C57 40 65 42 68 47"
          stroke="#A8F0C6"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
