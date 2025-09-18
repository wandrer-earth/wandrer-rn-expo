# Spacing System Guide

This document outlines how to use the comprehensive spacing system in the Wandrer React Native app.

## Overview

The spacing system uses an **8-point grid** (base unit: 4px) which ensures:
- **Visual consistency** across all components
- **Predictable spacing relationships**
- **Easy maintenance** and updates
- **Type safety** with TypeScript

## Core Values

```typescript
import { spacing } from '../src/styles/spacing'

spacing.xxs   // 2  - Micro spacing
spacing.xs    // 4  - Compact spacing
spacing.sm    // 8  - Small spacing
spacing.md    // 12 - Default spacing (most common)
spacing.lg    // 16 - Standard content spacing
spacing.xl    // 20 - Section spacing
spacing.xxl   // 24 - Large section spacing
spacing.xxxl  // 32 - Extra large spacing
spacing.xxxxl // 40 - Hero/feature spacing
```

## Usage Patterns

### 1. Component Padding

Use semantic padding constants for consistent internal spacing:

```typescript
import { padding } from '../src/styles/spacing'

// Button padding
paddingHorizontal: padding.button.md  // 12
paddingVertical: padding.button.sm    // 8

// Card padding
padding: padding.card.md              // 16

// Modal padding
padding: padding.modal.lg             // 24

// Input padding
padding: padding.input.md             // 12
```

### 2. Component Margins

Use semantic margin constants for consistent external spacing:

```typescript
import { margin } from '../src/styles/spacing'

// Content spacing
marginBottom: margin.content.md       // 12

// Section breaks
marginBottom: margin.section.lg       // 24

// List item spacing
marginBottom: margin.listItem.md      // 12
```

### 3. Component-Specific Patterns

Use pre-defined component patterns for common UI elements:

```typescript
import { component } from '../src/styles/spacing'

// Map controls
padding: component.map.controlPadding      // 12
marginBottom: component.map.controlMargin  // 12

// Toast notifications
padding: component.toast.padding           // 12
marginHorizontal: component.toast.margin   // 16

// Form elements
marginBottom: component.form.fieldGap      // 16
marginRight: component.form.labelGap       // 4

// Navigation
padding: component.navigation.padding      // 12
gap: component.navigation.itemGap          // 8
```

### 4. Layout Helpers

Common spacing patterns for layouts:

```typescript
import { layout } from '../src/styles/spacing'

paddingHorizontal: layout.containerPadding // 16
marginBottom: layout.sectionGap           // 20
marginRight: layout.iconGap               // 8
gap: layout.buttonGap                     // 12
```

### 5. Negative Margins (Use Sparingly)

For layout adjustments when needed:

```typescript
import { negative } from '../src/styles/spacing'

marginHorizontal: negative.sm  // -8
marginTop: negative.md         // -12
```

## Best Practices

### ✅ Do
- Use semantic constants (e.g., `padding.card.md`) over raw values
- Choose spacing that maintains visual hierarchy
- Use consistent spacing for similar UI elements
- Prefer component-specific patterns when available

### ❌ Don't
- Use hardcoded pixel values (e.g., `margin: 15`)
- Mix spacing systems inconsistently
- Create custom spacing values without updating the system
- Overuse negative margins

## Component Examples

### Map Controls
```typescript
const styles = StyleSheet.create({
  controlButton: {
    padding: component.map.controlPadding,        // 12
    marginBottom: component.map.controlMargin,    // 12
  },
})
```

### Toast Messages
```typescript
const styles = StyleSheet.create({
  toast: {
    padding: component.toast.padding,             // 12
    marginHorizontal: component.toast.margin,     // 16
    marginTop: component.toast.gap,               // 12
  },
})
```

### Form Elements
```typescript
const styles = StyleSheet.create({
  input: {
    padding: padding.input.md,                    // 12
    marginBottom: component.form.fieldGap,        // 16
  },

  modal: {
    padding: padding.modal.lg,                    // 24
  },
})
```

### Card Components
```typescript
const styles = StyleSheet.create({
  card: {
    padding: padding.card.md,                     // 16
    marginBottom: margin.section.md,              // 20
  },

  cardContent: {
    marginBottom: margin.content.md,              // 12
  },
})
```

## Migration Guide

When updating existing components:

1. **Import the spacing system**:
   ```typescript
   import { spacing, padding, margin, component } from '../styles/spacing'
   ```

2. **Replace hardcoded values** with semantic constants:
   ```typescript
   // Before
   padding: 12,
   marginBottom: 16,

   // After
   padding: spacing.md,
   marginBottom: margin.content.lg,
   ```

3. **Use component-specific patterns** when available:
   ```typescript
   // Before
   padding: 12,  // in map controls

   // After
   padding: component.map.controlPadding,
   ```

## Type Safety

All spacing values are strongly typed in TypeScript, providing:
- **Autocomplete** for available spacing values
- **Compile-time errors** for invalid usage
- **IntelliSense** documentation in your IDE

## Extending the System

To add new spacing values:

1. Update `src/styles/spacing.ts`
2. Add to the appropriate semantic group
3. Update this documentation
4. Use TypeScript to ensure type safety

This spacing system provides a solid foundation for consistent, maintainable UI spacing throughout the Wandrer app.