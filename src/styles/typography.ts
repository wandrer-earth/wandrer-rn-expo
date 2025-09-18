/**
 * Typography System
 *
 * Provides consistent text styling across the app with semantic naming
 * and mathematical scale for optimal readability and visual hierarchy.
 */

import { Platform } from 'react-native'

// Font families with platform-specific fallbacks
export const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  monospace: Platform.select({
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
} as const

// Type scale based on modular scale (1.2 ratio)
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  xxxxl: 32,
} as const

// Note: React Native requires absolute lineHeight values (pixels), not multipliers
// These values are calculated based on fontSize * multiplier for each component

// Font weights
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

// Semantic typography styles
export const heading = {
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxxxl * 1.2, // 38.4px
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxxl * 1.2, // 33.6px
  },
  h3: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xxl * 1.4, // 33.6px
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * 1.4, // 28px
  },
  h5: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.lg * 1.4, // 25.2px
  },
  h6: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.md * 1.4, // 22.4px
  },
} as const

export const body = {
  large: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.lg * 1.6, // 28.8px
  },
  regular: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.md * 1.4, // 22.4px
  },
  small: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * 1.4, // 19.6px
  },
  tiny: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * 1.4, // 16.8px
  },
} as const

export const label = {
  large: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.lg * 1.4, // 25.2px
  },
  regular: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.md * 1.4, // 22.4px
  },
  small: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * 1.4, // 19.6px
  },
  tiny: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * 1.4, // 16.8px
  },
} as const

export const button = {
  large: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * 1.2, // 21.6px
  },
  regular: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * 1.2, // 19.2px
  },
  small: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.sm * 1.2, // 16.8px
  },
} as const

export const caption = {
  regular: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * 1.4, // 16.8px
  },
  emphasized: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * 1.4, // 16.8px
  },
} as const

export const code = {
  regular: {
    fontFamily: fontFamily.monospace,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.sm * 1.6, // 22.4px
  },
  small: {
    fontFamily: fontFamily.monospace,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * 1.4, // 16.8px
  },
} as const

// Component-specific typography
export const navigation = {
  title: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * 1.2, // 21.6px
  },
  item: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.md * 1.4, // 22.4px
  },
} as const

export const form = {
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * 1.4, // 19.6px
  },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.md * 1.4, // 22.4px
  },
  helper: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * 1.4, // 16.8px
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.xs * 1.4, // 16.8px
  },
} as const

// Component-specific typography for onboarding
export const onboarding = {
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxl * 1.2, // 28.8px
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: fontSize.md * 1.6, // 25.6px
  },
} as const

// Component-specific patterns grouped together
export const component = {
  navigation,
  form,
  onboarding,
} as const

export default {
  fontFamily,
  fontSize,
  fontWeight,
  heading,
  body,
  label,
  button,
  caption,
  code,
  navigation,
  form,
  onboarding,
}
