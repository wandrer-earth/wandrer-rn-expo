/**
 * Typography System - Modular scale system (base: 16px, ratio: 1.2)
 *
 * This system provides consistent typography throughout the app using a mathematical scale
 * that ensures visual hierarchy and readability across all text elements.
 */

// Core font size scale - primitive values
export const fontSize = {
  xxs: 10,    // Micro text for labels, captions, timestamps
  xs: 12,     // Small text for helper text, metadata
  sm: 14,     // Body small for secondary content
  md: 16,     // Body default - base font size
  lg: 18,     // Body large for emphasized content
  xl: 20,     // Heading small for minor headings
  xxl: 24,    // Heading medium for section headings
  xxxl: 28,   // Heading large for page headings
  xxxxl: 32,  // Display/Hero text for major titles
} as const

// Line height ratios for optimal readability
export const lineHeight = {
  // Tight line height for headings and UI elements
  tight: {
    xxs: fontSize.xxs * 1.2,    // 12
    xs: fontSize.xs * 1.2,      // 14.4
    sm: fontSize.sm * 1.2,      // 16.8
    md: fontSize.md * 1.2,      // 19.2
    lg: fontSize.lg * 1.2,      // 21.6
    xl: fontSize.xl * 1.2,      // 24
    xxl: fontSize.xxl * 1.2,    // 28.8
    xxxl: fontSize.xxxl * 1.2,  // 33.6
    xxxxl: fontSize.xxxxl * 1.2, // 38.4
  },
  // Normal line height for body text
  normal: {
    xxs: fontSize.xxs * 1.4,    // 14
    xs: fontSize.xs * 1.4,      // 16.8
    sm: fontSize.sm * 1.4,      // 19.6
    md: fontSize.md * 1.4,      // 22.4
    lg: fontSize.lg * 1.4,      // 25.2
    xl: fontSize.xl * 1.4,      // 28
    xxl: fontSize.xxl * 1.4,    // 33.6
    xxxl: fontSize.xxxl * 1.4,  // 39.2
    xxxxl: fontSize.xxxxl * 1.4, // 44.8
  },
  // Loose line height for better readability in long text
  loose: {
    xxs: fontSize.xxs * 1.6,    // 16
    xs: fontSize.xs * 1.6,      // 19.2
    sm: fontSize.sm * 1.6,      // 22.4
    md: fontSize.md * 1.6,      // 25.6
    lg: fontSize.lg * 1.6,      // 28.8
    xl: fontSize.xl * 1.6,      // 32
    xxl: fontSize.xxl * 1.6,    // 38.4
    xxxl: fontSize.xxxl * 1.6,  // 44.8
    xxxxl: fontSize.xxxxl * 1.6, // 51.2
  },
} as const

// Font weight scale
export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const

// Letter spacing for different use cases
export const letterSpacing = {
  tight: -0.5,    // For large headings
  normal: 0,      // Default spacing
  wide: 0.5,      // For small caps or buttons
  wider: 1,       // For uppercase labels
} as const

// Semantic typography groups for specific use cases
export const heading = {
  h1: {
    fontSize: fontSize.xxxxl,
    lineHeight: lineHeight.tight.xxxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.tight.xxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.tight.xxl,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSize.xl,
    lineHeight: lineHeight.tight.xl,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.tight.lg,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.tight.md,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
} as const

export const body = {
  large: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.normal.lg,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  default: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.normal.md,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  small: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal.sm,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.normal.xs,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  micro: {
    fontSize: fontSize.xxs,
    lineHeight: lineHeight.normal.xxs,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
} as const

export const label = {
  large: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.tight.md,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  default: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.tight.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  small: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.tight.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
  uppercase: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.tight.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wider,
  },
} as const

// UI component-specific typography
export const button = {
  large: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.tight.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  default: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.tight.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  small: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.tight.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.normal,
  },
  micro: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.tight.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
  },
} as const

export const input = {
  large: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.normal.lg,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  default: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.normal.md,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  small: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal.sm,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  placeholder: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.normal.md,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
} as const

// Component-specific typography patterns
export const component = {
  navigation: {
    tab: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.tight.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wide,
    },
    header: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.tight.lg,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.normal,
    },
    link: {
      fontSize: fontSize.md,
      lineHeight: lineHeight.normal.md,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.normal,
    },
  },
  card: {
    title: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.tight.lg,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.normal,
    },
    subtitle: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.normal.sm,
      fontWeight: fontWeight.normal,
      letterSpacing: letterSpacing.normal,
    },
    meta: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.normal.xs,
      fontWeight: fontWeight.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
  badge: {
    large: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.tight.sm,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.normal,
    },
    default: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.tight.xs,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.wide,
    },
    small: {
      fontSize: fontSize.xxs,
      lineHeight: lineHeight.tight.xxs,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.wider,
    },
  },
  toast: {
    title: {
      fontSize: fontSize.md,
      lineHeight: lineHeight.tight.md,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.normal,
    },
    message: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.normal.sm,
      fontWeight: fontWeight.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
  onboarding: {
    title: {
      fontSize: fontSize.xxl,
      lineHeight: lineHeight.tight.xxl,
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.normal,
    },
    subtitle: {
      fontSize: fontSize.md,
      lineHeight: lineHeight.loose.md,
      fontWeight: fontWeight.normal,
      letterSpacing: letterSpacing.normal,
    },
  },
} as const

// Layout helpers for common typography patterns
export const layout = {
  titleBody: {
    titleMarginBottom: 8,  // Space between title and body
    paragraphGap: 16,      // Space between paragraphs
  },
  listItem: {
    titleBodyGap: 4,       // Space between item title and description
    metaGap: 2,            // Space between description and meta
  },
  form: {
    labelInputGap: 4,      // Space between label and input
    helpTextGap: 4,        // Space between input and help text
  },
} as const

export default fontSize