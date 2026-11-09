import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Chip, EmptyState, ErrorBanner, Field, Label } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { confirm, notify } from '@/lib/confirm';
import { categoryEmoji, formatMoney, parseAmount } from '@/lib/format';

/** Set, change and remove per-category monthly limits (in the main budget currency). */
export function CategoryLimitsEditor({ currency, onChange }: { currency: string; onChange: () => void }) {
  const limits = useApi('category-budgets', api.categoryBudgets);
  const categories = useApi('categories', api.categories);

  const [category, setCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const existing = limits.data?.find((l) => l.category === category);

  const pick = (c: string) => {
    setCategory(c);
    const current = limits.data?.find((l) => l.category === c);
    setAmount(current ? String(current.amount) : '');
    setError(null);
  };

  const save = async () => {
    const parsed = parseAmount(amount);
    if (!category) return setError('Pick a category first');
    if (parsed === null || parsed <= 0) return setError('Enter an amount greater than 0');
    setSaving(true);
    try {
      await api.setCategoryBudget(category, parsed);
      setCategory(null);
      setAmount('');
      setError(null);
      await limits.reload();
      onChange();
    } catch (err) {
      notify('Could not save limit', err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: string) => {
    if (!(await confirm('Remove limit?', `Stop tracking a monthly limit for ${c}.`, 'Remove'))) return;
    try {
      await api.deleteCategoryBudget(c);
      if (category === c) {
        setCategory(null);
        setAmount('');
      }
      await limits.reload();
      onChange();
    } catch (err) {
      notify('Could not remove limit', err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <View>
      {limits.error ? <ErrorBanner message={limits.error} onRetry={limits.reload} /> : null}

      {limits.data?.length === 0 ? (
        <EmptyState>No category limits yet. Add one below, for example Groceries.</EmptyState>
      ) : null}
      {limits.data?.map((l) => (
        <View key={l.category} style={[styles.limit, category === l.category && styles.limitSelected]}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => pick(l.category)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${l.category} limit, currently ${formatMoney(l.amount, currency)}`}>
            <Text style={styles.limitName}>
              {categoryEmoji(l.category)} {l.category}
            </Text>
            <Text style={styles.limitAmount}>{formatMoney(l.amount, currency)} / month · tap to edit</Text>
          </Pressable>
          <Button label="Remove" variant="secondary" small onPress={() => remove(l.category)} />
        </View>
      ))}

      <View style={styles.form}>
        <Label>{existing ? `Change the ${existing.category} limit` : 'Add a limit'}</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {(categories.data ?? []).map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => pick(c)} />
          ))}
        </ScrollView>
        <Field
          label={`Monthly limit (${currency})`}
          value={amount}
          onChangeText={(t) => {
            setAmount(t);
            setError(null);
          }}
          keyboardType="decimal-pad"
          placeholder="e.g. 300"
          error={error}
        />
        <Button
          label={existing ? 'Update limit' : 'Add limit'}
          onPress={save}
          loading={saving}
          disabled={!category}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  limit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  limitSelected: { borderColor: Colors.primary },
  limitName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  limitAmount: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  form: { marginTop: Spacing.md },
  chips: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.md },
});
