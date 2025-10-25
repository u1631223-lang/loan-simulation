/**
 * 保険計算ロジックのテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEducationCost,
  calculateSurvivorExpenses,
  calculateExpectedIncome,
  calculateSurvivorPension,
  calculateRequiredCoverage,
  performCoverageAnalysis,
  EDUCATION_COSTS,
} from '../../src/utils/insuranceCalculator';

describe('insuranceCalculator', () => {
  describe('calculateEducationCost', () => {
    it('公立小学校のみの場合', () => {
      const children = [
        {
          age: 6,
          educationPlan: {
            elementary: 'public' as const,
            juniorHigh: 'public' as const,
            highSchool: 'public' as const,
            university: 'none' as const,
          },
        },
      ];

      const result = calculateEducationCost(children);
      const expectedCost = EDUCATION_COSTS.elementary_public * 6 +
                          EDUCATION_COSTS.junior_high_public * 3 +
                          EDUCATION_COSTS.high_school_public * 3;

      expect(result.totalCost).toBe(expectedCost);
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    it('私立大学まで進学の場合', () => {
      const children = [
        {
          age: 6,
          educationPlan: {
            elementary: 'public' as const,
            juniorHigh: 'public' as const,
            highSchool: 'public' as const,
            university: 'private' as const,
          },
        },
      ];

      const result = calculateEducationCost(children);
      const expectedCost = EDUCATION_COSTS.elementary_public * 6 +
                          EDUCATION_COSTS.junior_high_public * 3 +
                          EDUCATION_COSTS.high_school_public * 3 +
                          EDUCATION_COSTS.university_private;

      expect(result.totalCost).toBe(expectedCost);
    });

    it('すべて私立の場合', () => {
      const children = [
        {
          age: 6,
          educationPlan: {
            elementary: 'private' as const,
            juniorHigh: 'private' as const,
            highSchool: 'private' as const,
            university: 'science' as const,
          },
        },
      ];

      const result = calculateEducationCost(children);
      const expectedCost = EDUCATION_COSTS.elementary_private * 6 +
                          EDUCATION_COSTS.junior_high_private * 3 +
                          EDUCATION_COSTS.high_school_private * 3 +
                          EDUCATION_COSTS.university_science;

      expect(result.totalCost).toBe(expectedCost);
    });

    it('複数の子供がいる場合', () => {
      const children = [
        {
          age: 6,
          educationPlan: {
            elementary: 'public' as const,
            juniorHigh: 'public' as const,
            highSchool: 'public' as const,
            university: 'national' as const,
          },
        },
        {
          age: 10,
          educationPlan: {
            elementary: 'public' as const,
            juniorHigh: 'public' as const,
            highSchool: 'public' as const,
            university: 'private' as const,
          },
        },
      ];

      const result = calculateEducationCost(children);
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    it('年齢が高い子供（一部教育段階完了）', () => {
      const children = [
        {
          age: 16,
          educationPlan: {
            elementary: 'public' as const,
            juniorHigh: 'public' as const,
            highSchool: 'public' as const,
            university: 'national' as const,
          },
        },
      ];

      const result = calculateEducationCost(children);
      // 高校2年分 + 大学4年分
      const expectedCost = EDUCATION_COSTS.high_school_public * 2 +
                          EDUCATION_COSTS.university_national;
      expect(result.totalCost).toBe(expectedCost);
    });
  });

  describe('calculateSurvivorExpenses', () => {
    it('基本的な生活費計算', () => {
      const params = {
        monthlyExpense: 300000,
        spouseAge: 40,
        children: [],
        housingCost: 100000,
      };

      const result = calculateSurvivorExpenses(params);
      expect(result.totalExpenses).toBeGreaterThan(0);
      expect(result.yearlyBreakdown.length).toBe(85 - 40); // 45年分
    });

    it('子供がいる場合の教育費含む', () => {
      const params = {
        monthlyExpense: 300000,
        spouseAge: 40,
        children: [
          {
            age: 6,
            educationPlan: {
              elementary: 'public' as const,
              juniorHigh: 'public' as const,
              highSchool: 'public' as const,
              university: 'national' as const,
            },
          },
        ],
        housingCost: 100000,
      };

      const result = calculateSurvivorExpenses(params);
      expect(result.totalExpenses).toBeGreaterThan(0);

      // 教育費が含まれていることを確認
      const hasEducationCost = result.yearlyBreakdown.some(y => y.educationCost > 0);
      expect(hasEducationCost).toBe(true);
    });

    it('年別内訳の検証', () => {
      const params = {
        monthlyExpense: 250000,
        spouseAge: 35,
        children: [],
        housingCost: 80000,
      };

      const result = calculateSurvivorExpenses(params);
      const firstYear = result.yearlyBreakdown[0];

      expect(firstYear.year).toBe(0);
      expect(firstYear.livingExpense).toBe(250000 * 12);
      expect(firstYear.housingCost).toBe(80000);
    });
  });

  describe('calculateExpectedIncome', () => {
    it('基本的な収入計算', () => {
      const params = {
        spouseIncome: 3000000,
        pensionAmount: 1000000,
        otherIncome: 500000,
        years: 30,
      };

      const result = calculateExpectedIncome(params);
      const expectedTotal = (3000000 + 1000000 + 500000) * 30;
      expect(result.totalIncome).toBe(expectedTotal);
      expect(result.yearlyBreakdown.length).toBe(30);
    });

    it('年金のみの場合', () => {
      const params = {
        spouseIncome: 0,
        pensionAmount: 1500000,
        otherIncome: 0,
        years: 20,
      };

      const result = calculateExpectedIncome(params);
      expect(result.totalIncome).toBe(1500000 * 20);
    });

    it('年別内訳の検証', () => {
      const params = {
        spouseIncome: 2500000,
        pensionAmount: 800000,
        otherIncome: 200000,
        years: 10,
      };

      const result = calculateExpectedIncome(params);
      const firstYear = result.yearlyBreakdown[0];

      expect(firstYear.spouseIncome).toBe(2500000);
      expect(firstYear.pensionAmount).toBe(800000);
      expect(firstYear.otherIncome).toBe(200000);
      expect(firstYear.total).toBe(3500000);
    });
  });

  describe('calculateSurvivorPension', () => {
    it('基本的な遺族年金計算', () => {
      const params = {
        averageSalary: 300000,
        insuredMonths: 300,
        children: 2,
      };

      const result = calculateSurvivorPension(params);
      expect(result.basicPension).toBeGreaterThan(0);
      expect(result.earningsRelated).toBeGreaterThan(0);
      expect(result.childAllowance).toBeGreaterThan(0);
      expect(result.totalAnnual).toBe(
        result.basicPension + result.earningsRelated + result.childAllowance
      );
    });

    it('子供がいない場合', () => {
      const params = {
        averageSalary: 350000,
        insuredMonths: 250,
        children: 0,
      };

      const result = calculateSurvivorPension(params);
      expect(result.childAllowance).toBe(0);
      expect(result.totalAnnual).toBe(result.basicPension + result.earningsRelated);
    });

    it('子供が3人以上の場合', () => {
      const params = {
        averageSalary: 400000,
        insuredMonths: 350,
        children: 4,
      };

      const result = calculateSurvivorPension(params);
      expect(result.childAllowance).toBeGreaterThan(0);
    });

    it('加入月数が長い場合', () => {
      const params = {
        averageSalary: 400000,
        insuredMonths: 480, // 40年
        children: 1,
      };

      const result = calculateSurvivorPension(params);
      expect(result.earningsRelated).toBeGreaterThan(0);
      expect(result.totalAnnual).toBeGreaterThan(1000000);
    });
  });

  describe('calculateRequiredCoverage', () => {
    it('不足がある場合', () => {
      const result = calculateRequiredCoverage(
        100000000, // 総支出1億円
        50000000,  // 総収入5000万円
        20000000   // 既存資産2000万円
      );

      expect(result.requiredAmount).toBe(30000000);
      expect(result.breakdown.gap).toBe(30000000);
    });

    it('資産が十分にある場合', () => {
      const result = calculateRequiredCoverage(
        50000000,  // 総支出5000万円
        30000000,  // 総収入3000万円
        25000000   // 既存資産2500万円
      );

      expect(result.requiredAmount).toBe(0); // 負の値にならない
      expect(result.breakdown.gap).toBeLessThan(0);
    });

    it('内訳の検証', () => {
      const result = calculateRequiredCoverage(80000000, 40000000, 15000000);

      expect(result.breakdown.totalExpenses).toBe(80000000);
      expect(result.breakdown.totalIncome).toBe(40000000);
      expect(result.breakdown.existingAssets).toBe(15000000);
      expect(result.breakdown.gap).toBe(25000000);
    });
  });

  describe('performCoverageAnalysis', () => {
    it('完全な分析の実行', () => {
      const params = {
        monthlyExpense: 300000,
        spouseAge: 40,
        children: [
          {
            age: 8,
            educationPlan: {
              elementary: 'public' as const,
              juniorHigh: 'public' as const,
              highSchool: 'public' as const,
              university: 'national' as const,
            },
          },
        ],
        housingCost: 100000,
        spouseIncome: 3000000,
        otherIncome: 0,
        savings: 5000000,
        securities: 3000000,
        realEstate: 0,
        averageSalary: 350000,
        insuredMonths: 300,
      };

      const result = performCoverageAnalysis(params);

      expect(result.requiredAmount).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.totalExpenses).toBeGreaterThan(0);
      expect(result.breakdown.totalIncome).toBeGreaterThan(0);
      expect(result.yearlyExpenses.length).toBeGreaterThan(0);
      expect(result.yearlyIncome.length).toBeGreaterThan(0);
    });

    it('複数の子供がいる場合の分析', () => {
      const params = {
        monthlyExpense: 400000,
        spouseAge: 35,
        children: [
          {
            age: 6,
            educationPlan: {
              elementary: 'public' as const,
              juniorHigh: 'public' as const,
              highSchool: 'public' as const,
              university: 'private' as const,
            },
          },
          {
            age: 10,
            educationPlan: {
              elementary: 'public' as const,
              juniorHigh: 'public' as const,
              highSchool: 'public' as const,
              university: 'national' as const,
            },
          },
        ],
        housingCost: 120000,
        spouseIncome: 2500000,
        otherIncome: 500000,
        savings: 8000000,
        securities: 2000000,
        realEstate: 0,
        averageSalary: 400000,
        insuredMonths: 250,
      };

      const result = performCoverageAnalysis(params);

      expect(result.requiredAmount).toBeGreaterThan(0);
      expect(result.breakdown.totalExpenses).toBeGreaterThan(result.breakdown.totalIncome);
    });

    it('配偶者の年齢による計算期間の違い', () => {
      const baseParams = {
        monthlyExpense: 250000,
        children: [],
        housingCost: 80000,
        spouseIncome: 3000000,
        otherIncome: 0,
        savings: 5000000,
        securities: 0,
        realEstate: 0,
        averageSalary: 300000,
        insuredMonths: 300,
      };

      const result1 = performCoverageAnalysis({ ...baseParams, spouseAge: 30 });
      const result2 = performCoverageAnalysis({ ...baseParams, spouseAge: 50 });

      // 若い配偶者の方が計算期間が長いため、支出が多い
      expect(result1.breakdown.totalExpenses).toBeGreaterThan(result2.breakdown.totalExpenses);
    });
  });
});
