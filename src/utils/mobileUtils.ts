/**
 * Utility functions for mobile device detection and optimization
 */

/**
 * Detects if the current device is a mobile device using user agent
 * @returns boolean indicating if the current device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Regular expression for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  return mobileRegex.test(userAgent);
};

/**
 * Detects if the current device is a touch device
 * @returns boolean indicating if the current device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Formats file size for mobile displays
 * @param bytes - Size in bytes
 * @returns formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Truncates text to specified length for mobile displays
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns truncated text
 */
export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Debounces a function call - useful for optimizing mobile performance
 * @param func - Function to debounce
 * @param wait - Wait time in ms
 * @returns debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Locks body scroll - useful for mobile modals
 */
export const lockBodyScroll = (): void => {
  if (typeof document === 'undefined') return;
  
  // Save current scroll position
  const scrollY = window.scrollY;
  
  // Add styles to body
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
};

/**
 * Unlocks body scroll
 */
export const unlockBodyScroll = (): void => {
  if (typeof document === 'undefined') return;
  
  // Get scroll position
  const scrollY = document.body.style.top;
  
  // Reset styles
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  
  // Scroll to previous position
  window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
}; 