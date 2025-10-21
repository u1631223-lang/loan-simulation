import { describe, it, expect } from 'vitest';
import {
  calculateCompoundInterest,
  generateYearlyData,
  formatInvestmentAmount,
} from '../../src/utils/investmentCalculator';

describe('investmentCalculator', () => {
  describe('calculateCompoundInterest', () => {
    it('複利計算の基本ケースを計算できること', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 30_000,
        annualReturn: 5,
        years: 20,
      });

      expect(result.principal).toBe(7_200_000);
      expect(result.total).toBeCloseTo(12_331_977, -4);
      expect(result.profit).toBeCloseTo(5_131_977, -4);
      expect(result.yearlyData).toHaveLength(20);
    });

    it('金利0%の場合は元本のみとなること', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 25_000,
        annualReturn: 0,
        years: 10,
      });

      expect(result.principal).toBe(3_000_000);
      expect(result.total).toBe(3_000_000);
      expect(result.profit).toBe(0);
    });

    it('初期投資額を考慮できること', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 40_000,
        annualReturn: 4,
        years: 15,
        initialInvestment: 1_000_000,
      });

      expect(result.principal).toBe(8_200_000);
      expect(result.total).toBeGreaterThan(10_000_000);
      expect(result.profit).toBeGreaterThan(1_700_000);
    });
  });

  describe('generateYearlyData', () => {
    it('年数分のデータを生成すること', () => {
      const data = generateYearlyData({
        monthlyAmount: 30_000,
        annualReturn: 5,
        years: 20,
      });

      expect(data).toHaveLength(20);
      expect(data[0].year).toBe(1);
      expect(data[data.length - 1].year).toBe(20);
    });

    it('年次の資産が単調増加すること', () => {
      const data = generateYearlyData({
        monthlyAmount: 30_000,
        annualReturn: 5,
        years: 20,
      });

      for (let i = 1; i < data.length; i += 1) {
        expect(data[i].total).toBeGreaterThanOrEqual(data[i - 1].total);
        expect(data[i].profit).toBeGreaterThanOrEqual(data[i - 1].profit);
      }
    });
  });

  describe('formatInvestmentAmount', () => {
    it('円を万円単位でフォーマットできること', () => {
      expect(formatInvestmentAmount(7_200_000)).toBe('720万円');
      expect(formatInvestmentAmount(12_331_977)).toBe('1,233万円');
    });

    it('不正な値は0万円として扱うこと', () => {
      expect(formatInvestmentAmount(Number.NaN)).toBe('0万円');
    });
  });
});
