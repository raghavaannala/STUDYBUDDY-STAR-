import { useState, useEffect } from 'react';

// Breakpoint values matching Tailwind's default breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook for responsive media queries that returns if the screen matches the given query
 * @param query - CSS media query string
 * @returns boolean indicating if the query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Helper hook to check if screen is smaller than a given breakpoint
 * @param breakpoint - The breakpoint to check against ("sm", "md", "lg", "xl", "2xl")
 * @returns boolean indicating if screen is smaller than the breakpoint
 */
export const useIsSmallerThan = (breakpoint: Breakpoint): boolean => {
  return useMediaQuery(`(max-width: ${breakpoints[breakpoint] - 1}px)`);
};

/**
 * Helper hook to check if screen is larger than a given breakpoint
 * @param breakpoint - The breakpoint to check against ("sm", "md", "lg", "xl", "2xl")
 * @returns boolean indicating if screen is larger than the breakpoint
 */
export const useIsLargerThan = (breakpoint: Breakpoint): boolean => {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
};

/**
 * Helper hook that returns current device type based on screen size
 * @returns object with boolean flags for different device types
 */
export const useDeviceDetect = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');

  return { isMobile, isTablet, isDesktop, isTouch };
};

/**
 * Hook to get the current breakpoint name
 * @returns the current active breakpoint name as a string
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm');
  
  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else {
        setBreakpoint('sm');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return breakpoint;
}; 