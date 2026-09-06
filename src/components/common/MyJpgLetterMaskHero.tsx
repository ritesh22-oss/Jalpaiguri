import React from 'react';
import communityHeroFull from '../../assets/community-hero-full.jpg';

interface MyJpgLetterMaskHeroProps {
  className?: string;
}

export const MyJpgLetterMaskHero: React.FC<MyJpgLetterMaskHeroProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Ambient soft glow backdrop */}
      <div className="absolute inset-0 max-w-[480px] mx-auto bg-gradient-to-r from-blue-400/20 via-blue-600/25 to-sky-400/20 dark:from-blue-500/30 dark:via-indigo-500/35 dark:to-cyan-400/25 rounded-full blur-2xl pointer-events-none transform scale-95" />

      {/* Main SVG Typography with Photo Clipped Inside the Letters 'MY JPG' */}
      <div className="relative w-full max-w-[490px] mx-auto transform transition-transform duration-300 hover:scale-[1.03] active:scale-[0.99] cursor-pointer">
        <svg
          viewBox="0 0 680 230"
          className="w-full h-auto drop-shadow-[0_16px_36px_rgba(0,122,255,0.24)] dark:drop-shadow-[0_16px_40px_rgba(56,189,248,0.32)]"
          style={{ overflow: 'visible' }}
          role="img"
          aria-label="MY JPG Community Art"
        >
          <defs>
            {/* The Text Mask for 'MY JPG' with spacing between letters and between words */}
            <clipPath id="myJpgLetterMask">
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
                fontWeight="900"
                fontSize="160"
                letterSpacing="8"
              >
                <tspan>MY</tspan>
                <tspan dx="36">JPG</tspan>
              </text>
            </clipPath>

            {/* Soft Shadow Filter for inner clarity */}
            <filter id="textGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0052cc" floodOpacity="0.38" />
            </filter>
          </defs>

          {/* Under-glow for depth */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="160"
            letterSpacing="8"
            fill="#007AFF"
            opacity="0.15"
            filter="url(#textGlow)"
          >
            <tspan>MY</tspan>
            <tspan dx="36">JPG</tspan>
          </text>

          {/* The Jalpaiguri Community Scene Photo Clipped Strictly Inside the Letters */}
          <image
            href={communityHeroFull}
            xlinkHref={communityHeroFull}
            x="-30"
            y="-40"
            width="740"
            height="310"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#myJpgLetterMask)"
          />

          {/* High-definition crisp stroke outline so each letter is instantly recognizable */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="160"
            letterSpacing="8"
            fill="none"
            stroke="#001F3F"
            strokeWidth="4"
            strokeOpacity="0.85"
            className="dark:stroke-blue-400 dark:stroke-opacity-70 transition-colors duration-300"
          >
            <tspan>MY</tspan>
            <tspan dx="36">JPG</tspan>
          </text>

          {/* Subtle top specular highlight on the letter curves */}
          <text
            x="50%"
            y="49.5%"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Montserrat', system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="160"
            letterSpacing="8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeOpacity="0.55"
          >
            <tspan>MY</tspan>
            <tspan dx="36">JPG</tspan>
          </text>
        </svg>
      </div>

      {/* Decorative clean sub-pill establishing the app's civic identity */}
      <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/50 text-[10.5px] font-bold tracking-wider uppercase text-[#007AFF] dark:text-blue-300 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] dark:bg-blue-400 animate-pulse" />
        <span>JALPAIGURI CITY PORTAL</span>
      </div>
    </div>
  );
};
