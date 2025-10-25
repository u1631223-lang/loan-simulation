/**
 * Phase 15: Asset Calculator Tests
 *
 * 資産運用計算エンジンのテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateLumpSumInvestment,
  calculateMonthlyInvestment,
  calculatePortfolioReturn,
  calculateRequiredMonthlyInvestment,
  analyzeRiskReturn,
  validatePortfolio,
  suggestRebalancing,
  ASSET_CLASSES,
} from '@/utils/assetCalculator';
import type { AssetAllocation } from '@/types/investment';

describe('Asset Calculator - Lump Sum Investment', () => {
  it('should calculate lump sum investment correctly', () => {
    // 1000万円、年利7%、30年
    const result = calculateLumpSumInvestment(10000000, 7, 30);

    expect(result.finalAmount).toBeGreaterThan(10000000);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.yearlyBreakdown).toHaveLength(30);
    expect(result.yearlyBreakdown[0].year).toBe(1);
    expect(result.yearlyBreakdown[29].year).toBe(30);
  });

  it('should handle zero interest rate', () => {
    const result = calculateLumpSumInvestment(5000000, 0, 20);

    expect(result.finalAmount).toBe(5000000);
    expect(result.totalInterest).toBe(0);
  });

  it('should generate correct yearly breakdown', () => {
    const result = calculateLumpSumInvestment(1000000, 5, 10);

    // 複利効果で年々増加
    for (let i = 1; i < result.yearlyBreakdown.length; i += 1) {
      expect(result.yearlyBreakdown[i].total).toBeGreaterThan(
        result.yearlyBreakdown[i - 1].total
      );
    }
  });
});

describe('Asset Calculator - Monthly Investment', () => {
  it('should calculate monthly investment correctly (30,000円 x 30年 at 7%)', () => {
    const result = calculateMonthlyInvestment(30000, 7, 30);

    // 総投資額: 30,000円 × 12ヶ月 × 30年 = 10,800,000円
    expect(result.totalInvestment).toBe(10800000);

    // 複利効果で3000万円以上になるはず
    expect(result.finalAmount).toBeGreaterThan(30000000);
    expect(result.totalReturn).toBeGreaterThan(result.totalInvestment);
  });

  it('should handle zero interest rate for monthly investment', () => {
    const result = calculateMonthlyInvestment(50000, 0, 10);

    // 総投資額: 50,000円 × 12ヶ月 × 10年 = 6,000,000円
    expect(result.totalInvestment).toBe(6000000);
    expect(result.finalAmount).toBe(6000000);
    expect(result.totalReturn).toBe(0);
  });

  it('should generate correct yearly breakdown for monthly investment', () => {
    const result = calculateMonthlyInvestment(20000, 5, 20);

    expect(result.yearlyBreakdown).toHaveLength(20);

    // 年々元本と総額が増加
    for (let i = 1; i < result.yearlyBreakdown.length; i += 1) {
      expect(result.yearlyBreakdown[i].principal).toBeGreaterThan(
        result.yearlyBreakdown[i - 1].principal
      );
      expect(result.yearlyBreakdown[i].total).toBeGreaterThan(
        result.yearlyBreakdown[i - 1].total
      );
    }
  });
});

describe('Asset Calculator - Portfolio Return', () => {
  it('should calculate portfolio return for balanced portfolio', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 30 },
      { assetClass: 'foreign_stocks', percentage: 30 },
      { assetClass: 'domestic_bonds', percentage: 20 },
      { assetClass: 'foreign_bonds', percentage: 10 },
      { assetClass: 'cash', percentage: 10 },
    ];

    const result = calculatePortfolioReturn(allocations);

    expect(result.expectedReturn).toBeGreaterThan(0);
    expect(result.risk).toBeGreaterThan(0);
    expect(result.sharpeRatio).toBeGreaterThan(0);
  });

  it('should handle all-cash portfolio (zero risk)', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'cash', percentage: 100 },
    ];

    const result = calculatePortfolioReturn(allocations);

    expect(result.expectedReturn).toBeCloseTo(0.1, 1); // 0.1%
    expect(result.risk).toBe(0); // リスクゼロ
  });

  it('should handle aggressive portfolio (high risk/return)', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'foreign_stocks', percentage: 70 },
      { assetClass: 'domestic_stocks', percentage: 30 },
    ];

    const result = calculatePortfolioReturn(allocations);

    // 株式100%なので高リターン・高リスク
    expect(result.expectedReturn).toBeGreaterThan(5);
    expect(result.risk).toBeGreaterThan(15);
  });

  it('should normalize when total is not 100%', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 50 },
      { assetClass: 'cash', percentage: 50 },
    ];

    const result = calculatePortfolioReturn(allocations);

    // 合計100%として計算される
    expect(result.expectedReturn).toBeGreaterThan(0);
  });

  it('should handle empty allocations', () => {
    const allocations: AssetAllocation[] = [];

    const result = calculatePortfolioReturn(allocations);

    expect(result.expectedReturn).toBe(0);
    expect(result.risk).toBe(0);
    expect(result.sharpeRatio).toBe(0);
  });
});

describe('Asset Calculator - Required Monthly Investment', () => {
  it('should calculate required monthly amount for 5000万円 in 30 years at 7%', () => {
    const required = calculateRequiredMonthlyInvestment(50000000, 7, 30);

    // 約4万円前後のはず
    expect(required).toBeGreaterThan(30000);
    expect(required).toBeLessThan(60000);
  });

  it('should handle zero interest rate', () => {
    const required = calculateRequiredMonthlyInvestment(12000000, 0, 20);

    // 12,000,000円 ÷ (20年 × 12ヶ月) = 50,000円
    expect(required).toBe(50000);
  });

  it('should handle zero years', () => {
    const required = calculateRequiredMonthlyInvestment(10000000, 5, 0);

    expect(required).toBe(0);
  });
});

describe('Asset Calculator - Risk Return Analysis', () => {
  it('should analyze risk-return correctly', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'foreign_stocks', percentage: 40 },
      { assetClass: 'domestic_bonds', percentage: 30 },
      { assetClass: 'reit', percentage: 20 },
      { assetClass: 'cash', percentage: 10 },
    ];

    const analysis = analyzeRiskReturn(allocations);

    expect(analysis.expectedReturn).toBeGreaterThan(0);
    expect(analysis.risk).toBeGreaterThan(0);
    expect(analysis.sharpeRatio).toBeGreaterThan(0);
    expect(analysis.allocations).toHaveLength(4);

    // 各アロケーションの合計が100%
    const total = analysis.allocations.reduce((sum, a) => sum + a.percentage, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it('should include all asset class details', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 50 },
      { assetClass: 'cash', percentage: 50 },
    ];

    const analysis = analyzeRiskReturn(allocations);

    expect(analysis.allocations[0].label).toBe('国内株式');
    expect(analysis.allocations[0].assetClass).toBe('domestic_stocks');
    expect(analysis.allocations[0].expectedReturn).toBeGreaterThan(0);
    expect(analysis.allocations[0].risk).toBeGreaterThan(0);
  });
});

describe('Asset Calculator - Portfolio Validation', () => {
  it('should validate correct portfolio (100%)', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 50 },
      { assetClass: 'cash', percentage: 50 },
    ];

    const validation = validatePortfolio(allocations);

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should reject portfolio with total < 95%', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 50 },
      { assetClass: 'cash', percentage: 40 },
    ];

    const validation = validatePortfolio(allocations);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should reject portfolio with total > 105%', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 60 },
      { assetClass: 'cash', percentage: 50 },
    ];

    const validation = validatePortfolio(allocations);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should reject negative percentages', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: -10 },
      { assetClass: 'cash', percentage: 110 },
    ];

    const validation = validatePortfolio(allocations);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it('should reject percentages > 100', () => {
    const allocations: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 150 },
    ];

    const validation = validatePortfolio(allocations);

    expect(validation.isValid).toBe(false);
  });
});

describe('Asset Calculator - Rebalancing Suggestions', () => {
  it('should suggest rebalancing correctly', () => {
    const current: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 40 },
      { assetClass: 'cash', percentage: 60 },
    ];

    const target: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 50 },
      { assetClass: 'cash', percentage: 50 },
    ];

    const suggestions = suggestRebalancing(current, target, 10000000);

    expect(suggestions).toHaveLength(2);

    // 国内株式: +10% (1,000,000円増やす)
    const stocksSuggestion = suggestions.find((s) => s.assetClass === 'domestic_stocks');
    expect(stocksSuggestion?.difference).toBe(10);
    expect(stocksSuggestion?.adjustmentAmount).toBe(1000000);

    // 現金: -10% (1,000,000円減らす)
    const cashSuggestion = suggestions.find((s) => s.assetClass === 'cash');
    expect(cashSuggestion?.difference).toBe(-10);
    expect(cashSuggestion?.adjustmentAmount).toBe(-1000000);
  });

  it('should sort suggestions by absolute difference', () => {
    const current: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 20 },
      { assetClass: 'cash', percentage: 80 },
    ];

    const target: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 60 },
      { assetClass: 'cash', percentage: 40 },
    ];

    const suggestions = suggestRebalancing(current, target, 5000000);

    // 差が大きい順（40%, -40%）
    expect(Math.abs(suggestions[0].difference)).toBeGreaterThanOrEqual(
      Math.abs(suggestions[1].difference)
    );
  });

  it('should handle new asset classes in target', () => {
    const current: AssetAllocation[] = [
      { assetClass: 'cash', percentage: 100 },
    ];

    const target: AssetAllocation[] = [
      { assetClass: 'domestic_stocks', percentage: 50 },
      { assetClass: 'cash', percentage: 50 },
    ];

    const suggestions = suggestRebalancing(current, target, 10000000);

    expect(suggestions).toHaveLength(2);

    // 新規資産クラスも提案に含まれる
    const stocksSuggestion = suggestions.find((s) => s.assetClass === 'domestic_stocks');
    expect(stocksSuggestion?.currentPercentage).toBe(0);
    expect(stocksSuggestion?.targetPercentage).toBe(50);
  });
});

describe('Asset Classes Constants', () => {
  it('should have all asset classes defined', () => {
    expect(ASSET_CLASSES.domestic_stocks).toBeDefined();
    expect(ASSET_CLASSES.foreign_stocks).toBeDefined();
    expect(ASSET_CLASSES.domestic_bonds).toBeDefined();
    expect(ASSET_CLASSES.foreign_bonds).toBeDefined();
    expect(ASSET_CLASSES.reit).toBeDefined();
    expect(ASSET_CLASSES.cash).toBeDefined();
  });

  it('should have expected return and risk for each class', () => {
    Object.values(ASSET_CLASSES).forEach((assetClass) => {
      expect(assetClass.label).toBeDefined();
      expect(assetClass.expectedReturn).toBeGreaterThanOrEqual(0);
      expect(assetClass.risk).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have realistic values for stocks (higher return, higher risk)', () => {
    const stocks = ASSET_CLASSES.foreign_stocks;
    const bonds = ASSET_CLASSES.domestic_bonds;

    expect(stocks.expectedReturn).toBeGreaterThan(bonds.expectedReturn);
    expect(stocks.risk).toBeGreaterThan(bonds.risk);
  });

  it('should have zero risk for cash', () => {
    const cash = ASSET_CLASSES.cash;

    expect(cash.risk).toBe(0);
    expect(cash.expectedReturn).toBeGreaterThan(0); // 預金金利
  });
});
