"use client";

import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import { useRef } from 'react';

interface EarthAnimationProps {
  onGlobeReady?: () => void;
}

export default function EarthAnimation({ onGlobeReady }: EarthAnimationProps) {
  const splineRef = useRef<any>(null);

  const handleLoad = (spline: any) => {
    splineRef.current = spline;
    
    try {
      // Check if setSpeed method exists before calling it
      if (typeof spline.setSpeed === 'function') {
        spline.setSpeed(1.0); // Normal speed
      }
      
      // Check if play method exists before calling it
      if (typeof spline.play === 'function') {
        spline.play();
      }
    } catch (error) {
      console.log('Spline animation controls not available:', error);
    }
    
    // Trigger text animations immediately
    onGlobeReady?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      transition={{ 
        duration: 1.2, 
        ease: [0.23, 1, 0.32, 1],
        delay: 0.2 
      }}
      className="absolute inset-0 pointer-events-none z-0"
    >
      <Spline
        scene="https://prod.spline.design/4rSGGXlG7TeC2F-0/scene.splinecode"
        onLoad={handleLoad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        // ANIMATION CONTROLS:
        // onLoad={(spline) => {
        //   console.log('Spline loaded', spline);
        //   // Access the Spline application instance
        //   // spline.setZoom(1.5); // Control camera zoom
        //   // spline.lookAt([0, 0, 0]); // Control camera target
        //   // spline.play(); // Start animation
        //   // spline.pause(); // Pause animation
        //   // spline.stop(); // Stop animation
        //   // spline.setSpeed(0.5); // Control animation speed (0.5 = half speed)
        // }}
        
        // EVENT HANDLERS:
        // onMouseDown={(e) => console.log('Mouse down', e)}
        // onMouseUp={(e) => console.log('Mouse up', e)}
        // onMouseMove={(e) => console.log('Mouse move', e)}
        // onMouseHover={(e) => console.log('Mouse hover', e)}
        // onKeyDown={(e) => console.log('Key down', e)}
        // onKeyUp={(e) => console.log('Key up', e)}
        // onStart={() => console.log('Animation started')}
        // onLookAt={(e) => console.log('Camera look at', e)}
        // onFollow={(e) => console.log('Camera follow', e)}
        // onWheel={(e) => console.log('Mouse wheel', e)}
        
        // RENDERING OPTIONS:
        // renderOnDemand={false} // Continuous rendering vs on-demand
        // camera="Camera" // Specify which camera to use
        // className="custom-spline-class" // Custom CSS class
        // id="spline-canvas" // Custom ID
      />
    </motion.div>
  );
} 