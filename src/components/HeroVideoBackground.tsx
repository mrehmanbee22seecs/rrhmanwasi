import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface HeroVideoBackgroundProps {
  videoSrc: string;
  fallbackImage?: string;
  children?: React.ReactNode;
  className?: string;
}

const HeroVideoBackground: React.FC<HeroVideoBackgroundProps> = ({
  videoSrc,
  fallbackImage,
  children,
  className = ''
}) => {
  const { currentTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isWasilahSpecial = currentTheme.id === 'wasillah-special';

  useEffect(() => {
    // Ensure video plays on mount
    if (videoRef.current && isWasilahSpecial) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, [isWasilahSpecial]);

  if (!isWasilahSpecial) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={fallbackImage}
          style={{ opacity: 0.85 }}
        >
          <source src={videoSrc} type="video/mp4" />
          {fallbackImage && (
            <img
              src={fallbackImage}
              alt="Community service"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </video>
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default HeroVideoBackground;
