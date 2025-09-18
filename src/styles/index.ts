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
  fontWeight,
  heading,
  body,
  label,
  button as buttonText,
  component as typographyComponent,
  navigation,
  form,
  onboarding
} from './typography'