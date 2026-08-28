import { describe, expect, it } from 'vitest';
import { calculate, CalculationError, formatMoney, minorToDecimal, parseMinor } from '../src/calculator';
import { emptyInput, type CalculationInput } from '../src/types';

const makeInput = (overrides: Partial<CalculationInput> = {}): CalculationInput => ({
  ...emptyInput(), netAmount: '1000.00', taxAmount: '190.00', issueDate: '2026-08-01',
  discountDate: '2026-08-11', dueDate: '2026-08-31', ...overrides
});

describe('early-payment calculation', () => {
  it('discounts the whole invoice exactly', () => {
    const result = calculate(makeInput({ method: 'gross', discountPercent: '2' }));
    expect(result.invoiceMinor).toBe(119000n);
    expect(result.discountMinor).toBe(2380n);
    expect(result.earlyPayMinor).toBe(116620n);
  });

  it('keeps tax fixed for a net-only discount', () => {
    const result = calculate(makeInput({ method: 'net-tax-fixed', discountPercent: '2' }));
    expect(result.netDiscountMinor).toBe(2000n);
    expect(result.taxReductionMinor).toBe(0n);
    expect(result.earlyPayMinor).toBe(117000n);
  });

  it('rounds net and proportional tax separately', () => {
    const result = calculate(makeInput({ method: 'net-proportional', netAmount: '12.51', taxAmount: '2.37', discountPercent: '2' }));
    expect(result.netDiscountMinor).toBe(25n);
    expect(result.taxReductionMinor).toBe(5n);
    expect(result.discountMinor).toBe(30n);
  });

  it('supports 0.05 cash rounding', () => {
    const result = calculate(makeInput({ currency: 'CHF', netAmount: '100.00', taxAmount: '0.00', discountPercent: '2.03', rounding: 'cash-005' }));
    expect(result.discountMinor).toBe(205n);
    expect(result.earlyPayMinor).toBe(9795n);
  });

  it('uses the configured currency precision', () => {
    expect(parseMinor('12.345', 3)).toBe(12345n);
    expect(() => parseMinor('12.34', 0, 'Amount')).toThrow('at most 0 decimal places');
    expect(formatMoney(12345n, 'BHD')).toContain('12.345');
  });

  it('rejects invalid rates and date order', () => {
    expect(() => calculate(makeInput({ discountPercent: '100' }))).toThrow(CalculationError);
    expect(() => calculate(makeInput({ discountDate: '2026-07-31' }))).toThrow('cannot be before the issue date');
    expect(() => calculate(makeInput({ dueDate: '2026-08-10' }))).toThrow('cannot be before the discount deadline');
  });

  it('keeps integer precision for large invoices', () => {
    const result = calculate(makeInput({ netAmount: '999999999999.99', taxAmount: '0.01', discountPercent: '1.125' }));
    expect(result.discountMinor).toBe(1125000000000n);
    expect(result.invoiceMinor - result.discountMinor).toBe(result.earlyPayMinor);
    expect(formatMoney(result.invoiceMinor, 'EUR')).toContain('1,000,000,000,000.00');
    expect(minorToDecimal(result.earlyPayMinor, 2)).toBe('988750000000.00');
  });
});
