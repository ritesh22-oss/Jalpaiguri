import React from 'react';
import bundledBrandLogo from '../../assets/logo.png';

export const BRAND_LOGO_SRC = bundledBrandLogo;

export type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BrandLogoVariant = 'inline' | 'badge' | 'icon-only';

export interface AppLogoProps {
  className?: string;
  size?: BrandLogoSize;
  showText?: boolean;
  showSubtitle?: boolean;
  textColor?: string;
  subtitleText?: string;
  variant?: BrandLogoVariant;
  outline?: boolean;
}

const IMAGE_SIZES: Record<BrandLogoSize, string> = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-36 h-36 sm:w-40 sm:h-40',
};

const TEXT_SIZES: Record<BrandLogoSize, string> = {
  xs: 'text-xs font-black tracking-tight',
  sm: 'text-base font-black tracking-tight',
  md: 'text-lg font-black tracking-tight',
  lg: 'text-2xl font-black tracking-tight',
  xl: 'text-3xl font-black tracking-tight',
  '2xl': 'text-4xl font-black tracking-tight',
};

const SUBTITLE_SIZES: Record<BrandLogoSize, string> = {
  xs: 'text-[7px] tracking-[0.18em]',
  sm: 'text-[8.5px] tracking-[0.2em]',
  md: 'text-[9.5px] tracking-[0.22em]',
  lg: 'text-[11px] tracking-[0.24em]',
  xl: 'text-[13px] tracking-[0.25em]',
  '2xl': 'text-[15px] tracking-[0.26em]',
};

/**
 * Core transparent MYJPG logo emblem.
 * Uses the exact user-approved RGBA transparent PNG with alpha=0 exterior
 * and zero white box, border, or CSS backdrop wrapper.
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = true,
  textColor,
  subtitleText = 'Jalpaiguri Connected',
  variant = 'inline',
}) => {
  const Emblem = (
    <img
      src={BRAND_LOGO_SRC}
      alt="MYJPG — Jalpaiguri Connected"
      draggable={false}
      className={`shrink-0 object-contain bg-transparent select-none drop-shadow-[0_3px_8px_rgba(37,99,235,0.22)] dark:drop-shadow-[0_3px_12px_rgba(56,189,248,0.28)] ${IMAGE_SIZES[size]}`}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.dataset.fallbackApplied) {
          img.dataset.fallbackApplied = 'true';
          img.src = '/logo.png';
        }
      }}
    />
  );

  if (variant === 'badge') {
    return (
      <div className={`inline-flex flex-col items-center justify-center select-none text-center bg-transparent ${className}`}>
        {Emblem}
        {showText && (
          <div className="mt-2.5 flex flex-col items-center">
            <div className="flex items-center tracking-tight leading-none">
              <span className={`${TEXT_SIZES[size]} ${textColor || 'text-[#0F172A] dark:text-white'} font-black`}>
                MY
              </span>
              <span className={`${TEXT_SIZES[size]} text-[#2563EB] dark:text-[#38BDF8] font-black`}>
                JPG
              </span>
            </div>
            {showSubtitle && (
              <span className={`mt-1 font-extrabold text-[#1D4ED8] dark:text-[#60A5FA] uppercase ${SUBTITLE_SIZES[size]}`}>
                {subtitleText}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!showText || variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center bg-transparent ${className}`}>
        {Emblem}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 bg-transparent ${className}`}>
      {Emblem}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center tracking-tight">
          <span className={`${TEXT_SIZES[size]} ${textColor || 'text-[#0F172A] dark:text-white'}`}>
            MY
          </span>
          <span className={`${TEXT_SIZES[size]} text-[#2563EB] dark:text-[#38BDF8]`}>
            JPG
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-extrabold text-[#1D4ED8] dark:text-[#60A5FA] uppercase mt-0.5 ${SUBTITLE_SIZES[size]}`}>
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};

export const BrandHeader: React.FC<Omit<AppLogoProps, 'variant'>> = (props) => (
  <AppLogo variant="inline" {...props} />
);

export const SplashLogo: React.FC<{ className?: string; size?: BrandLogoSize }> = ({
  className = '',
  size = '2xl',
}) => (
  <div className={`relative flex items-center justify-center bg-transparent select-none ${className}`}>
    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl scale-90 pointer-events-none" />
    <AppLogo
      variant="icon-only"
      size={size}
      showText={false}
      className="relative z-10 drop-shadow-[0_14px_28px_rgba(7,86,217,0.28)]"
    />
  </div>
);

export const AdminBrandLogo: React.FC<{
  collapsed?: boolean;
  darkSurface?: boolean;
  className?: string;
}> = ({ collapsed = false, darkSurface = false, className = '' }) => (
  <div className={`inline-flex items-center gap-2.5 min-w-0 bg-transparent select-none ${className}`}>
    <AppLogo variant="icon-only" size="sm" showText={false} />
    {!collapsed && (
      <div className="flex flex-col leading-tight min-w-0">
        <div className="flex items-center gap-1 tracking-tight">
          <span className={`text-sm font-black ${darkSurface ? 'text-white' : 'text-[#11241C] dark:text-white'}`}>
            MY<span className="text-[#2563EB] dark:text-[#38BDF8]">JPG</span>
          </span>
          <span className={`text-xs font-extrabold ${darkSurface ? 'text-blue-200' : 'text-[#55685F] dark:text-slate-300'}`}>
            Admin
          </span>
        </div>
        <span className={`text-[8.5px] font-bold uppercase tracking-[0.18em] truncate ${darkSurface ? 'text-blue-300' : 'text-[#1D4ED8] dark:text-[#60A5FA]'}`}>
          Jalpaiguri Connected
        </span>
      </div>
    )}
  </div>
);
