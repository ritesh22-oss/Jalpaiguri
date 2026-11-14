import React from 'react';
import { AppLogo, BrandLogoSize } from './BrandLogo';

interface SplashLeafLogoProps {
  className?: string;
  size?: BrandLogoSize;
}

export const SplashLeafLogo: React.FC<SplashLeafLogoProps> = ({
  className = '',
  size = 'lg',
}) => {
  return <AppLogo variant="icon-only" size={size} showText={false} className={className} />;
};
