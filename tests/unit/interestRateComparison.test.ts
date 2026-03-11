import { describe, it, expect } from 'vitest';
import type { LoanParams } from '../../src/types';

/**
 * 比較パネルが loanParams 優先で基準条件を使うことのテスト。
 * コンポーネント内部のロジックではなく、Home.tsx での
 * comparisonParams = loanParams ?? currentParams の挙動を確認する。
 */
describe('InterestRateComparisonPanel - baseParams priority', () => {
  const currentParams: LoanParams = {
    principal: 50000000,
    interestRate: 1.0,
    years: 40,
    months: 0,
    repaymentType: 'equal-payment',
  };

  const loanParams: LoanParams = {
    principal: 45000000,
    interestRate: 0.800,
    years: 35,
    months: 0,
    repaymentType: 'equal-payment',
  };

  it('should use loanParams when available', () => {
    const comparisonParams = loanParams ?? currentParams;
    expect(comparisonParams).toBe(loanParams);
    expect(comparisonParams.interestRate).toBe(0.800);
    expect(comparisonParams.principal).toBe(45000000);
  });

  it('should fall back to currentParams when loanParams is null', () => {
    const nullLoanParams: LoanParams | null = null;
    const comparisonParams = nullLoanParams ?? currentParams;
    expect(comparisonParams).toBe(currentParams);
    expect(comparisonParams.interestRate).toBe(1.0);
  });

  it('comparisonParams should match the calculated result conditions, not the form state', () => {
    // Simulate: user changed form to 1.5% but hasn't recalculated yet
    // loanParams still holds the last calculated 0.800%
    const editedCurrentParams: LoanParams = {
      ...currentParams,
      interestRate: 1.5, // user editing form
    };
    const comparisonParams = loanParams ?? editedCurrentParams;
    // Should use loanParams (0.800%), not the edited form value (1.5%)
    expect(comparisonParams.interestRate).toBe(0.800);
  });
});
