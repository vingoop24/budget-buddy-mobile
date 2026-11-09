import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { categoryEmoji, formatDate, formatMoney } from '@/lib/format';
import type { Expense } from '@/lib/types';

export function ExpenseRow({ expense, onDelete }: { expense: Expense; onDelete?: () => void }) {
  return (
    <Link href={{ pathname: '/expense/[id]', params: { id: String(expense.id) } }} asChild>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
        accessibilityLabel={`${expense.merchant}, ${formatMoney(expense.amount, expense.currency)}, ${expense.category}, ${formatDate(expense.date)}. Tap to edit.`}>
        <Text style={styles.emoji}>{categoryEmoji(expense.category)}</Text>
        <View style={styles.middle}>
          <Text style={styles.merchant} numberOfLines={1}>
            {expense.merchant}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {expense.category} · {formatDate(expense.date)}
            {expense.has_receipt ? ' · 🧾' : ''}
          </Text>
        </View>
        <Text style={styles.amount}>{formatMoney(expense.amount, expense.currency)}</Text>
        {onDelete ? (
          <Pressable
            onPress={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${expense.merchant}`}
            style={styles.delete}>
            <Text style={styles.deleteText}>🗑</Text>
          </Pressable>
        ) : null}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.md - 2,
    marginBottom: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  emoji: { fontSize: 22 },
  middle: { flex: 1 },
  merchant: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  meta: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  amount: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  delete: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
  },
  deleteText: { fontSize: 14 },
});
