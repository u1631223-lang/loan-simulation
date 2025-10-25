/**
 * BudgetSummary - 家計収支サマリー表示コンポーネント
 *
 * 月次・年間収支、カテゴリトップ5、改善提案などを表示
 */

import React from 'react';
import type { IncomeItem } from '@/hooks/useIncomeItems';
import type { ExpenseItem } from '@/hooks/useExpenseItems';
import type {
  MonthlyBudgetSummary,
  AnnualBudget,
  CategorySummary,
  ExpenseStructure,
} from '@/utils/budgetAnalyzer';
import {
  calculateMonthlyBudget,
  calculateAnnualBudget,
  aggregateIncomeByCategory,
  aggregateExpenseByCategory,
  analyzeExpenseStructure,
  getTopItems,
  generateSuggestions,
} from '@/utils/budgetAnalyzer';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './BudgetForm';

interface BudgetSummaryProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ incomes, expenses }) => {
  // 各種分析データを計算
  const monthlySummary: MonthlyBudgetSummary = calculateMonthlyBudget(incomes, expenses);
  const annualBudget: AnnualBudget = calculateAnnualBudget(incomes, expenses);
  const incomeCategories: CategorySummary[] = aggregateIncomeByCategory(
    incomes,
    INCOME_CATEGORIES
  );
  const expenseCategories: CategorySummary[] = aggregateExpenseByCategory(
    expenses,
    EXPENSE_CATEGORIES
  );
  const expenseStructure: ExpenseStructure = analyzeExpenseStructure(expenses);

  // トップ5項目
  const topIncomes = getTopItems(incomes, 5);
  const topExpenses = getTopItems(expenses, 5);

  // 改善提案
  const suggestions = generateSuggestions(monthlySummary, expenseStructure);

  return (
    <div className="space-y-6">
      {/* 月次収支サマリー */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">月次収支サマリー</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">月間収入</div>
            <div className="text-2xl font-bold text-green-600">
              ¥{monthlySummary.totalIncome.toLocaleString('ja-JP')}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">月間支出</div>
            <div className="text-2xl font-bold text-red-600">
              ¥{monthlySummary.totalExpenses.toLocaleString('ja-JP')}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">収支差</div>
            <div
              className={`text-2xl font-bold ${
                monthlySummary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {monthlySummary.balance >= 0 ? '+' : ''}
              ¥{monthlySummary.balance.toLocaleString('ja-JP')}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-xs text-gray-600 mb-1">貯蓄率</div>
            <div
              className={`text-2xl font-bold ${
                monthlySummary.savingsRate >= 20
                  ? 'text-green-600'
                  : monthlySummary.savingsRate >= 10
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {monthlySummary.savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* 年間推計 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">年間推計</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-l-4 border-green-500 pl-4">
            <div className="text-sm text-gray-600 mb-1">年間収入</div>
            <div className="text-xl font-bold text-gray-800">
              ¥{annualBudget.annualIncome.toLocaleString('ja-JP')}
            </div>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <div className="text-sm text-gray-600 mb-1">年間支出</div>
            <div className="text-xl font-bold text-gray-800">
              ¥{annualBudget.annualExpenses.toLocaleString('ja-JP')}
            </div>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="text-sm text-gray-600 mb-1">年間貯蓄見込み</div>
            <div
              className={`text-xl font-bold ${
                annualBudget.annualBalance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {annualBudget.annualBalance >= 0 ? '+' : ''}
              ¥{annualBudget.annualBalance.toLocaleString('ja-JP')}
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリ別トップ5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 収入トップ5 */}
        {topIncomes.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              収入トップ5（月次換算）
            </h3>
            <div className="space-y-3">
              {topIncomes.map((item) => {
                const monthlyAmount =
                  item.frequency === 'monthly'
                    ? item.amount
                    : item.frequency === 'annual'
                    ? item.amount / 12
                    : 0;
                const category = incomeCategories.find(
                  (c) => c.category === item.category
                );

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{category?.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {item.itemName}
                        </div>
                        <div className="text-xs text-gray-500">{category?.label}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        ¥{monthlyAmount.toLocaleString('ja-JP')}
                      </div>
                      <div className="text-xs text-gray-500">/ 月</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 支出トップ5 */}
        {topExpenses.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              支出トップ5（月次換算）
            </h3>
            <div className="space-y-3">
              {topExpenses.map((item) => {
                const monthlyAmount =
                  item.frequency === 'monthly'
                    ? item.amount
                    : item.frequency === 'annual'
                    ? item.amount / 12
                    : 0;
                const category = expenseCategories.find(
                  (c) => c.category === item.category
                );

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{category?.icon}</div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {item.itemName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {category?.label} {item.isFixed ? '(固定費)' : '(変動費)'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600">
                        ¥{monthlyAmount.toLocaleString('ja-JP')}
                      </div>
                      <div className="text-xs text-gray-500">/ 月</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 固定費・変動費比率 */}
      {expenseStructure.totalExpenses > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            固定費・変動費比率
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">固定費</div>
              <div className="text-2xl font-bold text-blue-600">
                {expenseStructure.fixedRatio.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ¥{expenseStructure.fixedExpenses.toLocaleString('ja-JP')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">変動費</div>
              <div className="text-2xl font-bold text-amber-600">
                {(100 - expenseStructure.fixedRatio).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ¥{expenseStructure.variableExpenses.toLocaleString('ja-JP')}
              </div>
            </div>
            <div className="text-center col-span-2">
              <div className="text-sm text-gray-600 mb-2">総支出</div>
              <div className="text-2xl font-bold text-gray-700">
                ¥{expenseStructure.totalExpenses.toLocaleString('ja-JP')}
              </div>
              <div className="text-xs text-gray-500 mt-1">月次</div>
            </div>
          </div>

          {/* 固定費率のバー */}
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-sm text-gray-600">固定費率:</div>
              <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${expenseStructure.fixedRatio}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {expenseStructure.fixedRatio.toFixed(1)}%
              </div>
            </div>
            <div className="text-xs text-gray-500">
              理想的な固定費率は50-60%と言われています
            </div>
          </div>
        </div>
      )}

      {/* 改善提案 */}
      {suggestions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💡 改善提案・アドバイス
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span className="text-sm text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* データがない場合 */}
      {incomes.length === 0 && expenses.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            データがありません
          </h3>
          <p className="text-gray-600">
            収入と支出項目を追加すると、家計収支のサマリーが表示されます
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;
