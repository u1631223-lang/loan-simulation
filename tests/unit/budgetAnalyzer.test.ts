/**
 * budgetAnalyzer.test.ts - 家計収支分析ユーティリティのテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyAmount,
  calculateAnnualAmount,
  calculateMonthlyBudget,
  aggregateIncomeByCategory,
  aggregateExpenseByCategory,
  calculateAnnualBudget,
  analyzeExpenseStructure,
  getTopItems,
  generateSuggestions,
} from '@/utils/budgetAnalyzer';
import type { IncomeItem, IncomeCategory } from '@/hooks/useIncomeItems';
import type { ExpenseItem, ExpenseCategory } from '@/hooks/useExpenseItems';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/components/FP/Household/BudgetForm';

describe('budgetAnalyzer', () => {
  // テスト用データ
  const sampleIncomes: IncomeItem[] = [
    {
      id: '1',
      budgetId: 'test-budget',
      category: 'salary' as IncomeCategory,
      itemName: '基本給',
      amount: 300000,
      frequency: 'monthly',
    },
    {
      id: '2',
      budgetId: 'test-budget',
      category: 'bonus' as IncomeCategory,
      itemName: 'ボーナス',
      amount: 600000,
      frequency: 'annual',
    },
    {
      id: '3',
      budgetId: 'test-budget',
      category: 'side_income' as IncomeCategory,
      itemName: '副業',
      amount: 50000,
      frequency: 'monthly',
    },
  ];

  const sampleExpenses: ExpenseItem[] = [
    {
      id: '1',
      budgetId: 'test-budget',
      category: 'housing' as ExpenseCategory,
      itemName: '家賃',
      amount: 100000,
      frequency: 'monthly',
      isFixed: true,
    },
    {
      id: '2',
      budgetId: 'test-budget',
      category: 'food' as ExpenseCategory,
      itemName: '食費',
      amount: 60000,
      frequency: 'monthly',
      isFixed: false,
    },
    {
      id: '3',
      budgetId: 'test-budget',
      category: 'utilities' as ExpenseCategory,
      itemName: '光熱費',
      amount: 15000,
      frequency: 'monthly',
      isFixed: true,
    },
    {
      id: '4',
      budgetId: 'test-budget',
      category: 'insurance' as ExpenseCategory,
      itemName: '生命保険',
      amount: 120000,
      frequency: 'annual',
      isFixed: true,
    },
  ];

  describe('calculateMonthlyAmount', () => {
    it('月次の金額をそのまま返す', () => {
      expect(calculateMonthlyAmount(100000, 'monthly')).toBe(100000);
    });

    it('年次の金額を12で割る', () => {
      expect(calculateMonthlyAmount(1200000, 'annual')).toBe(100000);
    });

    it('単発の金額は0を返す（月次換算に含めない）', () => {
      expect(calculateMonthlyAmount(500000, 'one_time')).toBe(0);
    });
  });

  describe('calculateAnnualAmount', () => {
    it('月次の金額を12倍する', () => {
      expect(calculateAnnualAmount(100000, 'monthly')).toBe(1200000);
    });

    it('年次の金額をそのまま返す', () => {
      expect(calculateAnnualAmount(1200000, 'annual')).toBe(1200000);
    });

    it('単発の金額をそのまま返す', () => {
      expect(calculateAnnualAmount(500000, 'one_time')).toBe(500000);
    });
  });

  describe('calculateMonthlyBudget', () => {
    it('月次収入・支出・収支・貯蓄率を正しく計算', () => {
      const result = calculateMonthlyBudget(sampleIncomes, sampleExpenses);

      // 収入: 300000 + 600000/12 + 50000 = 400000
      expect(result.totalIncome).toBe(400000);

      // 支出: 100000 + 60000 + 15000 + 120000/12 = 185000
      expect(result.totalExpenses).toBe(185000);

      // 収支: 400000 - 185000 = 215000
      expect(result.balance).toBe(215000);

      // 貯蓄率: (215000 / 400000) * 100 = 53.75%
      expect(result.savingsRate).toBeCloseTo(53.75, 2);
    });

    it('収入がゼロの場合、貯蓄率は0%', () => {
      const result = calculateMonthlyBudget([], sampleExpenses);

      expect(result.totalIncome).toBe(0);
      expect(result.savingsRate).toBe(0);
    });

    it('支出がゼロの場合、貯蓄率は100%', () => {
      const result = calculateMonthlyBudget(sampleIncomes, []);

      expect(result.totalExpenses).toBe(0);
      expect(result.savingsRate).toBe(100);
    });
  });

  describe('aggregateIncomeByCategory', () => {
    it('カテゴリ別に収入を集計', () => {
      const result = aggregateIncomeByCategory(sampleIncomes, INCOME_CATEGORIES);

      expect(result).toHaveLength(3);

      // 給与カテゴリ
      const salaryCategory = result.find((c) => c.category === 'salary');
      expect(salaryCategory).toBeDefined();
      expect(salaryCategory?.monthlyAmount).toBe(300000);
      expect(salaryCategory?.totalAmount).toBe(3600000);
      expect(salaryCategory?.itemCount).toBe(1);

      // ボーナスカテゴリ
      const bonusCategory = result.find((c) => c.category === 'bonus');
      expect(bonusCategory).toBeDefined();
      expect(bonusCategory?.monthlyAmount).toBe(50000);
      expect(bonusCategory?.totalAmount).toBe(600000);

      // 副業カテゴリ
      const sideIncomeCategory = result.find((c) => c.category === 'side_income');
      expect(sideIncomeCategory).toBeDefined();
      expect(sideIncomeCategory?.monthlyAmount).toBe(50000);
    });
  });

  describe('aggregateExpenseByCategory', () => {
    it('カテゴリ別に支出を集計', () => {
      const result = aggregateExpenseByCategory(sampleExpenses, EXPENSE_CATEGORIES);

      expect(result).toHaveLength(4);

      // 住居費カテゴリ
      const housingCategory = result.find((c) => c.category === 'housing');
      expect(housingCategory).toBeDefined();
      expect(housingCategory?.monthlyAmount).toBe(100000);
      expect(housingCategory?.totalAmount).toBe(1200000);

      // 保険カテゴリ
      const insuranceCategory = result.find((c) => c.category === 'insurance');
      expect(insuranceCategory).toBeDefined();
      expect(insuranceCategory?.monthlyAmount).toBe(10000);
      expect(insuranceCategory?.totalAmount).toBe(120000);
    });
  });

  describe('calculateAnnualBudget', () => {
    it('年間収支を正しく計算', () => {
      const result = calculateAnnualBudget(sampleIncomes, sampleExpenses);

      // 年間収入: 300000*12 + 600000 + 50000*12 = 4800000
      expect(result.annualIncome).toBe(4800000);

      // 年間支出: 100000*12 + 60000*12 + 15000*12 + 120000 = 2220000
      expect(result.annualExpenses).toBe(2220000);

      // 年間収支: 4800000 - 2220000 = 2580000
      expect(result.annualBalance).toBe(2580000);

      // 月次サマリーも含まれている
      expect(result.monthlySummary.totalIncome).toBe(400000);
    });
  });

  describe('analyzeExpenseStructure', () => {
    it('固定費・変動費を正しく分析', () => {
      const result = analyzeExpenseStructure(sampleExpenses);

      // 固定費: 100000 + 15000 + 120000/12 = 125000
      expect(result.fixedExpenses).toBe(125000);

      // 変動費: 60000
      expect(result.variableExpenses).toBe(60000);

      // 総支出: 185000
      expect(result.totalExpenses).toBe(185000);

      // 固定費率: (125000 / 185000) * 100 = 67.57%
      expect(result.fixedRatio).toBeCloseTo(67.57, 2);
    });

    it('支出がゼロの場合、固定費率は0%', () => {
      const result = analyzeExpenseStructure([]);

      expect(result.fixedExpenses).toBe(0);
      expect(result.variableExpenses).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.fixedRatio).toBe(0);
    });
  });

  describe('getTopItems', () => {
    it('金額順でトップN項目を取得（デフォルト5件）', () => {
      const result = getTopItems(sampleIncomes);

      expect(result).toHaveLength(3); // 3件しかないので全件
      expect(result[0].itemName).toBe('基本給'); // 月次300000
      expect(result[1].itemName).toBe('ボーナス'); // 月次50000
      expect(result[2].itemName).toBe('副業'); // 月次50000
    });

    it('上位2件のみ取得', () => {
      const result = getTopItems(sampleExpenses, 2);

      expect(result).toHaveLength(2);
      expect(result[0].itemName).toBe('家賃'); // 月次100000
      expect(result[1].itemName).toBe('食費'); // 月次60000
    });
  });

  describe('generateSuggestions', () => {
    it('貯蓄率が低い場合（10%未満）、警告を出す', () => {
      const monthlySummary = {
        totalIncome: 300000,
        totalExpenses: 280000,
        balance: 20000,
        savingsRate: 6.67,
      };
      const expenseStructure = {
        fixedExpenses: 150000,
        variableExpenses: 130000,
        totalExpenses: 280000,
        fixedRatio: 53.57,
      };

      const suggestions = generateSuggestions(monthlySummary, expenseStructure);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.includes('貯蓄率が10%未満'))).toBe(true);
    });

    it('収支がマイナスの場合、警告を出す', () => {
      const monthlySummary = {
        totalIncome: 300000,
        totalExpenses: 350000,
        balance: -50000,
        savingsRate: -16.67,
      };
      const expenseStructure = {
        fixedExpenses: 200000,
        variableExpenses: 150000,
        totalExpenses: 350000,
        fixedRatio: 57.14,
      };

      const suggestions = generateSuggestions(monthlySummary, expenseStructure);

      expect(suggestions.some((s) => s.includes('収支がマイナス'))).toBe(true);
    });

    it('固定費率が高い場合（70%以上）、警告を出す', () => {
      const monthlySummary = {
        totalIncome: 300000,
        totalExpenses: 200000,
        balance: 100000,
        savingsRate: 33.33,
      };
      const expenseStructure = {
        fixedExpenses: 150000,
        variableExpenses: 50000,
        totalExpenses: 200000,
        fixedRatio: 75,
      };

      const suggestions = generateSuggestions(monthlySummary, expenseStructure);

      expect(suggestions.some((s) => s.includes('固定費の割合が高め'))).toBe(true);
    });

    it('貯蓄率が高い場合（30%以上）、ポジティブフィードバック', () => {
      const monthlySummary = {
        totalIncome: 400000,
        totalExpenses: 250000,
        balance: 150000,
        savingsRate: 37.5,
      };
      const expenseStructure = {
        fixedExpenses: 150000,
        variableExpenses: 100000,
        totalExpenses: 250000,
        fixedRatio: 60,
      };

      const suggestions = generateSuggestions(monthlySummary, expenseStructure);

      expect(suggestions.some((s) => s.includes('素晴らしい貯蓄率'))).toBe(true);
    });
  });
});
