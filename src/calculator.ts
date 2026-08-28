import { CURRENCIES, type CalculationInput, type CalculationResult } from './types';

export class CalculationError extends Error {}

export function parseMinor(value: string, digits: number, label = 'Amount'): bigint {
  const normalized = value.trim().replace(/,/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw new CalculationError(`${label} must be a positive number.`);
  }
  const [whole, fraction = ''] = normalized.split('.');
  if (fraction.length > digits) {
    throw new CalculationError(`${label} can have at most ${digits} decimal place${digits === 1 ? '' : 's'} for this currency.`);
  }
  return BigInt(whole) * 10n ** BigInt(digits) + BigInt((fraction + '0'.repeat(digits)).slice(0, digits) || '0');
}

function parseRateMilli(value: string): bigint {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,3})?$/.test(normalized)) {
    throw new CalculationError('Discount rate must be a number with no more than 3 decimal places.');
  }
  const [whole, fraction = ''] = normalized.split('.');
  const milli = BigInt(whole) * 1000n + BigInt((fraction + '000').slice(0, 3));
  if (milli <= 0n || milli >= 100000n) {
    throw new CalculationError('Discount rate must be greater than 0% and less than 100%.');
  }
  return milli;
}

function roundHalfUp(numerator: bigint, denominator: bigint, increment: bigint): bigint {
  const scaledDenominator = denominator * increment;
  return ((numerator + scaledDenominator / 2n) / scaledDenominator) * increment;
}

export function getRoundingIncrement(input: CalculationInput): bigint {
  const digits = CURRENCIES[input.currency].digits;
  if (input.rounding === 'whole') return 10n ** BigInt(digits);
  if (input.rounding === 'cash-005') {
    if (digits < 2) throw new CalculationError('0.05 cash rounding is not available for this currency.');
    return 5n * 10n ** BigInt(digits - 2);
  }
  return 1n;
}

export function validateDates(input: CalculationInput): void {
  if (!input.issueDate || !input.discountDate || !input.dueDate) {
    throw new CalculationError('Enter the issue, discount, and final due dates.');
  }
  if (input.discountDate < input.issueDate) {
    throw new CalculationError('The discount deadline cannot be before the issue date.');
  }
  if (input.dueDate < input.discountDate) {
    throw new CalculationError('The final due date cannot be before the discount deadline.');
  }
}

export function calculate(input: CalculationInput): CalculationResult {
  const digits = CURRENCIES[input.currency].digits;
  const netMinor = parseMinor(input.netAmount, digits, 'Net amount');
  const taxMinor = parseMinor(input.taxAmount, digits, 'Tax amount');
  if (netMinor + taxMinor <= 0n) throw new CalculationError('Invoice total must be greater than zero.');
  const rateMilli = parseRateMilli(input.discountPercent);
  const roundingIncrement = getRoundingIncrement(input);
  validateDates(input);

  let discountBaseMinor: bigint;
  let netDiscountMinor: bigint;
  let taxReductionMinor: bigint;
  let formula: string;

  if (input.method === 'gross') {
    discountBaseMinor = netMinor + taxMinor;
    netDiscountMinor = roundHalfUp(discountBaseMinor * rateMilli, 100000n, roundingIncrement);
    taxReductionMinor = 0n;
    formula = 'Invoice total × discount rate; tax is included in the discount basis.';
  } else if (input.method === 'net-proportional') {
    discountBaseMinor = netMinor;
    netDiscountMinor = roundHalfUp(netMinor * rateMilli, 100000n, roundingIncrement);
    taxReductionMinor = roundHalfUp(taxMinor * rateMilli, 100000n, roundingIncrement);
    formula = 'Net amount and tax are reduced separately at the same rate, then rounded.';
  } else {
    discountBaseMinor = netMinor;
    netDiscountMinor = roundHalfUp(netMinor * rateMilli, 100000n, roundingIncrement);
    taxReductionMinor = 0n;
    formula = 'Net amount × discount rate; the entered tax amount remains unchanged.';
  }

  const discountMinor = netDiscountMinor + taxReductionMinor;
  const invoiceMinor = netMinor + taxMinor;
  if (discountMinor >= invoiceMinor) throw new CalculationError('The rounded discount must be less than the invoice total.');
  return {
    netMinor, taxMinor, invoiceMinor, discountBaseMinor, netDiscountMinor,
    taxReductionMinor, discountMinor, earlyPayMinor: invoiceMinor - discountMinor,
    regularPayMinor: invoiceMinor, roundingIncrement, formula
  };
}

export function formatMoney(minor: bigint, currency: CalculationInput['currency']): string {
  const meta = CURRENCIES[currency];
  const value = Number(minor) / 10 ** meta.digits;
  return new Intl.NumberFormat(meta.locale, {
    style: 'currency', currency, minimumFractionDigits: meta.digits,
    maximumFractionDigits: meta.digits
  }).format(value);
}

export function serializeResult(result: CalculationResult): SavedResult {
  return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])) as SavedResult;
}

type SavedResult = Record<keyof Omit<CalculationResult, 'formula'>, string> & { formula: string };
