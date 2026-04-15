/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

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

export const Fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};
