import React from 'react';

interface HandshakePinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const HandshakePinLogo: React.FC<HandshakePinLogoProps> = ({
  className = '',
  size = 'lg',
  showText = true
}) => {
  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-base font-extrabold',
    md: 'text-xl font-extrabold',
    lg: 'text-[22px] font-black',
    xl: 'text-3xl font-black'
  };

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Handshake with Pin SVG exactly matching reference design */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Blue Location Pin centered at top */}
          <path
            d="M50 8C43.37 8 38 13.37 38 20C38 28.5 50 41 50 41C50 41 62 28.5 62 20C62 13.37 56.63 8 50 8Z"
            fill="#2F74E9"
            stroke="#1D4ED8"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* White center dot inside pin */}
          <circle cx="50" cy="20" r="4" fill="white" />

          {/* Left Sleeve / Cuff (Blue) */}
          <path
            d="M16 52L26 42L33 49L23 59L16 52Z"
            fill="#2F74E9"
            stroke="#1E293B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Right Sleeve / Cuff (Orange / Coral) */}
          <path
            d="M84 52L74 42L67 49L77 59L84 52Z"
            fill="#F97316"
            stroke="#1E293B"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Left Hand (Warm peach skin tone) */}
          <path
            d="M30 46L44 60C46 62 50 62 52 60L57 55L46 44L36 43L30 46Z"
            fill="#FED7AA"
            stroke="#1E293B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Hand clasping (Warm peach tone) */}
          <path
            d="M70 46L56 60C54 62 50 62 48 60L43 55L54 44L64 43L70 46Z"
            fill="#FDBA74"
            stroke="#1E293B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Finger lines & details */}
          <path d="M42 52L50 60" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M47 47L55 55" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M51 62L58 69L64 63L57 56" fill="#FDBA74" stroke="#1E293B" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M49 62L42 69L36 63L43 56" fill="#FED7AA" stroke="#1E293B" strokeWidth="2.8" strokeLinejoin="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-[1.1] text-left">
          <span className={`${textSizes[size]} text-[#2F74E9] tracking-tight font-extrabold`}>
            Jalpaiguri
          </span>
          <span className={`${textSizes[size]} text-[#2F74E9] tracking-tight font-extrabold`}>
            Connect
          </span>
        </div>
      )}
    </div>
  );
};

