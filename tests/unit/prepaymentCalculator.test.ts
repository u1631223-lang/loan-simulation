/**
 * 繰上返済計算のユニットテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePrepaymentEffect,
  calculateMultiplePrepayments,
  analyzeBestPrepaymentTiming,
} from '@/utils/prepaymentCalculator';
import { roundFinancial } from '@/utils/loanCalculator';
import type { LoanParams } from '@/types';

describe('繰上返済シミュレーション', () => {
  const baseLoanParams: LoanParams = {
    principal: 30000000, // 3000万円
    interestRate: 1.5,
    years: 35,
    months: 0,
    repaymentType: 'equal-payment',
  };

  describe('calculatePrepaymentEffect - 期間短縮型', () => {
    it('5年後に500万円繰上返済した場合の効果を計算', () => {
      const result = calculatePrepaymentEffect({
        loanParams: baseLoanParams,
        prepaymentAmount: 5000000, // 500万円
        prepaymentMonth: 60, // 5年後
        prepaymentType: 'period',
      });

      expect(result.original.endMonth).toBe(420); // 35年
      expect(result.afterPrepayment.endMonth).toBeLessThan(420);
      expect(result.benefit.interestSaved).toBeGreaterThan(0);
      expect(result.benefit.totalSaved).toBeGreaterThan(0);
      expect(result.afterPrepayment.periodReduction).toBeGreaterThan(0);

      const scheduleTotal = result.schedule.reduce((sum, entry) => sum + entry.payment, 0);
      const expectedTotalPayment = roundFinancial(scheduleTotal + 5000000);
      expect(result.afterPrepayment.totalPayment).toBe(expectedTotalPayment);
      expect(result.benefit.totalSaved).toBe(
        roundFinancial(result.original.totalPayment - expectedTotalPayment)
      );
    });

    it('1年後に300万円繰上返済した場合の効果を計算', () => {
      const result = calculatePrepaymentEffect({
        loanParams: baseLoanParams,
        prepaymentAmount: 3000000, // 300万円
        prepaymentMonth: 12, // 1年後
        prepaymentType: 'period',
      });

      expect(result.original.endMonth).toBe(420);
      expect(result.afterPrepayment.endMonth).toBeLessThan(420);
      expect(result.benefit.interestSaved).toBeGreaterThan(0);
    });

    it('10年後に1000万円繰上返済した場合の効果を計算', () => {
      const result = calculatePrepaymentEffect({
        loanParams: baseLoanParams,
        prepaymentAmount: 10000000, // 1000万円
        prepaymentMonth: 120, // 10年後
        prepaymentType: 'period',
      });

      expect(result.original.endMonth).toBe(420);
      expect(result.afterPrepayment.endMonth).toBeLessThan(420);
      expect(result.benefit.interestSaved).toBeGreaterThan(0);
      expect(result.afterPrepayment.periodReduction).toBeGreaterThan(0);
    });
  });

  describe('calculatePrepaymentEffect - 返済額軽減型', () => {
    it('5年後に500万円繰上返済した場合の効果を計算', () => {
      const result = calculatePrepaymentEffect({
        loanParams: baseLoanParams,
        prepaymentAmount: 5000000, // 500万円
        prepaymentMonth: 60, // 5年後
        prepaymentType: 'payment',
      });

      expect(result.original.endMonth).toBe(420);
      expect(result.afterPrepayment.endMonth).toBe(420); // 期間は変わらない
      expect(result.afterPrepayment.monthlySavings).toBeGreaterThan(0);
      expect(result.benefit.interestSaved).toBeGreaterThan(0);
      const scheduleTotal = result.schedule.reduce((sum, entry) => sum + entry.payment, 0);
      const expectedTotalPayment = roundFinancial(scheduleTotal + 5000000);
      expect(result.afterPrepayment.totalPayment).toBe(expectedTotalPayment);
      expect(result.benefit.totalSaved).toBe(
        roundFinancial(result.original.totalPayment - expectedTotalPayment)
      );
    });

    it('月々返済額が実際に減少することを確認', () => {
      const result = calculatePrepaymentEffect({
        loanParams: baseLoanParams,
        prepaymentAmount: 3000000,
        prepaymentMonth: 24,
        prepaymentType: 'payment',
      });

      expect(result.afterPrepayment.monthlyPayment).toBeLessThan(result.original.monthlyPayment);
      expect(result.afterPrepayment.monthlySavings).toBeGreaterThan(0);
    });
  });

  describe('calculatePrepaymentEffect - エラーケース', () => {
    it('繰上返済額が残高を超える場合はエラー', () => {
      expect(() => {
        calculatePrepaymentEffect({
          loanParams: baseLoanParams,
          prepaymentAmount: 50000000, // 借入額より多い
          prepaymentMonth: 60,
          prepaymentType: 'period',
        });
      }).toThrow();
    });

    it('繰上返済月が範囲外の場合はエラー', () => {
      expect(() => {
        calculatePrepaymentEffect({
          loanParams: baseLoanParams,
          prepaymentAmount: 1000000,
          prepaymentMonth: 500, // 35年=420ヶ月を超える
          prepaymentType: 'period',
        });
      }).toThrow();
    });

    it('繰上返済額が0円以下の場合はエラー', () => {
      expect(() => {
        calculatePrepaymentEffect({
          loanParams: baseLoanParams,
          prepaymentAmount: 0,
          prepaymentMonth: 60,
          prepaymentType: 'period',
        });
      }).toThrow();
    });
  });

  describe('calculateMultiplePrepayments', () => {
    it('複数回の繰上返済効果を計算', () => {
      const result = calculateMultiplePrepayments({
        loanParams: baseLoanParams,
        prepayments: [
          { month: 12, amount: 1000, type: 'period' }, // 1年後に1000円
          { month: 60, amount: 800, type: 'period' }, // 5年後に800円
          { month: 120, amount: 400, type: 'period' }, // 10年後に400円
        ],
      });

      expect(result.original.endMonth).toBe(420);
      expect(result.afterPrepayments.endMonth).toBeLessThan(420);
      expect(result.totalBenefit.totalPrepaymentAmount).toBe(2200); // 合計2200円
      expect(result.totalBenefit.interestSaved).toBeGreaterThan(0);

      const scheduleTotal = result.schedule.reduce((sum, entry) => sum + entry.payment, 0);
      const expectedTotalPayment = roundFinancial(scheduleTotal + 2200);
      expect(result.afterPrepayments.totalPayment).toBe(expectedTotalPayment);
      expect(result.totalBenefit.totalSaved).toBe(
        roundFinancial(result.original.totalPayment - expectedTotalPayment)
      );
    });

    it('月順にソートされていない繰上返済を正しく処理', () => {
      const result = calculateMultiplePrepayments({
        loanParams: baseLoanParams,
        prepayments: [
          { month: 36, amount: 1, type: 'period' }, // 順序が逆
          { month: 12, amount: 1, type: 'period' },
          { month: 24, amount: 1, type: 'period' },
        ],
      });

      expect(result.prepayments[0].month).toBe(12); // ソートされている
      expect(result.prepayments[1].month).toBe(24);
      expect(result.prepayments[2].month).toBe(36);
    });
  });

  describe('analyzeBestPrepaymentTiming', () => {
    it('最適な繰上返済タイミングを分析', () => {
      const result = analyzeBestPrepaymentTiming({
        loanParams: baseLoanParams,
        availableFunds: 5000000, // 500万円
      });

      expect(result.recommendedMonth).toBeGreaterThan(0);
      expect(result.expectedSavings).toBeGreaterThan(0);
      expect(result.reasoning).toBeTruthy();
      expect(result.monthlyComparison.length).toBeGreaterThan(0);
    });

    it('目標年数を指定して分析', () => {
      const result = analyzeBestPrepaymentTiming({
        loanParams: baseLoanParams,
        availableFunds: 3000000,
        targetYear: 5, // 5年以内
      });

      expect(result.recommendedMonth).toBeLessThanOrEqual(60); // 5年=60ヶ月以内
      expect(result.expectedSavings).toBeGreaterThan(0);
    });
  });

  describe('元金均等返済での繰上返済', () => {
    const equalPrincipalParams: LoanParams = {
      ...baseLoanParams,
      repaymentType: 'equal-principal',
    };

    it('元金均等返済でも期間短縮型が動作する', () => {
      const result = calculatePrepaymentEffect({
        loanParams: equalPrincipalParams,
        prepaymentAmount: 5000000,
        prepaymentMonth: 60,
        prepaymentType: 'period',
      });

      expect(result.afterPrepayment.endMonth).toBeLessThan(result.original.endMonth);
      expect(result.benefit.interestSaved).toBeGreaterThan(0);
    });

    it('元金均等返済でも返済額軽減型が動作する', () => {
      const result = calculatePrepaymentEffect({
        loanParams: equalPrincipalParams,
        prepaymentAmount: 5000000,
        prepaymentMonth: 60,
        prepaymentType: 'payment',
      });

      expect(result.afterPrepayment.endMonth).toBe(result.original.endMonth);
      expect(result.afterPrepayment.monthlySavings).toBeGreaterThan(0);
    });
  });

  describe('金利0%での繰上返済', () => {
    const zeroRateParams: LoanParams = {
      ...baseLoanParams,
      interestRate: 0,
    };

    it('金利0%でも期間短縮型が動作する', () => {
      const result = calculatePrepaymentEffect({
        loanParams: zeroRateParams,
        prepaymentAmount: 5000000,
        prepaymentMonth: 60,
        prepaymentType: 'period',
      });

      expect(result.afterPrepayment.endMonth).toBeLessThan(result.original.endMonth);
      expect(result.benefit.totalSaved).toBeGreaterThanOrEqual(0);
      expect(result.benefit.interestSaved).toBe(0); // 金利0%なので利息削減はゼロ
    });
  });
});
