/**
 * Spacing System - 8-point grid system (base unit: 4px)
 *
 * This system provides consistent spacing throughout the app using a mathematical scale
 * that ensures visual hierarchy and consistency across all components.
 */

// Core spacing scale - primitive values
export const spacing = {
  xxs: 2,    // Micro spacing for inline elements
  xs: 4,     // Compact spacing, borders, tiny gaps
  sm: 8,     // Small padding/margins, icon spacing
  md: 12,    // Default spacing, most common usage
  lg: 16,    // Standard content padding, card spacing
  xl: 20,    // Section spacing, between content blocks
  xxl: 24,   // Large section spacing, major separations
  xxxl: 32,  // Extra large spacing, feature separations
  xxxxl: 40, // Hero/feature spacing, maximum separation
} as const

// Semantic spacing groups for specific use cases
export const padding = {
  button: {
    xs: spacing.xs,      // 4 - Compact buttons
    sm: spacing.sm,      // 8 - Small buttons
    md: spacing.md,      // 12 - Default buttons
    lg: spacing.lg,      // 16 - Large buttons
  },
  card: {
    sm: spacing.md,      // 12 - Compact cards
    md: spacing.lg,      // 16 - Default cards
    lg: spacing.xl,      // 20 - Spacious cards
    xl: spacing.xxl,     // 24 - Feature cards
  },
  modal: {
    sm: spacing.lg,      // 16 - Compact modals
    md: spacing.xl,      // 20 - Default modals
    lg: spacing.xxl,     // 24 - Spacious modals
  },
  screen: {
    horizontal: spacing.lg, // 16 - Standard screen padding
    vertical: spacing.lg,   // 16 - Standard screen padding
  },
  input: {
    sm: spacing.sm,      // 8 - Compact inputs
    md: spacing.md,      // 12 - Default inputs
    lg: spacing.lg,      // 16 - Large inputs
  },
} as const

export const margin = {
  content: {
    xs: spacing.xs,      // 4 - Tight content spacing
    sm: spacing.sm,      // 8 - Small content gaps
    md: spacing.md,      // 12 - Default content spacing
    lg: spacing.lg,      // 16 - Generous content spacing
  },
  section: {
    sm: spacing.lg,      // 16 - Small section breaks
    md: spacing.xl,      // 20 - Default section breaks
    lg: spacing.xxl,     // 24 - Large section breaks
    xl: spacing.xxxl,    // 32 - Major section breaks
  },
  listItem: {
    sm: spacing.sm,      // 8 - Compact lists
    md: spacing.md,      // 12 - Default lists
    lg: spacing.lg,      // 16 - Spacious lists
  },
} as const

// Component-specific spacing patterns
export const component = {
  controls: {
    gap: spacing.md,         // 12 - Between control elements
    margin: spacing.md,      // 12 - Around control groups
    padding: spacing.md,     // 12 - Inside controls
  },
  form: {
    fieldGap: spacing.lg,    // 16 - Between form fields
    sectionGap: spacing.xxl, // 24 - Between form sections
    labelGap: spacing.xs,    // 4 - Between label and input
  },
  navigation: {
    itemGap: spacing.sm,     // 8 - Between nav items
    padding: spacing.md,     // 12 - Nav item padding
    sectionGap: spacing.lg,  // 16 - Between nav sections
  },
  toast: {
    padding: spacing.md,     // 12 - Toast internal padding
    margin: spacing.lg,      // 16 - Toast external margin
    gap: spacing.md,         // 12 - Between toast elements
  },
  map: {
    controlPadding: spacing.md,    // 12 - Map control padding
    controlMargin: spacing.md,     // 12 - Between map controls
    overlayPadding: spacing.sm,    // 8 - Overlay internal padding
  },
} as const

// Layout helpers for common patterns
export const layout = {
  containerPadding: spacing.lg,     // 16 - Standard container padding
  sectionGap: spacing.xl,           // 20 - Between major sections
  contentGap: spacing.md,           // 12 - Between content items
  iconGap: spacing.sm,              // 8 - Between icon and text
  buttonGap: spacing.md,            // 12 - Between buttons
} as const

// Negative margins for layout adjustments (use sparingly)
export const negative = {
  xs: -spacing.xs,
  sm: -spacing.sm,
  md: -spacing.md,
  lg: -spacing.lg,
  xl: -spacing.xl,
  xxl: -spacing.xxl,
} as const

export default spacing