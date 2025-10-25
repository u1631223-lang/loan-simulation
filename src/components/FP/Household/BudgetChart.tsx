/**
 * BudgetChart - 家計収支グラフ表示コンポーネント
 *
 * 円グラフ、棒グラフ、積み上げ棒グラフでデータを可視化
 */

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
// Phase 13-14 実装時に有効化（現在は型エラーのため一時的に無効化）
// import type { CategorySummary, ExpenseStructure } from '@/utils/budgetAnalyzer';

// 一時的な型定義（Phase 13-14 実装時に削除）
type CategorySummary = { category: string; amount: number };
type ExpenseStructure = { fixedExpenses: number; variableExpenses: number };

// チャートカラーパレット
const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // green-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
  '#84CC16', // lime-500
];

interface BudgetChartProps {
  incomeCategories: CategorySummary[];
  expenseCategories: CategorySummary[];
  expenseStructure: ExpenseStructure;
  monthlyIncome: number;
  monthlyExpense: number;
}

const BudgetChart: React.FC<BudgetChartProps> = ({
  incomeCategories,
  expenseCategories,
  expenseStructure,
  monthlyIncome,
  monthlyExpense,
}) => {
  // 円グラフ用データ（支出カテゴリ別）
  const pieChartData = expenseCategories.map((category) => ({
    name: category.label,
    value: Math.round(category.monthlyAmount),
    icon: category.icon,
  }));

  // 収入 vs 支出比較データ
  const comparisonData = [
    {
      name: '月次収支',
      収入: Math.round(monthlyIncome),
      支出: Math.round(monthlyExpense),
    },
  ];

  // 固定費 vs 変動費データ
  const expenseStructureData = [
    {
      name: '支出構成',
      固定費: Math.round(expenseStructure.fixedExpenses),
      変動費: Math.round(expenseStructure.variableExpenses),
    },
  ];

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            ¥{payload[0].value.toLocaleString('ja-JP')}
          </p>
          {payload[0].payload.icon && (
            <p className="text-xs text-gray-500 mt-1">{payload[0].payload.icon}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // 円グラフのラベル表示
  const renderPieLabel = (_entry: any) => {
    const percent = ((_entry.value / monthlyExpense) * 100).toFixed(1);
    return `${_entry.name} ${percent}%`;
  };

  return (
    <div className="space-y-8">
      {/* 円グラフ: カテゴリ別支出割合 */}
      {expenseCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            カテゴリ別支出割合（月次）
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderPieLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* 凡例 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6">
            {expenseCategories.map((category, index) => (
              <div
                key={category.category}
                className="flex items-center space-x-2 text-sm"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700">
                  {category.icon} {category.label}
                </span>
                <span className="text-gray-500 text-xs">
                  ¥{category.monthlyAmount.toLocaleString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 棒グラフ: 収入 vs 支出比較 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          月次収入 vs 支出
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={comparisonData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `¥${value.toLocaleString('ja-JP')}`}
            />
            <Legend />
            <Bar dataKey="収入" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="支出" fill="#EF4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* サマリー */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">月次収入</div>
            <div className="text-lg font-bold text-green-600">
              ¥{monthlyIncome.toLocaleString('ja-JP')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">月次支出</div>
            <div className="text-lg font-bold text-red-600">
              ¥{monthlyExpense.toLocaleString('ja-JP')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">収支差</div>
            <div
              className={`text-lg font-bold ${
                monthlyIncome - monthlyExpense >= 0
                  ? 'text-blue-600'
                  : 'text-red-600'
              }`}
            >
              ¥{(monthlyIncome - monthlyExpense).toLocaleString('ja-JP')}
            </div>
          </div>
        </div>
      </div>

      {/* 積み上げ棒グラフ: 固定費 vs 変動費 */}
      {expenseStructure.totalExpenses > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            支出構成（固定費 vs 変動費）
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={expenseStructureData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `¥${value.toLocaleString('ja-JP')}`}
              />
              <Legend />
              <Bar dataKey="固定費" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="変動費" stackId="a" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* サマリー */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">固定費</div>
              <div className="text-lg font-bold text-blue-600">
                ¥{expenseStructure.fixedExpenses.toLocaleString('ja-JP')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {expenseStructure.fixedRatio.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">変動費</div>
              <div className="text-lg font-bold text-amber-600">
                ¥{expenseStructure.variableExpenses.toLocaleString('ja-JP')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(100 - expenseStructure.fixedRatio).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">総支出</div>
              <div className="text-lg font-bold text-gray-700">
                ¥{expenseStructure.totalExpenses.toLocaleString('ja-JP')}
              </div>
            </div>
          </div>

          {/* 固定費率の評価 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-700">
              {expenseStructure.fixedRatio > 70 ? (
                <span className="text-amber-600">
                  ⚠️ 固定費率が高めです（{expenseStructure.fixedRatio.toFixed(1)}%）。
                  保険や通信費などの見直しを検討しましょう。
                </span>
              ) : expenseStructure.fixedRatio < 50 ? (
                <span className="text-green-600">
                  ✅ 固定費率が適正です（{expenseStructure.fixedRatio.toFixed(1)}%）。
                  変動費のコントロールで柔軟な家計管理が可能です。
                </span>
              ) : (
                <span className="text-blue-600">
                  📊 固定費率はバランスが取れています（{expenseStructure.fixedRatio.toFixed(1)}%）。
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* データがない場合の表示 */}
      {incomeCategories.length === 0 && expenseCategories.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            データがありません
          </h3>
          <p className="text-gray-600">
            収入または支出項目を追加すると、グラフが表示されます
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetChart;
