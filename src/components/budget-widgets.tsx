/** Alerts, per-category progress, and the monthly trend chart. */
import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import { ProgressBar } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { categoryEmoji, formatMoney } from '@/lib/format';
import type { BudgetAlert, BudgetStatus, CategoryBudgetStatus, Trends } from '@/lib/types';

export const STATUS_COLOR: Record<BudgetStatus, string> = {
  good: Colors.success,
  warning: Colors.warning,
  over_budget: Colors.danger,
};

export function AlertList({ alerts }: { alerts: BudgetAlert[] }) {
  if (!alerts.length) return null;
  return (
    <View style={{ gap: Spacing.sm, marginBottom: Spacing.md }} accessibilityRole="alert">
      {alerts.map((a) => (
        <View key={a.message} style={[styles.alert, a.level === 'over' ? styles.alertOver : styles.alertWarning]}>
          <Text style={styles.alertIcon}>{a.level === 'over' ? '🚨' : '⚠️'}</Text>
          <Text style={styles.alertText}>{a.message}</Text>
        </View>
      ))}
    </View>
  );
}

export function CategoryBudgetRow({ item, currency }: { item: CategoryBudgetStatus; currency: string }) {
  const over = item.remaining < 0;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${item.category}: ${formatMoney(item.spent, currency)} of ${formatMoney(item.limit, currency)}, ${Math.round(item.percent_used)}% used`}>
      <View style={styles.rowTop}>
        <Text style={styles.rowName} numberOfLines={1}>
          {categoryEmoji(item.category)} {item.category}
        </Text>
        <Text style={styles.rowAmount}>
          {formatMoney(item.spent, currency)} <Text style={styles.muted}>/ {formatMoney(item.limit, currency)}</Text>
        </Text>
      </View>
      <ProgressBar percent={item.percent_used} color={STATUS_COLOR[item.status]} />
      <Text style={[styles.muted, { marginTop: Spacing.xs }, over && { color: Colors.dangerText }]}>
        {over
          ? `${formatMoney(-item.remaining, currency)} over`
          : `${formatMoney(item.remaining, currency)} left · ${Math.round(item.percent_used)}%`}
      </Text>
    </View>
  );
}

function shortMonth(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short' });
}

export function TrendChart({ trends, width }: { trends: Trends; width: number }) {
  const values = trends.months.map((m) => m.total_spent);
  if (values.every((v) => v === 0)) return <Text style={styles.empty}>No spending in the last {values.length} months.</Text>;

  const budget = trends.monthly_budget;
  const overMonths = trends.months.filter((m) => m.total_spent > budget).length;
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <View>
      <BarChart
        data={{
          labels: trends.months.map((m) => shortMonth(m.month)),
          datasets: [
            {
              data: values,
              // Red bars for months over the current budget.
              colors: values.map((v) => () => (v > budget ? Colors.danger : Colors.primary)),
            },
          ],
        }}
        width={width}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero
        withCustomBarColorFromData
        flatColor
        showValuesOnTopOfBars
        withInnerLines={false}
        chartConfig={{
          backgroundGradientFrom: Colors.background,
          backgroundGradientTo: Colors.background,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: () => Colors.textSecondary,
          barPercentage: 0.6,
        }}
        style={{ marginLeft: -Spacing.lg }}
      />
      <Text style={styles.muted}>
        Average {formatMoney(average, trends.currency)} / month · budget {formatMoney(budget, trends.currency)}
        {overMonths ? ` · over budget in ${overMonths} of ${values.length} months` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  alertOver: { backgroundColor: '#450A0A', borderColor: '#991B1B' },
  alertWarning: { backgroundColor: '#422006', borderColor: '#92400E' },
  alertIcon: { fontSize: 16 },
  alertText: { color: Colors.text, fontSize: 14, flex: 1, lineHeight: 20 },
  row: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.sm + 2 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  rowName: { color: Colors.text, fontSize: 15, fontWeight: '600', flexShrink: 1 },
  rowAmount: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  muted: { color: Colors.textSecondary, fontSize: 13, fontWeight: 'normal' },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.lg },
});
