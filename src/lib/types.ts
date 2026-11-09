export type Expense = {
  id: number;
  merchant: string;
  charge_name: string | null;
  amount: number;
  currency: string;
  category: string;
  date: string; // YYYY-MM-DD
  payment_method: string | null;
  notes: string | null;
  has_receipt: boolean;
};

export type ExpenseInput = {
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  charge_name?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  receipt_token?: string | null;
};

export type ScannedField = 'merchant' | 'amount' | 'currency' | 'category' | 'date';

/** Result of POST /scan-receipt: extracted fields to review, nothing saved yet. */
export type ScannedReceipt = {
  merchant: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  source: 'ai' | 'ocr';
  missing: ScannedField[];
  receipt_token: string;
};

export type Budget = {
  amount: number;
  currency: string;
};

export type BudgetStatus = 'good' | 'warning' | 'over_budget';

export type Summary = {
  month: string; // YYYY-MM
  monthly_budget: number;
  currency: string;
  total_spent: number;
  remaining: number;
  percent_used: number;
  status: BudgetStatus;
  advice: string;
  expense_count: number;
  category_totals: Record<string, number>;
  other_currency_totals: Record<string, number>;
  insights: string[];
  recent_expenses: Expense[];
};

export type ExpenseFilters = {
  month?: string;
  category?: string;
  q?: string;
};

export type Health = {
  status: string;
  ai_enabled: boolean;
};
