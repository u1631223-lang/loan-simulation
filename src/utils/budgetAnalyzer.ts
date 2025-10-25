/**
 * budgetAnalyzer - 家計収支分析ユーティリティ
 *
 * 収入・支出の集計、分析ロジック
 */

import type { IncomeItem, IncomeCategory } from '@/hooks/useIncomeItems';
import type { ExpenseItem, ExpenseCategory } from '@/hooks/useExpenseItems';
import type { Frequency } from '@/hooks/useIncomeItems';

// 月次収支サマリー
export interface MonthlyBudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

// カテゴリ別集計
export interface CategorySummary {
  category: IncomeCategory | ExpenseCategory;
  label: string;
  icon: string;
  totalAmount: number;
  monthlyAmount: number;
  itemCount: number;
}

// 年間収支
export interface AnnualBudget {
  annualIncome: number;
  annualExpenses: number;
  annualBalance: number;
  monthlySummary: MonthlyBudgetSummary;
}

// 固定費・変動費分析
export interface ExpenseStructure {
  fixedExpenses: number;
  variableExpenses: number;
  fixedRatio: number;
  totalExpenses: number;
}

/**
 * 頻度に応じた月次金額を計算
 */
export const calculateMonthlyAmount = (amount: number, frequency: Frequency): number => {
  switch (frequency) {
    case 'monthly':
      return amount;
    case 'annual':
      return amount / 12;
    case 'one_time':
      return 0; // 単発は月次換算に含めない
    default:
      return 0;
  }
};

/**
 * 頻度に応じた年間金額を計算
 */
export const calculateAnnualAmount = (amount: number, frequency: Frequency): number => {
  switch (frequency) {
    case 'monthly':
      return amount * 12;
    case 'annual':
      return amount;
    case 'one_time':
      return amount;
    default:
      return 0;
  }
};

/**
 * 月次収支集計
 */
export const calculateMonthlyBudget = (
  incomes: IncomeItem[],
  expenses: ExpenseItem[]
): MonthlyBudgetSummary => {
  // 月次収入合計
  const totalIncome = incomes.reduce(
    (sum, item) => sum + calculateMonthlyAmount(item.amount, item.frequency),
    0
  );

  // 月次支出合計
  const totalExpenses = expenses.reduce(
    (sum, item) => sum + calculateMonthlyAmount(item.amount, item.frequency),
    0
  );

  // 収支差
  const balance = totalIncome - totalExpenses;

  // 貯蓄率（収入がゼロの場合は0%）
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
  };
};

/**
 * カテゴリ別集計（収入）
 */
export const aggregateIncomeByCategory = (
  incomes: IncomeItem[],
  categoryLabels: Record<IncomeCategory, { label: string; icon: string }>
): CategorySummary[] => {
  // カテゴリごとにグループ化
  const grouped = incomes.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<IncomeCategory, IncomeItem[]>
  );

  // カテゴリサマリーを生成
  return Object.entries(grouped).map(([category, items]) => {
    const cat = category as IncomeCategory;
    const monthlyAmount = items.reduce(
      (sum, item) => sum + calculateMonthlyAmount(item.amount, item.frequency),
      0
    );
    const totalAmount = items.reduce(
      (sum, item) => sum + calculateAnnualAmount(item.amount, item.frequency),
      0
    );

    return {
      category: cat,
      label: categoryLabels[cat].label,
      icon: categoryLabels[cat].icon,
      totalAmount,
      monthlyAmount,
      itemCount: items.length,
    };
  });
};

/**
 * カテゴリ別集計（支出）
 */
