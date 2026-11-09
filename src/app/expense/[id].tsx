import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExpenseForm } from '@/components/expense-form';
import { Button, ErrorBanner, Loading, Screen, SectionTitle } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { confirm, notify } from '@/lib/confirm';
import { formatMoney } from '@/lib/format';

export default function EditExpenseScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const [deleting, setDeleting] = useState(false);

  const { data, error, reload } = useApi(`expense:${id}`, async () => {
    if (!Number.isInteger(id)) throw new Error('Invalid expense id');
    const [expense, categories] = await Promise.all([api.getExpense(id), api.categories()]);
    return { expense, categories };
  });

  const remove = async () => {
    if (!data) return;
    const { expense } = data;
    const ok = await confirm('Delete expense?', `${expense.merchant} — ${formatMoney(expense.amount, expense.currency)}`);
    if (!ok) return;
    setDeleting(true);
    try {
      await api.deleteExpense(expense.id);
      router.back();
    } catch (err) {
      notify('Could not delete', err instanceof Error ? err.message : String(err));
      setDeleting(false);
    }
  };

  return (
    <Screen topInset={false}>
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
      {!data && !error ? <Loading /> : null}
      {data ? (
        <>
          <ExpenseForm
            // Remount the form if the expense is reloaded with new values.
            key={JSON.stringify(data.expense)}
            expense={data.expense}
            categories={data.categories}
            defaultCurrency={data.expense.currency}
            submitLabel="Save changes"
            onSubmit={async (input) => {
              try {
                await api.updateExpense(id, input);
                router.back();
              } catch (err) {
                notify('Could not save', err instanceof Error ? err.message : String(err));
              }
            }}
          />

          {data.expense.has_receipt ? (
            <>
              <SectionTitle>Receipt</SectionTitle>
              <Image
                source={{ uri: api.receiptUrl(id) }}
                style={styles.receipt}
                contentFit="contain"
                accessibilityLabel={`Receipt for ${data.expense.merchant}`}
              />
            </>
          ) : null}

          <View style={{ marginTop: Spacing.xl }}>
            <Button label="Delete expense" variant="danger" onPress={remove} loading={deleting} />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  receipt: { width: '100%', height: 400, borderRadius: Radius.md, backgroundColor: '#000' },
});
