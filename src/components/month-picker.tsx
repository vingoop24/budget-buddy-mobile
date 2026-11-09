import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { currentMonth, formatMonth, shiftMonth } from '@/lib/format';

export function MonthPicker({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const isCurrent = month >= currentMonth();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(shiftMonth(month, -1))}
        style={styles.arrow}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        hitSlop={8}>
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>
      <Text style={styles.label} accessibilityRole="header">
        {formatMonth(month)}
      </Text>
      <Pressable
        onPress={() => onChange(shiftMonth(month, 1))}
        disabled={isCurrent}
        style={[styles.arrow, isCurrent && { opacity: 0.3 }]}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        accessibilityState={{ disabled: isCurrent }}
        hitSlop={8}>
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  arrow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  arrowText: { color: Colors.text, fontSize: 26, lineHeight: 28 },
  label: { color: Colors.text, fontSize: 16, fontWeight: '600' },
});
