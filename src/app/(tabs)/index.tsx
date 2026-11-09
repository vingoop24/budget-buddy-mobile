import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { AlertList, CategoryBudgetRow, STATUS_COLOR, TrendChart } from '@/components/budget-widgets';
import { ExpenseRow } from '@/components/expense-row';
import { MonthPicker } from '@/components/month-picker';
import {
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  Loading,
  ProgressBar,
  Screen,
  SectionTitle,
  Title,
} from '@/components/ui';
import { ChartColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { confirm, notify } from '@/lib/confirm';
import { currentMonth, formatMoney } from '@/lib/format';
import type { Expense } from '@/lib/types';

export default function DashboardScreen() {
  const [month, setMonth] = useState(currentMonth());
  const { data, error, loading, reload: reloadSummary } = useApi(`summary:${month}`, () => api.summary(month));
  const trends = useApi(`trends:${month}`, () => api.trends(6, month));
  const reload = () => {
    reloadSummary();
    trends.reload();
  };
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width, MaxContentWidth) - Spacing.xl * 2;

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

  const money = (n: number) => formatMoney(n, data?.currency ?? 'USD');

  const pieData = Object.entries(data?.category_totals ?? {}).map(([name, amount], i) => ({
    name,
    amount,
    color: ChartColors[i % ChartColors.length],
    legendFontColor: Colors.text,
    legendFontSize: 12,
  }));

  return (
    <Screen refreshing={loading && !!data} onRefresh={reload}>
      <Title subtitle="AI-powered finance assistant">Budget Buddy 💸</Title>
      <MonthPicker month={month} onChange={setMonth} />

      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
      {!data && loading ? <Loading /> : null}

      {data ? (
        <>
          <AlertList alerts={data.alerts} />
          <Card>
            <Text style={styles.label}>Spent of {money(data.monthly_budget)}</Text>
            <Text style={styles.big}>{money(data.total_spent)}</Text>
            <ProgressBar percent={data.percent_used} color={STATUS_COLOR[data.status]} />
            <View style={styles.statsRow}>
              <Text style={styles.label}>{Math.round(data.percent_used)}% used</Text>
              <Text style={[styles.label, { color: data.remaining < 0 ? Colors.dangerText : Colors.successText }]}>
                {data.remaining < 0 ? `${money(-data.remaining)} over` : `${money(data.remaining)} left`}
              </Text>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button label="＋ Add expense" onPress={() => router.push('/expense/new')} style={{ flex: 1 }} />
            <Button
              label="📸 Scan receipt"
              variant="success"
              onPress={() => router.push('/scan-receipt')}
              style={{ flex: 1 }}
            />
          </View>

          {data.category_budgets.length ? (
            <>
              <SectionTitle
                right={
                  <Link href="/budget" style={styles.link}>
                    Edit limits
                  </Link>
                }>
                Category budgets
              </SectionTitle>
              {data.category_budgets.map((c) => (
                <CategoryBudgetRow key={c.category} item={c} currency={data.currency} />
              ))}
            </>
          ) : null}

          <SectionTitle>Spending breakdown</SectionTitle>
          {pieData.length ? (
            <PieChart
              data={pieData}
              width={chartWidth}
              height={200}
              chartConfig={{ color: () => Colors.text }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="10"
            />
          ) : (
            <EmptyState>No spending recorded for this month yet.</EmptyState>
          )}

          <SectionTitle>Last 6 months</SectionTitle>
          {trends.data ? <TrendChart trends={trends.data} width={chartWidth} /> : null}
          {trends.error ? <ErrorBanner message={trends.error} onRetry={trends.reload} /> : null}

          <SectionTitle>Insights</SectionTitle>
          {data.insights.map((insight) => (
            <Card key={insight} style={styles.insight}>
              <Text style={styles.insightText}>{insight}</Text>
            </Card>
          ))}

          <SectionTitle
            right={
              data.expense_count > data.recent_expenses.length ? (
                <Link href="/expenses" style={styles.link}>
                  See all {data.expense_count}
                </Link>
              ) : null
            }>
            Recent expenses
          </SectionTitle>
          {data.recent_expenses.length ? (
            data.recent_expenses.map((e) => (
              <ExpenseRow key={e.id} expense={e} onDelete={() => deleteExpense(e)} />
            ))
          ) : (
            <EmptyState>Add an expense or scan a receipt to get started.</EmptyState>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: Colors.textSecondary, fontSize: 14 },
  big: { color: Colors.text, fontSize: 34, fontWeight: 'bold', marginTop: Spacing.xs },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  insight: { padding: Spacing.lg, marginBottom: Spacing.sm + 2 },
  insightText: { color: Colors.text, fontSize: 15 },
  link: { color: '#60A5FA', fontSize: 14 },
});
