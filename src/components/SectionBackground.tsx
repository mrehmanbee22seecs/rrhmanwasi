import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SectionBackgroundProps {
  imageSrc: string;
  children: React.ReactNode;
  className?: string;
  overlayOpacity?: number;
}

const SectionBackground: React.FC<SectionBackgroundProps> = ({
  imageSrc,
  children,
  className = '',
  overlayOpacity = 0.85
}) => {
  const { currentTheme } = useTheme();
  const isWasilahSpecial = currentTheme.id === 'wasillah-special';

  if (!isWasilahSpecial) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${imageSrc})`,
          opacity: 0.15
        }}
      />
      
      {/* Subtle gradient overlay for blending */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(255, 251, 240, ${overlayOpacity}), rgba(255, 249, 230, ${overlayOpacity - 0.1}))`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default SectionBackground;
