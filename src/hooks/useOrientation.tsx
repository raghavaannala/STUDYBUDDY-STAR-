import { useState, useEffect } from 'react';

/**
 * Hook for detecting screen orientation changes
 * @returns Object with orientation information
 */
export function useOrientation() {
  // Initial state based on window dimensions
  const [orientation, setOrientation] = useState({
    type: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    angle: window.orientation ?? 0,
    isPortrait: window.innerHeight > window.innerWidth,
    isLandscape: window.innerWidth > window.innerHeight
  });

  useEffect(() => {
    // Handler for orientation/resize changes
    const handleChange = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation({
        type: isPortrait ? 'portrait' : 'landscape',
        angle: window.orientation ?? 0,
        isPortrait,
        isLandscape: !isPortrait
      });
    };

    // Listen for both orientation and resize events
    window.addEventListener('orientationchange', handleChange);
    window.addEventListener('resize', handleChange);

    // Initial check
    handleChange();

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  return orientation;
} 