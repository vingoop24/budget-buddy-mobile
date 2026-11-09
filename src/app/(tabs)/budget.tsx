import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CategoryLimitsEditor } from '@/components/category-limits-editor';
import { Button, Card, ErrorBanner, Field, Loading, ProgressBar, Screen, SectionTitle, Title } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api, getApiUrl } from '@/lib/api';
import { notify } from '@/lib/confirm';
import { formatMoney, parseAmount } from '@/lib/format';

export default function BudgetScreen() {
  const summary = useApi('summary:current', () => api.summary());
  const health = useApi('health', api.health);

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; currency?: string }>({});
  const [saving, setSaving] = useState(false);

  // Prefill the form once the current budget loads.
  const loadedBudget = summary.data ? `${summary.data.monthly_budget}|${summary.data.currency}` : null;
  useEffect(() => {
    if (!loadedBudget) return;
    const [a, c] = loadedBudget.split('|');
    setAmount(a);
    setCurrency(c);
  }, [loadedBudget]);

  const save = async () => {
    const parsed = parseAmount(amount);
    const next: typeof errors = {};
    if (parsed === null || parsed <= 0) next.amount = 'Enter an amount greater than 0';
    if (!/^[A-Za-z]{3}$/.test(currency.trim())) next.currency = '3-letter code, e.g. USD';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await api.setBudget({ amount: parsed!, currency: currency.trim().toUpperCase() });
      await summary.reload();
      notify('Budget saved', `Your monthly budget is now ${formatMoney(parsed!, currency.trim().toUpperCase())}.`);
    } catch (err) {
      notify('Could not save budget', err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const s = summary.data;

  return (
    <Screen refreshing={summary.loading && !!s} onRefresh={summary.reload}>
      <Title subtitle="Set how much you plan to spend each month">Budget</Title>

      {summary.error ? <ErrorBanner message={summary.error} onRetry={summary.reload} /> : null}
      {!s && summary.loading ? <Loading /> : null}

      {s ? (
        <Card>
          <Text style={styles.label}>This month</Text>
          <Text style={styles.big}>
            {formatMoney(s.total_spent, s.currency)}{' '}
            <Text style={styles.label}>of {formatMoney(s.monthly_budget, s.currency)}</Text>
          </Text>
          <ProgressBar
            percent={s.percent_used}
            color={s.status === 'good' ? Colors.success : s.status === 'warning' ? Colors.warning : Colors.danger}
          />
          <Text style={[styles.label, { marginTop: Spacing.sm }]}>{s.advice}</Text>
        </Card>
      ) : null}

      <SectionTitle>Monthly budget</SectionTitle>
      <View style={styles.row}>
        <View style={{ flex: 2 }}>
          <Field
            label="Amount"
            value={amount}
            onChangeText={(t) => {
              setAmount(t);
              setErrors((e) => ({ ...e, amount: undefined }));
            }}
            keyboardType="decimal-pad"
            placeholder="1500"
            error={errors.amount}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Currency"
            value={currency}
            onChangeText={(t) => {
              setCurrency(t.toUpperCase());
              setErrors((e) => ({ ...e, currency: undefined }));
            }}
            maxLength={3}
            autoCapitalize="characters"
            autoCorrect={false}
            error={errors.currency}
          />
        </View>
      </View>
      <Text style={styles.hint}>
        Only expenses in this currency count toward your budget. Others are listed separately.
      </Text>
      <Button label="Save budget" onPress={save} loading={saving} disabled={!s} />

      <SectionTitle>Category limits</SectionTitle>
      <Text style={styles.hint}>
        Set a monthly cap for any category. You'll get a warning at 80% and an alert when you go over.
      </Text>
      <CategoryLimitsEditor currency={s?.currency ?? 'USD'} onChange={summary.reload} />

      <SectionTitle>Server</SectionTitle>
      <Card>
        <Text style={styles.label}>API address</Text>
        <Text style={styles.value} selectable>
          {getApiUrl()}
        </Text>
        <Text style={[styles.label, { marginTop: Spacing.md }]}>Status</Text>
        <Text style={styles.value}>
          {health.error
            ? '🔴 Not reachable'
            : health.data
              ? `🟢 Connected · AI ${health.data.ai_enabled ? 'enabled' : 'disabled (no OpenAI key)'}`
              : 'Checking…'}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: Colors.textSecondary, fontSize: 14, fontWeight: 'normal' },
  big: { color: Colors.text, fontSize: 28, fontWeight: 'bold', marginTop: Spacing.xs },
  value: { color: Colors.text, fontSize: 15, marginTop: 2 },
  row: { flexDirection: 'row', gap: Spacing.md },
  hint: { color: Colors.textMuted, fontSize: 13, marginTop: -Spacing.sm, marginBottom: Spacing.lg },
});
