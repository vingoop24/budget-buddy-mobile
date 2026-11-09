import { router } from 'expo-router';

import { ExpenseForm } from '@/components/expense-form';
import { ErrorBanner, Loading, Screen } from '@/components/ui';
import { useApi } from '@/hooks/use-api';
import { alertAfterSave } from '@/lib/alerts';
import { api } from '@/lib/api';
import { notify } from '@/lib/confirm';

export default function NewExpenseScreen() {
  const { data, error, reload } = useApi('expense-form-data', async () => {
    const [categories, budget] = await Promise.all([api.categories(), api.getBudget()]);
    return { categories, budget };
  });

  return (
    <Screen topInset={false}>
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
      {!data && !error ? <Loading /> : null}
      {data ? (
        <ExpenseForm
          categories={data.categories}
          defaultCurrency={data.budget.currency}
          submitLabel="Save expense"
          onSubmit={async (input) => {
            try {
              await api.createExpense(input);
              router.back();
              alertAfterSave(input);
            } catch (err) {
              notify('Could not save', err instanceof Error ? err.message : String(err));
            }
          }}
        />
      ) : null}
    </Screen>
  );
}
