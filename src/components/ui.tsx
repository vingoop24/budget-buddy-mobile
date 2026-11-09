/** Small shared building blocks used across screens. */
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Radius, Spacing, WebTabBarInset } from '@/constants/theme';

export function Screen({
  children,
  refreshing,
  onRefresh,
  topInset = true,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  topInset?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.screenContent,
        { paddingTop: (topInset ? insets.top + WebTabBarInset : 0) + Spacing.xl, paddingBottom: insets.bottom + Spacing.xxl },
      ]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={Colors.text} />
        ) : undefined
      }>
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

export function Title({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const bg = {
    primary: Colors.primary,
    secondary: Colors.surfaceRaised,
    success: Colors.success,
    danger: Colors.danger,
  }[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        small ? styles.buttonSmall : styles.button,
        { backgroundColor: bg, opacity: inactive ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <Text style={[styles.buttonText, small && { fontSize: 13 }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && { color: Colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <Button label="Try again" variant="secondary" small onPress={onRetry} /> : null}
    </View>
  );
}

export function Loading() {
  return <ActivityIndicator color={Colors.text} style={{ marginVertical: Spacing.xxl }} />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <Text style={styles.empty}>{children}</Text>;
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string | null }) {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={Colors.textMuted}
        {...props}
        style={[styles.input, error ? { borderColor: Colors.dangerText } : null, props.style]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const width = `${Math.max(0, Math.min(100, percent))}%` as const;
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percent) }}>
      <View style={[styles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  screenContent: { paddingHorizontal: Spacing.xl, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MaxContentWidth },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginTop: Spacing.xs },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  buttonSmall: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 14 },
  error: {
    backgroundColor: '#7F1D1D',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  errorText: { color: '#FECACA', fontSize: 14 },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.xl },
  label: { color: Colors.textSecondary, fontSize: 14, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fieldError: { color: Colors.dangerText, fontSize: 13, marginTop: Spacing.xs },
  track: {
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  fill: { height: '100%', borderRadius: Radius.pill },
});
