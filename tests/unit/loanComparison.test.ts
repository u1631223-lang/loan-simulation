/**
 * ローン比較ユニットテスト
 */

import { describe, it, expect } from 'vitest';
import {
  compareLoanPlans,
  calculatePlanDifference,
  type LoanPlan,
} from '@/utils/loanComparison';

const createPlan = (overrides: Partial<LoanPlan>): LoanPlan => ({
  id: overrides.id ?? `plan-${Math.random().toString(36).slice(2, 9)}`,
  name: overrides.name ?? 'プラン',
  params: {
    principal: 30000000,
    interestRate: 1.0,
    years: 35,
    months: 0,
    repaymentType: 'equal-payment',
    ...overrides.params,
  },
  fees: {
    upfrontFee: 330000,
    upfrontFeeRate: 2.2,
    guaranteeFee: 0,
    otherFees: 0,
    ...overrides.fees,
  },
});

describe('compareLoanPlans', () => {
  it('2つのプランを比較して推奨プランを決定できる', () => {
    const planA = createPlan({
      id: 'plan-a',
      name: '低金利プラン',
      params: {
        interestRate: 0.9,
      },
    });

    const planB = createPlan({
      id: 'plan-b',
      name: '通常プラン',
      params: {
        interestRate: 1.2,
      },
    });

    const analysis = compareLoanPlans([planA, planB]);

    expect(analysis.comparison).toHaveLength(2);
    expect(analysis.recommendation.bestOverall).toBe(0);
    expect(analysis.comparison[0].plan.name).toBe('低金利プラン');
    expect(analysis.comparison[0].monthlyPayment).toBeLessThan(
      analysis.comparison[1].monthlyPayment
    );
  });

  it('5つのプランまで比較が可能である', () => {
    const plans = Array.from({ length: 5 }, (_, index) =>
      createPlan({
        id: `plan-${index}`,
        name: `プラン${index + 1}`,
        params: {
          interestRate: 0.9 + index * 0.1,
        },
      })
    );

    const analysis = compareLoanPlans(plans);
    expect(analysis.comparison).toHaveLength(5);
  });

  it('6つ以上のプランを比較しようとするとエラーになる', () => {
    const plans = Array.from({ length: 6 }, (_, index) =>
      createPlan({
        id: `plan-${index}`,
        name: `プラン${index + 1}`,
      })
    );

    expect(() => compareLoanPlans(plans)).toThrow(
      '比較できるローンプランは最大5つまでです'
    );
  });
});

describe('calculatePlanDifference', () => {
  it('ベストプランとの差額が正しく算出される', () => {
    const planA = createPlan({
      id: 'plan-a',
      name: 'プランA',
      params: { interestRate: 1.0 },
    });

    const planB = createPlan({
      id: 'plan-b',
      name: 'プランB',
      params: { interestRate: 1.2 },
    });

    const analysis = compareLoanPlans([planA, planB]);
    const best = analysis.comparison[0];
    const other = analysis.comparison[1];

    const diff = calculatePlanDifference(other, best);

    expect(diff.monthlyDiff).toBeGreaterThan(0);
    expect(diff.totalDiff).toBeGreaterThan(0);
    expect(diff.feesDiff).toBe(0);
  });
});

