import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);
  const hasCompleted = useRef(false);

  // Preload image before starting animations
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true); // Proceed anyway on error
    img.src = '/assets/access_sme_logo.png';
    
    // Fallback: if image takes too long, proceed anyway
    const loadTimeout = setTimeout(() => {
      setImageLoaded(true);
    }, 1500);
    
    return () => clearTimeout(loadTimeout);
  }, []);

  // Animation timers - only start when image is loaded
  useEffect(() => {
    if (!imageLoaded) return;

    // Show logo animation for 2.5 seconds after image loads
    const exitTimer = setTimeout(() => {
      setShouldExit(true);
    }, 2500);

    // Complete and callback after fade out (500ms after exit starts)
    const completeTimer = setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [imageLoaded, onComplete]);

  // Failsafe - always complete after max time no matter what
  useEffect(() => {
    const failsafe = setTimeout(() => {
      if (!hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    }, 5000); // Max 5 seconds total
    
    return () => clearTimeout(failsafe);
  }, [onComplete]);

  // Handle animation complete event
  const handleAnimationComplete = () => {
    if (shouldExit && !hasCompleted.current) {
      hasCompleted.current = true;
      onComplete();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white flex items-center justify-center z-50"
      style={{ willChange: 'opacity' }}
    >
      {/* Static fallback - shown while image loads or if animation fails */}
      {!imageLoaded && (
        <img
          src="/assets/access_sme_logo.png"
          alt="Access SME"
          className="w-[180px] h-auto"
        />
      )}

      {/* Animated version - shown once image is preloaded */}
      {imageLoaded && (
        <motion.img
          src="/assets/access_sme_logo.png"
          alt="Access SME"
          className="w-[180px] h-auto"
          style={{ willChange: 'transform, opacity' }}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{
            opacity: shouldExit ? 0 : 1,
            scale: shouldExit ? 0.9 : 1,
            y: shouldExit ? -10 : 0
          }}
          transition={{
            opacity: { duration: 0.5, ease: 'easeOut' },
            scale: {
              duration: 0.8,
              ease: [0.34, 1.56, 0.64, 1] // Bounce ease
            },
            y: {
              duration: 0.8,
              ease: [0.34, 1.56, 0.64, 1] // Bounce ease
            }
          }}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}
