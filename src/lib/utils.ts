import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Define types for responsive utilities
type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Define constant objects
const FONT_SIZES = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
  '3xl': 'text-3xl sm:text-4xl lg:text-5xl'
} as const

const SPACING = {
  xs: 'space-y-2 sm:space-y-3',
  sm: 'space-y-3 sm:space-y-4',
  md: 'space-y-4 sm:space-y-6',
  lg: 'space-y-6 sm:space-y-8',
  xl: 'space-y-8 sm:space-y-12'
} as const

const PADDING = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-12'
} as const

const MARGINS = {
  xs: 'mb-2 sm:mb-3',
  sm: 'mb-3 sm:mb-4',
  md: 'mb-4 sm:mb-6',
  lg: 'mb-6 sm:mb-8',
  xl: 'mb-8 sm:mb-12'
} as const

const CONTAINER_SIZES = {
  xs: 'w-[95%]',
  sm: 'w-[90%]',
  md: 'max-w-[85%]',
  lg: 'max-w-[80%]',
  xl: 'max-w-[75%]',
  '2xl': 'max-w-[70%]'
} as const

const GAPS = {
  xs: 'gap-2 sm:gap-3',
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-12'
} as const

// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get responsive class based on breakpoint
export function getResponsiveClass(
  baseClass: string,
  breakpoints: { [key: string]: string }
): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, value]) => (breakpoint === 'default' ? value : `${breakpoint}:${value}`))
    .join(' ')
}

// Utility function to handle responsive font sizes
export function getResponsiveFontSize(size: FontSize): string {
  return FONT_SIZES[size]
}

// Utility function to handle responsive spacing
export function getResponsiveSpacing(size: SpacingSize): string {
  return SPACING[size]
}

// Utility function to handle responsive padding
export function getResponsivePadding(size: SpacingSize): string {
  return PADDING[size]
}

// Utility function to handle responsive margins
export function getResponsiveMargin(size: SpacingSize): string {
  return MARGINS[size]
}

// Utility function to handle responsive grid columns
export function getResponsiveGrid(columns: number): string {
  return `grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns}`
}

// Utility function to handle responsive container width
export function getResponsiveContainer(size: ContainerSize): string {
  return `container mx-auto ${CONTAINER_SIZES[size]}`
}

// Utility function to handle responsive flex direction
export function getResponsiveFlex(direction: 'row' | 'col'): string {
  return direction === 'row' 
    ? 'flex flex-col sm:flex-row' 
    : 'flex flex-col'
}

// Utility function to handle responsive gaps
export function getResponsiveGap(size: SpacingSize): string {
  return GAPS[size]
}

// Utility function to format date
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Utility function to format time duration
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return hours > 0 
    ? `${hours}h ${remainingMinutes}m`
    : `${remainingMinutes}m`
}

// Utility function to truncate text
export function truncateText(text: string, length: number): string {
  return text.length > length ? `${text.substring(0, length)}...` : text
}

// Utility function to generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Utility function to debounce function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Utility function to throttle function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
