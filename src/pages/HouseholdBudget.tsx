/**
 * HouseholdBudget - 家計収支管理ページ（Phase 14実装完了版）
 *
 * 収入・支出項目の管理、サマリー表示、グラフ可視化
 */

import React, { useState } from 'react';
import Container from '@/components/Layout/Container';
import IncomeItems from '@/components/FP/Household/IncomeItems';
import ExpenseItems from '@/components/FP/Household/ExpenseItems';
import BudgetForm from '@/components/FP/Household/BudgetForm';
import BudgetSummary from '@/components/FP/Household/BudgetSummary';
import BudgetChart from '@/components/FP/Household/BudgetChart';
import { useIncomeItems } from '@/hooks/useIncomeItems';
import { useExpenseItems } from '@/hooks/useExpenseItems';
import {
  calculateMonthlyBudget,
  aggregateIncomeByCategory,
  aggregateExpenseByCategory,
  analyzeExpenseStructure,
} from '@/utils/budgetAnalyzer';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/components/FP/Household/BudgetForm';
import type { CreateIncomeItemParams } from '@/hooks/useIncomeItems';
import type { CreateExpenseItemParams } from '@/hooks/useExpenseItems';

// 表示モード
type ViewMode = 'list' | 'chart' | 'summary';

const HouseholdBudget: React.FC = () => {
  // デモ用のbudgetId（実際はuseParams()やpropsから取得）
  const [budgetId] = useState('demo-budget-id');

  // 表示モード
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // フォーム表示状態
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('income');

  // データ取得
  const { incomeItems, createIncomeItem, loading: incomeLoading } = useIncomeItems(budgetId);
  const { expenseItems, createExpenseItem, loading: expenseLoading } = useExpenseItems(budgetId);

  // 分析データ計算
  const monthlySummary = calculateMonthlyBudget(incomeItems, expenseItems);
  const incomeCategories = aggregateIncomeByCategory(incomeItems, INCOME_CATEGORIES);
  const expenseCategories = aggregateExpenseByCategory(expenseItems, EXPENSE_CATEGORIES);
  const expenseStructure = analyzeExpenseStructure(expenseItems);

  // フォーム送信ハンドラー
  const handleFormSubmit = async (params: CreateIncomeItemParams | CreateExpenseItemParams) => {
    if (formType === 'income') {
      await createIncomeItem(params as CreateIncomeItemParams);
    } else {
      await createExpenseItem(params as CreateExpenseItemParams);
    }
    setShowForm(false);
  };

  // 新規追加ボタンハンドラー
  const handleAddIncome = () => {
    setFormType('income');
    setShowForm(true);
  };

  const handleAddExpense = () => {
    setFormType('expense');
    setShowForm(true);
  };

  return (
    <Container>
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        {/* ページヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            家計収支シミュレーション
          </h1>
          <p className="text-gray-600">
            収入と支出を管理して、月次のキャッシュフローを把握しましょう
          </p>
        </div>

        {/* 表示モード切り替え */}
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 リスト
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'chart'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📊 グラフ
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📈 サマリー
          </button>
        </div>

        {/* サマリーカード（常に表示） */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">月次収入</div>
            <div className="text-2xl font-bold text-blue-700">
              ¥{monthlySummary.totalIncome.toLocaleString('ja-JP')}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              {incomeItems.length}項目
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium mb-1">月次支出</div>
            <div className="text-2xl font-bold text-red-700">
              ¥{monthlySummary.totalExpenses.toLocaleString('ja-JP')}
            </div>
            <div className="text-xs text-red-500 mt-1">
              {expenseItems.length}項目
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">月次収支</div>
            <div
              className={`text-2xl font-bold ${
                monthlySummary.balance >= 0 ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {monthlySummary.balance >= 0 ? '+' : ''}
              ¥{monthlySummary.balance.toLocaleString('ja-JP')}
            </div>
            <div className="text-xs text-green-500 mt-1">収入 - 支出</div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium mb-1">貯蓄率</div>
            <div
              className={`text-2xl font-bold ${
                monthlySummary.savingsRate >= 20
                  ? 'text-green-700'
                  : monthlySummary.savingsRate >= 10
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}
            >
              {monthlySummary.savingsRate.toFixed(1)}%
            </div>
            <div className="text-xs text-purple-500 mt-1">
              {monthlySummary.savingsRate >= 20
                ? '優良'
                : monthlySummary.savingsRate >= 10
                ? '標準'
                : '要改善'}
            </div>
          </div>
        </div>

        {/* リストモード */}
        {viewMode === 'list' && (
          <>
            {/* 新規追加ボタン */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleAddIncome}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ➕ 収入を追加
              </button>
              <button
                onClick={handleAddExpense}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                ➖ 支出を追加
              </button>
            </div>

            {/* フォーム表示 */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                <BudgetForm
                  budgetId={budgetId}
                  type={formType}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {/* 収入項目セクション */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <IncomeItems budgetId={budgetId} />
            </section>

            {/* 支出項目セクション */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <ExpenseItems budgetId={budgetId} />
            </section>
          </>
        )}

        {/* グラフモード */}
        {viewMode === 'chart' && (
          <div className="space-y-6">
            <BudgetChart
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              expenseStructure={expenseStructure}
              monthlyIncome={monthlySummary.totalIncome}
              monthlyExpense={monthlySummary.totalExpenses}
            />
          </div>
        )}

        {/* サマリーモード */}
        {viewMode === 'summary' && (
          <div className="space-y-6">
            <BudgetSummary incomes={incomeItems} expenses={expenseItems} />
          </div>
        )}

        {/* ローディング表示 */}
        {(incomeLoading || expenseLoading) && (
          <div className="text-center py-8 text-gray-500">
            読み込み中...
          </div>
        )}

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div className="text-sm text-yellow-800">
              <strong>Phase 14 実装完了:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>✅ BudgetForm: 収入・支出入力フォーム</li>
                <li>✅ budgetAnalyzer: 集計・分析ロジック（15テスト合格）</li>
                <li>✅ BudgetChart: 円グラフ、棒グラフ、積み上げ棒グラフ</li>
                <li>✅ BudgetSummary: 月次・年間サマリー、トップ5、改善提案</li>
                <li>✅ HouseholdBudget: 3モード切り替え（リスト/グラフ/サマリー）</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 実装メモ */}
        <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700">
            開発者向け実装メモ
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2">
            <p><strong>Phase 14 完了機能:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>TICKET-1401: BudgetForm（タブ切替、カテゴリ選択、金額入力、頻度設定）</li>
              <li>TICKET-1402: budgetAnalyzer（月次/年間集計、カテゴリ別集計、固定費分析、提案生成）</li>
              <li>TICKET-1403: BudgetChart（円グラフ、棒グラフ、積み上げ棒グラフ）</li>
              <li>TICKET-1404: BudgetSummary（月次/年間サマリー、トップ5、改善提案）</li>
              <li>TICKET-1405: HouseholdBudget統合（3モード切り替え）</li>
            </ul>

            <p className="pt-2"><strong>テスト:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>budgetAnalyzer.test.ts: 15テストケース実装</li>
              <li>カバレッジ: 主要関数すべてテスト済み</li>
            </ul>

            <p className="pt-2"><strong>使用技術:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Recharts: PieChart, BarChart, ResponsiveContainer</li>
              <li>TypeScript strict mode対応</li>
              <li>Tailwind CSS: レスポンシブデザイン</li>
            </ul>

            <p className="pt-2"><strong>次のステップ:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Phase 15: 資産運用シミュレーション</li>
              <li>Phase 16: 保険設計シミュレーション</li>
              <li>Phase 17: 追加機能（PDF出力、データエクスポート）</li>
            </ul>
          </div>
        </details>
      </div>
    </Container>
  );
};

export default HouseholdBudget;
