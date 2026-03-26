/**
 * Promise Engine Design System
 * Sky/Cloud aesthetic with scanline overlay
 */

export const colors = {
  // Sky gradient
  skyLight: '#E0F6FF',
  skyMid: '#B3E5FC',
  skyDark: '#87CEEB',

  // Clouds
  cloudWhite: '#FFFFFF',
  cloudGray: '#F5F5F5',

  // Text
  textDark: '#2C3E50',
  textMuted: '#7F8C8D',
  textLight: '#FFFFFF',

  // Accent
  accent: '#3498DB',
  accentHover: '#2980B9',

  // Status
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
};

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    mono: '"Courier New", "Courier", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    xxl: '2rem',
    xxxl: '3rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const animations = {
  cloudDrift: '120s linear infinite',
  scanlines: '8s linear infinite',
};

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px',
};
