import { Platform } from 'react-native';

export const LoopyColors = {
  green: '#89c541',
  charcoal: '#2d3436',
  white: '#ffffff',
  accent: '#f0fdf4',
  grey: '#6b7280',
  lightGrey: '#f3f4f6',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  red: '#ef4444',
  primary: '#10b981', // New standard primary green (from hardcoded usages)
  secondaryBackground: '#151718', // Used in dark mode
  textDark: '#111827', // Hardcoded black-ish in UI
  textMedium: '#4b5563', // Hardcoded grey in UI
  textLight: '#9ca3af', // Hardcoded light grey in UI
  border: '#e5e7eb', // Example border color
  success: '#059669', // Darker green
  warning: '#b45309', // Orange/Brown for pending
};

export const Colors = {
  light: {
    text: LoopyColors.charcoal,
    background: LoopyColors.white,
    tint: LoopyColors.green,
    icon: LoopyColors.grey,
    tabIconDefault: LoopyColors.grey,
    tabIconSelected: LoopyColors.green,
    brand: LoopyColors.green,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: LoopyColors.white,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: LoopyColors.white,
    brand: LoopyColors.green,
  },
};
