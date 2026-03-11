/**
 * 金利上昇比較ユーティリティのテスト
 */

import { describe, it, expect } from 'vitest';
import { calculateInterestComparisons } from '@/utils/interestRateComparison';
import type { InterestComparisonItem } from '@/utils/interestRateComparison';
import type { LoanParams, LoanResult } from '@/types';
import {
  calculateEqualPayment,
  calculateEqualPrincipal,
  generateEqualPaymentSchedule,
  calculateTotalFromSchedule,
  calculateTotalInterestFromSchedule,
  calculateWithBonus,
} from '@/utils/loanCalculator';

// ヘルパー: ベース結果を生成
const makeBaseResult = (params: LoanParams): LoanResult => {
  const totalMonths = params.years * 12 + params.months;
  if (params.bonusPayment?.enabled) {
    return calculateWithBonus(
      params.principal,
      params.interestRate,
      totalMonths,
      params.bonusPayment.amount,
      params.bonusPayment.months,
      params.repaymentType
    );
  }
  const monthlyPayment = calculateEqualPayment(params.principal, params.interestRate, totalMonths);
  const schedule = generateEqualPaymentSchedule(params.principal, params.interestRate, totalMonths);
  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(calculateTotalFromSchedule(schedule)),
    totalInterest: Math.round(calculateTotalInterestFromSchedule(schedule)),
    totalPrincipal: params.principal,
    schedule,
  };
};

describe('calculateInterestComparisons', () => {
  it('ボーナスなし元利均等で current / +0.25 / +0.50 が計算できる', () => {
    const params: LoanParams = {
      principal: 30000000,
      interestRate: 1.0,
      years: 35,
      months: 0,
      repaymentType: 'equal-payment',
    };
    const baseResult = makeBaseResult(params);
    const items = calculateInterestComparisons(params, baseResult);

    expect(items).toHaveLength(3);
    expect(items[0].label).toBe('current');
    expect(items[1].label).toBe('plus025');
    expect(items[2].label).toBe('plus050');

    // current の金利は入力値と同じ
    expect(items[0].interestRate).toBe(1.0);
    expect(items[1].interestRate).toBe(1.25);
    expect(items[2].interestRate).toBe(1.5);

    // 月々返済額が正の値
    items.forEach((item) => {
      expect(item.monthlyPayment).toBeGreaterThan(0);
      expect(item.totalPayment).toBeGreaterThan(0);
    });
  });

  it('ボーナスありでも比較計算できる', () => {
    const params: LoanParams = {
      principal: 50000000,
      interestRate: 0.8,
      years: 40,
      months: 0,
      repaymentType: 'equal-payment',
      bonusPayment: {
        enabled: true,
        amount: 15000000,
        months: [1, 8],
      },
    };
    const baseResult = makeBaseResult(params);
    const items = calculateInterestComparisons(params, baseResult);

    expect(items).toHaveLength(3);
    items.forEach((item) => {
      expect(item.monthlyPayment).toBeGreaterThan(0);
      expect(item.totalPayment).toBeGreaterThan(0);
    });
  });

  it('+0.25 の月々返済額が current より大きい', () => {
    const params: LoanParams = {
      principal: 30000000,
      interestRate: 1.0,
      years: 35,
      months: 0,
      repaymentType: 'equal-payment',
    };
    const baseResult = makeBaseResult(params);
    const items = calculateInterestComparisons(params, baseResult);

    expect(items[1].monthlyPayment).toBeGreaterThan(items[0].monthlyPayment);
    expect(items[1].monthlyDiff).toBeGreaterThan(0);
  });

  it('+0.50 の総返済額が +0.25 より大きい', () => {
    const params: LoanParams = {
      principal: 30000000,
      interestRate: 1.0,
      years: 35,
      months: 0,
      repaymentType: 'equal-payment',
    };
    const baseResult = makeBaseResult(params);
    const items = calculateInterestComparisons(params, baseResult);

    expect(items[2].totalPayment).toBeGreaterThan(items[1].totalPayment);
    expect(items[2].totalDiff).toBeGreaterThan(items[1].totalDiff);
  });

  it('小数第3位の金利でも壊れない', () => {
    const params: LoanParams = {
      principal: 30000000,
      interestRate: 0.625,
      years: 35,
      months: 0,
      repaymentType: 'equal-payment',
    };
    const baseResult = makeBaseResult(params);
    const items = calculateInterestComparisons(params, baseResult);

    expect(items[0].interestRate).toBe(0.625);
    expect(items[1].interestRate).toBeCloseTo(0.875, 3);
    expect(items[2].interestRate).toBeCloseTo(1.125, 3);

    items.forEach((item) => {
      expect(item.monthlyPayment).toBeGreaterThan(0);
      expect(Number.isFinite(item.monthlyPayment)).toBe(true);
    });
  });

  it('元金均等返済でも比較計算できる', () => {
    const params: LoanParams = {
      principal: 30000000,
      interestRate: 1.0,
      years: 35,
      months: 0,
      repaymentType: 'equal-principal',
    };
    const totalMonths = 35 * 12;
    const schedule = calculateEqualPrincipal(30000000, 1.0, totalMonths);
    const baseResult: LoanResult = {
      monthlyPayment: Math.round(schedule[0]?.payment || 0),
      totalPayment: Math.round(calculateTotalFromSchedule(schedule)),
      totalInterest: Math.round(calculateTotalInterestFromSchedule(schedule)),
      totalPrincipal: 30000000,
      schedule,
    };
    const items = calculateInterestComparisons(params, baseResult);

    expect(items).toHaveLength(3);
    expect(items[1].monthlyPayment).toBeGreaterThan(items[0].monthlyPayment);
  });

  it('current の差額は 0 である', () => {
    const params: LoanParams = {
      principal: 30000000,
      interestRate: 1.0,
      years: 35,
      months: 0,
      repaymentType: 'equal-payment',
    };
    const baseResult = makeBaseResult(params);
    const items = calculateInterestComparisons(params, baseResult);

    expect(items[0].monthlyDiff).toBe(0);
    expect(items[0].totalDiff).toBe(0);
  });

  it('+0.25 ボタンのロジック: 0.800 に対して +0.25 で 1.050', () => {
    // InterestRateQuickButtons の roundRate ロジック相当
    const roundRate = (rate: number): number => Math.round(rate * 1000) / 1000;
    expect(roundRate(0.800 + 0.25)).toBe(1.05);
    expect(roundRate(0.625 + 0.25)).toBe(0.875);
  });
});