export const aggregateExpenseByCategory = (
  expenses: ExpenseItem[],
  categoryLabels: Record<ExpenseCategory, { label: string; icon: string }>
): CategorySummary[] => {
  // カテゴリごとにグループ化
  const grouped = expenses.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<ExpenseCategory, ExpenseItem[]>
  );

  // カテゴリサマリーを生成
  return Object.entries(grouped).map(([category, items]) => {
    const cat = category as ExpenseCategory;
    const monthlyAmount = items.reduce(
      (sum, item) => sum + calculateMonthlyAmount(item.amount, item.frequency),
      0
    );
    const totalAmount = items.reduce(
      (sum, item) => sum + calculateAnnualAmount(item.amount, item.frequency),
      0
    );

    return {
      category: cat,
      label: categoryLabels[cat].label,
      icon: categoryLabels[cat].icon,
      totalAmount,
      monthlyAmount,
      itemCount: items.length,
    };
  });
};

/**
 * 年間収支計算
 */
export const calculateAnnualBudget = (
  incomes: IncomeItem[],
  expenses: ExpenseItem[]
): AnnualBudget => {
  // 月次サマリー
  const monthlySummary = calculateMonthlyBudget(incomes, expenses);

  // 年間金額
  const annualIncome = incomes.reduce(
    (sum, item) => sum + calculateAnnualAmount(item.amount, item.frequency),
    0
  );

  const annualExpenses = expenses.reduce(
    (sum, item) => sum + calculateAnnualAmount(item.amount, item.frequency),
    0
  );

  const annualBalance = annualIncome - annualExpenses;

  return {
    annualIncome,
    annualExpenses,
    annualBalance,
    monthlySummary,
  };
};

/**
 * 固定費・変動費分析（支出のみ）
 */
export const analyzeExpenseStructure = (expenses: ExpenseItem[]): ExpenseStructure => {
  // 固定費合計（月次換算）
  const fixedExpenses = expenses
    .filter((item) => item.isFixed)
    .reduce((sum, item) => sum + calculateMonthlyAmount(item.amount, item.frequency), 0);

  // 変動費合計（月次換算）
  const variableExpenses = expenses
    .filter((item) => !item.isFixed)
    .reduce((sum, item) => sum + calculateMonthlyAmount(item.amount, item.frequency), 0);

  // 総支出
  const totalExpenses = fixedExpenses + variableExpenses;

  // 固定費率
  const fixedRatio = totalExpenses > 0 ? (fixedExpenses / totalExpenses) * 100 : 0;

  return {
    fixedExpenses,
    variableExpenses,
    fixedRatio,
    totalExpenses,
  };
};

/**
 * トップN項目を取得（金額順）
 */
export const getTopItems = <T extends IncomeItem | ExpenseItem>(
  items: T[],
  limit: number = 5
): T[] => {
  return [...items]
    .sort((a, b) => {
      const aMonthly = calculateMonthlyAmount(a.amount, a.frequency);
      const bMonthly = calculateMonthlyAmount(b.amount, b.frequency);
      return bMonthly - aMonthly;
    })
    .slice(0, limit);
};

/**
 * 改善提案を生成
 */
export const generateSuggestions = (
  monthlySummary: MonthlyBudgetSummary,
  expenseStructure: ExpenseStructure
): string[] => {
  const suggestions: string[] = [];

  // 貯蓄率が低い場合
  if (monthlySummary.savingsRate < 10) {
    suggestions.push(
      '貯蓄率が10%未満です。支出を見直して貯蓄を増やすことをおすすめします。'
    );
  } else if (monthlySummary.savingsRate < 20) {
    suggestions.push('貯蓄率が20%未満です。将来に備えてさらに貯蓄を増やしましょう。');
  }

  // 収支がマイナスの場合
  if (monthlySummary.balance < 0) {
    suggestions.push(
      '⚠️ 収支がマイナスです。支出を削減するか、収入を増やす必要があります。'
    );
  }

  // 固定費率が高い場合
  if (expenseStructure.fixedRatio > 70) {
    suggestions.push(
      '固定費の割合が高めです（70%以上）。保険や通信費などの見直しを検討しましょう。'
    );
  }

  // 貯蓄率が高い場合（ポジティブフィードバック）
  if (monthlySummary.savingsRate >= 30) {
    suggestions.push('✅ 素晴らしい貯蓄率です！この調子で資産形成を続けましょう。');
  }

  return suggestions;
};
