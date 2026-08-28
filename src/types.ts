export const CURRENCIES = {
  USD: { label: 'US dollar', digits: 2, locale: 'en-US' },
  EUR: { label: 'Euro', digits: 2, locale: 'en-IE' },
  GBP: { label: 'Pound sterling', digits: 2, locale: 'en-GB' },
  CHF: { label: 'Swiss franc', digits: 2, locale: 'de-CH' },
  INR: { label: 'Indian rupee', digits: 2, locale: 'en-IN' },
  JPY: { label: 'Japanese yen', digits: 0, locale: 'ja-JP' },
  BHD: { label: 'Bahraini dinar', digits: 3, locale: 'en-BH' }
} as const;

export type Currency = keyof typeof CURRENCIES;
export type DiscountMethod = 'gross' | 'net-proportional' | 'net-tax-fixed';
export type RoundingMode = 'currency' | 'cash-005' | 'whole';

export interface CalculationInput {
  invoiceRef: string;
  supplierName: string;
  customerName: string;
  currency: Currency;
  netAmount: string;
  taxAmount: string;
  discountPercent: string;
  method: DiscountMethod;
  rounding: RoundingMode;
  issueDate: string;
  discountDate: string;
  dueDate: string;
  note: string;
}

export interface CalculationResult {
  netMinor: bigint;
  taxMinor: bigint;
  invoiceMinor: bigint;
  discountBaseMinor: bigint;
  netDiscountMinor: bigint;
  taxReductionMinor: bigint;
  discountMinor: bigint;
  earlyPayMinor: bigint;
  regularPayMinor: bigint;
  roundingIncrement: bigint;
  formula: string;
}

export interface SavedCalculation {
  id: string;
  version: number;
  createdAt: string;
  input: CalculationInput;
  result: Record<keyof Omit<CalculationResult, 'formula'>, string> & { formula: string };
}

export interface SavedTemplate {
  id: string;
  name: string;
  createdAt: string;
  input: Partial<CalculationInput>;
}

export const emptyInput = (): CalculationInput => {
  const today = new Date();
  const plus = (days: number) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  };
  return {
    invoiceRef: '', supplierName: '', customerName: '', currency: 'EUR',
    netAmount: '', taxAmount: '0.00', discountPercent: '2',
    method: 'gross', rounding: 'currency', issueDate: plus(0),
    discountDate: plus(10), dueDate: plus(30), note: ''
  };
};
