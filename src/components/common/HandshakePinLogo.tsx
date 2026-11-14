import React from 'react';
import { AppLogo, BrandLogoSize } from './BrandLogo';

interface HandshakePinLogoProps {
  className?: string;
  size?: BrandLogoSize;
  showText?: boolean;
}

export const HandshakePinLogo: React.FC<HandshakePinLogoProps> = ({
  className = '',
  size = 'lg',
  showText = true,
}) => {
  return <AppLogo variant={showText ? 'inline' : 'icon-only'} size={size} showText={showText} className={className} />;
};
