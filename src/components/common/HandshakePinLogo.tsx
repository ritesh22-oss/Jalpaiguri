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
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-base font-extrabold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-extrabold',
    xl: 'text-3xl font-extrabold'
  };

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Handshake with Pin SVG */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Location Pin Header at top */}
          <path
            d="M50 12C42.82 12 37 17.82 37 25C37 34 50 48 50 48C50 48 63 34 63 25C63 17.82 57.18 12 50 12Z"
            fill="#3B82F6"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Pin Center Dot */}
          <circle cx="50" cy="25" r="4.5" fill="white" />

          {/* Left Cuff (Teal / Blue) */}
          <path
            d="M18 52L28 42L35 49L25 59L18 52Z"
            fill="#0284C7"
            stroke="#0369A1"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Right Cuff (Orange / Salmon / Warm Tan) */}
          <path
            d="M82 52L72 42L65 49L75 59L82 52Z"
            fill="#F97316"
            stroke="#C2410C"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Left Hand clasping right hand (Peach tone) */}
          <path
            d="M32 46L46 60C48 62 52 62 54 60L59 55L48 44L38 43L32 46Z"
            fill="#FED7AA"
            stroke="#334155"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Hand fingers (Peach tone with finger lines) */}
          <path
            d="M68 46L54 60C52 62 48 62 46 60L41 55L52 44L62 43L68 46Z"
            fill="#FDBA74"
            stroke="#334155"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Clasping fingers details */}
          <path d="M44 52L52 60" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d="M49 47L57 55" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d="M53 62L60 69L66 63L59 56" fill="#FDBA74" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />
          <path d="M47 62L40 69L34 63L41 56" fill="#FED7AA" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight text-left">
          <span className={`${textSizes[size]} text-[#2563EB] tracking-tight font-black`}>
            Jalpaiguri
          </span>
          <span className={`${textSizes[size]} text-[#2563EB] tracking-tight font-black -mt-1`}>
            Connect
          </span>
        </div>
      )}
    </div>
  );
};
