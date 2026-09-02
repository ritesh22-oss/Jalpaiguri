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
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Main Central Vertical Trunk */}
        <path
          d="M50 22V82"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Top-Left Branch & Node */}
        <path
          d="M50 44H30"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="24" cy="44" r="5" stroke="white" strokeWidth="3.5" fill="none" />

        {/* Bottom-Left Branch & Node */}
        <path
          d="M50 64H30"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="24" cy="64" r="5" stroke="white" strokeWidth="3.5" fill="none" />

        {/* Bottom Trunk Node */}
        <circle cx="50" cy="87" r="4.5" stroke="white" strokeWidth="3.5" fill="none" />

        {/* Right Lower Branch & Node */}
        <path
          d="M50 64H72"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="78" cy="64" r="5" stroke="white" strokeWidth="3.5" fill="none" />

        {/* Right Leaf Outline (Organic leaf contour emerging from stem top to right node) */}
        <path
          d="M50 22C50 22 78 18 82 44C84 56 72 64 50 64"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Leaf Diagonal Vein with Connected Node */}
        <path
          d="M50 42C58 40 68 44 72 49"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="74" cy="50" r="3" fill="white" />
      </svg>
    </div>
  );
};


