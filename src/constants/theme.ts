/** App-wide design tokens. The app uses a single dark theme (see app.json userInterfaceStyle). */

export const Colors = {
  background: '#111827',
  surface: '#1F2937',
  surfaceRaised: '#374151',
  border: '#374151',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  primary: '#2563EB',
  success: '#10B981',
  successText: '#34D399',
  warning: '#F59E0B',
  danger: '#DC2626',
  dangerText: '#F87171',
} as const;

export const ChartColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 16,
  pill: 999,
} as const;

export const MaxContentWidth = 720;
