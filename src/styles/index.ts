/**
 * Design System Exports
 *
 * Centralized export for all design system components including
 * colors, spacing, and typography systems.
 */

export { default as colors, darkColors } from './colors'
export {
  default as spacing,
  padding,
  margin,
  component as spacingComponent,
  layout as spacingLayout,
  negative
} from './spacing'
export {
  default as fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
  heading,
  body,
  label,
  button as buttonText,
  input as inputText,
  component as typographyComponent,
  layout as typographyLayout
} from './typography'