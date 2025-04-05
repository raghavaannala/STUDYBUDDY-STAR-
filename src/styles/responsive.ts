// Breakpoint definitions
export const breakpoints = {
  xs: '360px',   // Extra small devices (small phones)
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px' // Ultra wide screens
};

// Container sizes for different breakpoints
export const containerSizes = {
  xs: 'w-[95%]',
  sm: 'w-[90%]',
  md: 'max-w-[85%]',
  lg: 'max-w-[80%]',
  xl: 'max-w-[75%]',
  '2xl': 'max-w-[70%]'
};

// Font sizes with responsive variants
export const fontSizes = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
  '3xl': 'text-3xl sm:text-4xl lg:text-5xl'
};

// Line heights with responsive variants
export const lineHeights = {
  none: 'leading-none',
  tight: 'leading-tight sm:leading-snug',
  snug: 'leading-snug sm:leading-normal',
  normal: 'leading-normal sm:leading-relaxed',
  relaxed: 'leading-relaxed sm:leading-loose',
  loose: 'leading-loose'
};

// Spacing scale with responsive variants
export const spacing = {
  0: '0',
  px: '1px',
  xs: 'space-y-2 sm:space-y-3',
  sm: 'space-y-3 sm:space-y-4',
  md: 'space-y-4 sm:space-y-6',
  lg: 'space-y-6 sm:space-y-8',
  xl: 'space-y-8 sm:space-y-12',
  '2xl': 'space-y-12 sm:space-y-16'
};

// Grid columns for different breakpoints
export const gridCols = {
  cards: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  content: 'grid-cols-1 lg:grid-cols-4',
  features: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  gallery: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
};

// Responsive padding
export const padding = {
  page: 'px-4 sm:px-6 md:px-8 py-6 sm:py-8',
  card: 'p-4 sm:p-6',
  section: 'py-8 sm:py-12 md:py-16'
};

// Responsive margins
export const margins = {
  section: 'mb-8 sm:mb-12 md:mb-16',
  element: 'mb-4 sm:mb-6',
  stack: 'space-y-4 sm:space-y-6'
};

// Responsive flex layouts
export const flexLayouts = {
  row: 'flex flex-col sm:flex-row',
  col: 'flex flex-col',
  wrap: 'flex flex-wrap',
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between'
};

// Responsive text alignments
export const textAligns = {
  start: 'text-left',
  center: 'text-center sm:text-left',
  end: 'text-right'
};

// Responsive gaps
export const gaps = {
  xs: 'gap-2 sm:gap-3',
  sm: 'gap-3 sm:gap-4',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-12'
};

// Responsive border radiuses
export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
};

// Component-specific responsive styles
export const componentStyles = {
  navbar: {
    base: 'sticky top-0 z-50 backdrop-blur-sm',
    container: 'flex items-center justify-between h-16 sm:h-20',
    menu: 'hidden sm:flex items-center space-x-4',
    mobileMenu: 'sm:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'
  },
  sidebar: {
    base: 'w-full sm:w-64 lg:w-72',
    collapsed: 'w-20 sm:w-20',
    content: 'h-[calc(100vh-4rem)] overflow-y-auto'
  },
  modal: {
    base: 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6',
    content: 'w-full max-w-lg mx-auto'
  },
  form: {
    group: 'space-y-2 sm:space-y-3',
    label: 'text-sm font-medium',
    input: 'w-full h-9 sm:h-10'
  }
};

// Responsive animations and transitions
export const animations = {
  fade: 'transition-opacity duration-200',
  scale: 'transition-transform duration-200',
  slide: 'transition-all duration-200',
  hover: 'hover:scale-105 transition-transform duration-200'
};

// Media query helper
export const mediaQuery = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`
}; 