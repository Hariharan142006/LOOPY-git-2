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

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
