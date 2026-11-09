import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, Field, Label } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { daysAgo, isValidISODate, parseAmount, today } from '@/lib/format';
import type { Expense, ExpenseInput } from '@/lib/types';

type Values = {
  merchant: string;
  amount: string;
  currency: string;
  category: string;
  date: string;
  payment_method: string;
  notes: string;
};

type Errors = Partial<Record<keyof Values, string>>;

function initialValues(expense: Expense | undefined, defaultCurrency: string): Values {
  return {
    merchant: expense?.merchant ?? '',
    amount: expense ? String(expense.amount) : '',
    currency: expense?.currency ?? defaultCurrency,
    category: expense?.category ?? 'Other',
    date: expense?.date ?? today(),
    payment_method: expense?.payment_method ?? '',
    notes: expense?.notes ?? '',
  };
}

function validate(v: Values): { errors: Errors; input?: ExpenseInput } {
  const errors: Errors = {};
  const amount = parseAmount(v.amount);
  if (!v.merchant.trim()) errors.merchant = 'Enter where you spent the money';
  if (amount === null || amount <= 0) errors.amount = 'Enter an amount greater than 0';
  if (!/^[A-Za-z]{3}$/.test(v.currency.trim())) errors.currency = '3-letter code, e.g. USD';
  if (!v.category.trim()) errors.category = 'Pick a category';
  if (!isValidISODate(v.date.trim())) errors.date = 'Use YYYY-MM-DD';
  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    input: {
      merchant: v.merchant.trim(),
      amount: amount!,
      currency: v.currency.trim().toUpperCase(),
      category: v.category.trim(),
      date: v.date.trim(),
      payment_method: v.payment_method.trim() || null,
      notes: v.notes.trim() || null,
    },
  };
}

export function ExpenseForm({
  expense,
  categories,
  defaultCurrency,
  submitLabel,
  onSubmit,
}: {
  expense?: Expense;
  categories: string[];
  defaultCurrency: string;
  submitLabel: string;
  onSubmit: (input: ExpenseInput) => Promise<void>;
}) {
  const [values, setValues] = useState(() => initialValues(expense, defaultCurrency));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Values) => (text: string) => {
    setValues((v) => ({ ...v, [key]: text }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async () => {
    const result = validate(values);
    setErrors(result.errors);
    if (!result.input) return;
    setSaving(true);
    try {
      await onSubmit(result.input);
    } finally {
      setSaving(false);
    }
  };

  const allCategories = categories.includes(values.category)
    ? categories
    : [...categories, values.category];

  return (
    <View>
      <Field
        label="Merchant"
        value={values.merchant}
        onChangeText={set('merchant')}
        placeholder="e.g. Trader Joe's"
        error={errors.merchant}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <View style={styles.row}>
        <View style={{ flex: 2 }}>
          <Field
            label="Amount"
            value={values.amount}
            onChangeText={set('amount')}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.amount}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label="Currency"
            value={values.currency}
            onChangeText={(t) => set('currency')(t.toUpperCase())}
            maxLength={3}
            autoCapitalize="characters"
            autoCorrect={false}
            error={errors.currency}
          />
        </View>
      </View>

      <Label>Category</Label>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={{ marginBottom: Spacing.sm }}>
        {allCategories.map((c) => (
          <Chip key={c} label={c} selected={values.category === c} onPress={() => set('category')(c)} />
        ))}
      </ScrollView>
      <Field
        label="Or type a custom category"
        value={categories.includes(values.category) ? '' : values.category}
        onChangeText={(t) => set('category')(t || 'Other')}
        placeholder="e.g. Pets"
        error={errors.category}
      />

      <Field
        label="Date (YYYY-MM-DD)"
        value={values.date}
        onChangeText={set('date')}
        placeholder={today()}
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
        error={errors.date}
      />
      <View style={[styles.chips, { marginTop: -Spacing.sm, marginBottom: Spacing.lg }]}>
        <Chip label="Today" selected={values.date === today()} onPress={() => set('date')(today())} />
        <Chip
          label="Yesterday"
          selected={values.date === daysAgo(1)}
          onPress={() => set('date')(daysAgo(1))}
        />
      </View>

      <Field
        label="Payment method (optional)"
        value={values.payment_method}
        onChangeText={set('payment_method')}
        placeholder="e.g. Visa, Apple Pay, Cash"
      />
      <Field
        label="Notes (optional)"
        value={values.notes}
        onChangeText={set('notes')}
        multiline
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <Button label={submitLabel} onPress={submit} loading={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
