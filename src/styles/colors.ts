export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  light: '#F2F2F7',
  dark: '#1C1C1E',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#C7C7CC',
  systemBackground: '#FFFFFF',
  secondarySystemBackground: '#F2F2F7',
} as const

export const darkColors = {
  ...colors,
  systemBackground: '#000000',
  secondarySystemBackground: '#1C1C1E',
  light: '#1C1C1E',
  dark: '#F2F2F7',
} as const

export default colors