"use client";

import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

// Direct import with lazy loading via React.lazy if needed
let Spline: any = null;

// Preload Spline immediately when component is imported
const loadSpline = async () => {
  if (!Spline) {
    try {
      const SplineModule = await import('@splinetool/react-spline');
      Spline = SplineModule.default;
    } catch (error) {
      console.error('Failed to load Spline:', error);
      return null;
    }
  }
  return Spline;
};

// Start loading Spline immediately
loadSpline();

interface EarthAnimationProps {
  onGlobeReady?: () => void;
}

export default function EarthAnimation({ onGlobeReady }: EarthAnimationProps) {
  const splineRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [SplineComponent, setSplineComponent] = useState<any>(null);

  // Load Spline component on mount with priority
  useEffect(() => {
    loadSpline().then(SplineComp => {
      if (SplineComp) {
        setSplineComponent(() => SplineComp);
      } else {
        setHasError(true);
        onGlobeReady?.();
      }
    });
  }, [onGlobeReady]);

  // Extended fallback trigger for text animations
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        onGlobeReady?.();
      }
    }, 3000); // Extended to give globe more time to load

    return () => clearTimeout(fallbackTimer);
  }, [isLoaded, onGlobeReady]);

  const handleLoad = (spline: any) => {
    splineRef.current = spline;
    setIsLoaded(true);
    
    try {
      // Check if setSpeed method exists before calling it
      if (typeof spline.setSpeed === 'function') {
        spline.setSpeed(0.8); // Slightly slower for better performance
      }
      
      // Check if play method exists before calling it
      if (typeof spline.play === 'function') {
        spline.play();
      }
    } catch (error) {
      console.log('Spline animation controls not available:', error);
    }
    
    // Trigger text animations
    onGlobeReady?.();
  };

  const handleError = (error: any) => {
    console.error('Spline loading error:', error);
    setHasError(true);
    // Still trigger text animations even if 3D fails
    onGlobeReady?.();
  };

  // No loading spinner - just show fallback gradient while Spline loads
  if (!SplineComponent && !hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-radial from-[#6BE53D]/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-conic from-[#6BE53D]/20 via-transparent to-[#6BE53D]/10 animate-pulse" style={{ animationDuration: '4s' }} />
      </motion.div>
    );
  }

  // Fallback component if Spline fails to load
  if (hasError || !SplineComponent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-gradient-radial from-[#6BE53D]/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-conic from-[#6BE53D]/20 via-transparent to-[#6BE53D]/10 animate-pulse" style={{ animationDuration: '4s' }} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ 
        duration: 1.2, 
        ease: [0.23, 1, 0.32, 1],
        delay: 0 // Remove delay to start immediately
      }}
      className="absolute inset-0 pointer-events-none z-0"
    >
      <SplineComponent
        scene="https://prod.spline.design/4rSGGXlG7TeC2F-0/scene.splinecode"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        renderOnDemand={false} // Render immediately for priority
      />
    </motion.div>
  );
} 