import React from 'react';
import { useDeviceDetect } from '@/hooks/useMediaQuery';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  as?: React.ElementType;
}

/**
 * A container component that applies different classes based on screen size
 * All content inside this container will automatically adjust based on current device
 */
export function ResponsiveContainer({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  as: Component = 'div'
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useDeviceDetect();

  // Determine which class to apply based on screen size
  const responsiveClass = isMobile
    ? mobileClassName
    : isTablet
    ? tabletClassName
    : desktopClassName;

  return (
    <Component className={`${className} ${responsiveClass}`}>
      {children}
    </Component>
  );
}

/**
 * A container that shows or hides content based on screen size
 */
export function DeviceVisibility({
  children,
  showOnMobile = true,
  showOnTablet = true,
  showOnDesktop = true,
  className = ''
}: {
  children: React.ReactNode;
  showOnMobile?: boolean;
  showOnTablet?: boolean;
  showOnDesktop?: boolean;
  className?: string;
}) {
  const { isMobile, isTablet, isDesktop } = useDeviceDetect();

  // Check if content should be visible on current device
  const isVisible =
    (isMobile && showOnMobile) ||
    (isTablet && showOnTablet) ||
    (isDesktop && showOnDesktop);

  if (!isVisible) return null;

  return <div className={className}>{children}</div>;
}

/**
 * Displays different content depending on device type
 */
export function ResponsiveRender({
  mobile,
  tablet,
  desktop,
  fallback
}: {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isMobile, isTablet, isDesktop } = useDeviceDetect();

  if (isMobile && mobile !== undefined) return <>{mobile}</>;
  if (isTablet && tablet !== undefined) return <>{tablet}</>;
  if (isDesktop && desktop !== undefined) return <>{desktop}</>;
  return <>{fallback}</>;
}

/**
 * Adds appropriate padding for different screen sizes
 */
export function ContentContainer({ 
  children, 
  className = ''
}: { 
  children: React.ReactNode,
  className?: string 
}) {
  return (
    <div className={`px-4 md:px-8 lg:px-12 xl:px-0 mx-auto max-w-7xl ${className}`}>
      {children}
    </div>
  );
} 