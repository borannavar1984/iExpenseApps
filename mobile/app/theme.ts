import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32',
    onPrimary: '#FFFFFF',
    primaryContainer: '#A8E6C1',
    onPrimaryContainer: '#005A2F',
    secondary: '#1565C0',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#C5E1FF',
    onSecondaryContainer: '#001A3E',
    tertiary: '#F57C00',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFE1CC',
    onTertiaryContainer: '#4C2700',
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    background: '#FEFBFE',
    onBackground: '#1C1B1F',
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#EFE1EB',
    onSurfaceVariant: '#49454E',
    outline: '#79747E',
    outlineVariant: '#CAC7D0',
    scrim: '#000000',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A8E6C1',
    onPrimary: '#003D19',
    primaryContainer: '#005A2F',
    onPrimaryContainer: '#A8E6C1',
    secondary: '#C5E1FF',
    onSecondary: '#003062',
    secondaryContainer: '#0D47A1',
    onSecondaryContainer: '#C5E1FF',
    tertiary: '#FFB74D',
    onTertiary: '#7C3800',
    tertiaryContainer: '#B2480A',
    onTertiaryContainer: '#FFE1CC',
    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    background: '#1C1B1F',
    onBackground: '#E6E1E6',
    surface: '#1C1B1F',
    onSurface: '#E6E1E6',
    surfaceVariant: '#49454E',
    onSurfaceVariant: '#CAC7D0',
    outline: '#938F99',
    outlineVariant: '#49454E',
    scrim: '#000000',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const typography = {
  displayLarge: {
    fontSize: 57,
    fontWeight: '700' as const,
    lineHeight: 64,
  },
  displayMedium: {
    fontSize: 45,
    fontWeight: '700' as const,
    lineHeight: 52,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
  },
  headlineLarge: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
};
