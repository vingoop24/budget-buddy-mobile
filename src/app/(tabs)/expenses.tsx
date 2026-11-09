import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExpenseRow } from '@/components/expense-row';
import { MonthPicker } from '@/components/month-picker';
import { Button, Chip, EmptyState, ErrorBanner, Loading, Screen, Title, styles as ui } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { confirm, notify } from '@/lib/confirm';
import { currentMonth, formatMoney } from '@/lib/format';
import type { Expense } from '@/lib/types';

export default function ExpensesScreen() {
  const [month, setMonth] = useState<string | null>(currentMonth());
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  // Debounce the search box so we don't hit the server on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters = { month: month ?? undefined, category: category ?? undefined, q: q || undefined };
  const { data, error, loading, reload } = useApi(`expenses:${month}:${category}:${q}`, () =>
    api.listExpenses(filters),
  );
  const categories = useApi('categories', api.categories);

  const deleteExpense = async (expense: Expense) => {
    const ok = await confirm('Delete expense?', `${expense.merchant} — ${formatMoney(expense.amount, expense.currency)}`);
    if (!ok) return;
    try {
      await api.deleteExpense(expense.id);
      reload();
    } catch (err) {
      notify('Could not delete', err instanceof Error ? err.message : String(err));
    }
  };

  // Totals per currency for whatever is currently shown.
  const totals = Object.entries(
    (data ?? []).reduce<Record<string, number>>((acc, e) => {
      acc[e.currency] = (acc[e.currency] ?? 0) + e.amount;
      return acc;
    }, {}),
  );

  return (
    <Screen refreshing={loading && !!data} onRefresh={reload}>
      <View style={styles.header}>
        <Title>Expenses</Title>
        <Button label="＋ Add" small onPress={() => router.push('/expense/new')} />
      </View>

      {month ? <MonthPicker month={month} onChange={setMonth} /> : null}
      <View style={[styles.chips, { marginBottom: Spacing.md }]}>
        <Chip label="This month" selected={month === currentMonth()} onPress={() => setMonth(currentMonth())} />
        <Chip label="All time" selected={month === null} onPress={() => setMonth(null)} />
      </View>

      <TextInput
        style={[ui.input, { marginBottom: Spacing.md }]}
        placeholder="Search merchant or notes"
        placeholderTextColor={Colors.textMuted}
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
        autoCorrect={false}
        accessibilityLabel="Search expenses"
      />

      {categories.data ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All categories" selected={category === null} onPress={() => setCategory(null)} />
          {categories.data.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      ) : null}

      {data && data.length ? (
        <Text style={styles.total}>
          {data.length} {data.length === 1 ? 'expense' : 'expenses'} ·{' '}
          {totals.map(([cur, sum]) => formatMoney(sum, cur)).join(' + ')}
        </Text>
      ) : null}

      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
      {!data && loading ? <Loading /> : null}
      {data?.length === 0 ? <EmptyState>No expenses match these filters.</EmptyState> : null}
      {data?.map((e) => <ExpenseRow key={e.id} expense={e} onDelete={() => deleteExpense(e)} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chips: { flexDirection: 'row', gap: Spacing.sm },
  total: { color: Colors.textSecondary, marginVertical: Spacing.md },
});
