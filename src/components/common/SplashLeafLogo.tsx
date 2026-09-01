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
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Top-Left Node & Connector */}
        <circle cx="28" cy="46" r="6" stroke="#9DF3C4" strokeWidth="5.5" fill="none" />
        <path d="M34 46H58" stroke="#9DF3C4" strokeWidth="5.5" strokeLinecap="round" />

        {/* Bottom-Left Node & Connector */}
        <circle cx="28" cy="72" r="6" stroke="#9DF3C4" strokeWidth="5.5" fill="none" />
        <path d="M34 72H58" stroke="#9DF3C4" strokeWidth="5.5" strokeLinecap="round" />

        {/* Main Central Vertical Line */}
        <path d="M58 26V88" stroke="#9DF3C4" strokeWidth="5.5" strokeLinecap="round" />

        {/* Bottom Center Node */}
        <circle cx="58" cy="94" r="6" stroke="#9DF3C4" strokeWidth="5.5" fill="none" />

        {/* Bottom-Right Node & Connector */}
        <path d="M58 72H82" stroke="#9DF3C4" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="88" cy="72" r="6" stroke="#9DF3C4" strokeWidth="5.5" fill="none" />

        {/* Top-Right Leaf Contour */}
        <path
          d="M58 26C58 26 88 20 92 50C93 64 78 72 58 72"
          stroke="#9DF3C4"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Leaf Vein with Node */}
        <path
          d="M58 48C68 45 78 48 82 54"
          stroke="#9DF3C4"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="84" cy="55" r="3.5" fill="#9DF3C4" />
      </svg>
    </div>
  );
};

