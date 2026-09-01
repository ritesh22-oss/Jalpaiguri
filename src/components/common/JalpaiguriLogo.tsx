import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const JalpaiguriLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-[#063B2C]'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm font-bold',
    md: 'text-xl font-extrabold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Exact SVG recreation of the custom Jalpaiguri Connect pin mark */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer teardrop pin line */}
          <path
            d="M50 8C30.1 8 14 24.1 14 44C14 67.5 45.2 108.2 46.8 110.3C48.4 112.5 51.6 112.5 53.2 110.3C54.8 108.2 86 67.5 86 44C86 24.1 69.9 8 50 8Z"
            stroke="#063B2C"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Stylized J and community inner loop */}
          <path
            d="M32 55C32 50 36 46 41 46H50C58.3 46 65 52.7 65 61C65 69.3 58.3 76 50 76C42.8 76 37 70.2 37 63V26"
            stroke="#063B2C"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tri-nodes representing 3 community people */}
          <circle cx="50" cy="33" r="4" fill="#063B2C" />
          <circle cx="43" cy="41" r="3.2" fill="#063B2C" />
          <circle cx="57" cy="41" r="3.2" fill="#063B2C" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${textSizes[size]} ${textColor} font-sans`}>
            Jalpaiguri
          </span>
          <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-semibold text-[#185341] tracking-wide`}>
            Connect
          </span>
        </div>
      )}
    </div>
  );
};
