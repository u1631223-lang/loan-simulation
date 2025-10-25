/**
 * 必要保障額分析コンポーネント
 *
 * 保障額の内訳をグラフと数値で表示
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CoverageAnalysis, CurrentInsurance } from '@/types/insurance';

interface CoverageAnalysisProps {
  analysis: CoverageAnalysis;
  currentInsurance: CurrentInsurance[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function CoverageAnalysisComponent({ analysis, currentInsurance }: CoverageAnalysisProps) {
  // 支出内訳データ（円グラフ用）
  const expenseBreakdown = useMemo(() => {
    const totalLiving = analysis.yearlyExpenses.reduce((sum, y) => sum + y.livingExpense, 0);
    const totalHousing = analysis.yearlyExpenses.reduce((sum, y) => sum + y.housingCost, 0);
    const totalEducation = analysis.yearlyExpenses.reduce((sum, y) => sum + y.educationCost, 0);

    return [
      { name: '生活費', value: totalLiving },
      { name: '住居費', value: totalHousing },
      { name: '教育費', value: totalEducation },
    ];
  }, [analysis]);

  // 支出 vs 収入データ（棒グラフ用）
  const expenseVsIncome = [
    { name: '総支出', value: analysis.breakdown.totalExpenses },
    { name: '総収入', value: analysis.breakdown.totalIncome },
    { name: '既存資産', value: analysis.breakdown.existingAssets },
  ];

  // 年齢別推移データ（積み上げグラフ用）
  const yearlyData = useMemo(() => {
    return analysis.yearlyExpenses.slice(0, 30).map((expense, index) => {
      const income = analysis.yearlyIncome[index];
      return {
        year: `${index}年後`,
        生活費: expense.livingExpense / 10000,
        住居費: expense.housingCost / 10000,
        教育費: expense.educationCost / 10000,
        収入: income ? income.total / 10000 : 0,
      };
    });
  }, [analysis]);

  // 現在の保険との比較
  const totalCurrentCoverage = currentInsurance.reduce((sum, ins) => sum + ins.coverage, 0);
  const gap = analysis.requiredAmount - totalCurrentCoverage;
  const gapPercentage = totalCurrentCoverage > 0
    ? ((gap / analysis.requiredAmount) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-1">必要保障額</h3>
          <p className="text-2xl font-bold text-blue-600">
            {analysis.requiredAmount.toLocaleString()}円
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-1">現在の保障額</h3>
          <p className="text-2xl font-bold text-green-600">
            {totalCurrentCoverage.toLocaleString()}円
          </p>
        </div>

        <div
          className={`border rounded-lg p-4 ${
            gap > 0
              ? 'bg-red-50 border-red-200'
              : gap < -5000000
              ? 'bg-orange-50 border-orange-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <h3
            className={`text-sm font-medium mb-1 ${
              gap > 0
                ? 'text-red-900'
                : gap < -5000000
                ? 'text-orange-900'
                : 'text-green-900'
            }`}
          >
            過不足
          </h3>
          <p
            className={`text-2xl font-bold ${
              gap > 0
                ? 'text-red-600'
                : gap < -5000000
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {gap > 0 ? '+' : ''}
            {gap.toLocaleString()}円
          </p>
          <p className="text-xs text-gray-600 mt-1">
            ({gap > 0 ? '+' : ''}
            {gapPercentage}%)
          </p>
        </div>
      </div>

      {/* 内訳詳細 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">必要保障額の内訳</h3>
        <div className="space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">総支出</span>
            <span className="font-semibold text-gray-900">
              {analysis.breakdown.totalExpenses.toLocaleString()}円
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">総収入（見込み）</span>
            <span className="font-semibold text-green-600">
              -{analysis.breakdown.totalIncome.toLocaleString()}円
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">既存資産</span>
            <span className="font-semibold text-green-600">
              -{analysis.breakdown.existingAssets.toLocaleString()}円
            </span>
          </div>
          <div className="flex justify-between py-3 pt-4">
            <span className="text-lg font-bold text-gray-900">必要保障額</span>
            <span className="text-lg font-bold text-blue-600">
              {analysis.requiredAmount.toLocaleString()}円
            </span>
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 支出内訳円グラフ */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">支出の内訳</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseBreakdown.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()}円`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expenseBreakdown.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {item.value.toLocaleString()}円
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 支出 vs 収入棒グラフ */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">支出と収入の比較</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseVsIncome}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => `${(value / 10000000).toFixed(0)}千万`}
              />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()}円`}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 年齢別推移グラフ */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          年齢別の支出・収入推移（30年間）
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              label={{ value: '万円', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()}万円`}
            />
            <Legend />
            <Line type="monotone" dataKey="生活費" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="住居費" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="教育費" stroke="#F59E0B" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="収入"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-600 mt-4">
          ※ 点線は配偶者の収入と遺族年金の合計を示します
        </p>
      </div>

      {/* 現在の保険との比較 */}
      {currentInsurance.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">現在加入中の保険</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    保険名
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    種類
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    保障額
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    月額保険料
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentInsurance.map((ins) => (
                  <tr key={ins.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{ins.name || '未設定'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ins.type === 'life' && '生命保険'}
                      {ins.type === 'medical' && '医療保険'}
                      {ins.type === 'cancer' && 'がん保険'}
                      {ins.type === 'income' && '収入保障保険'}
                      {ins.type === 'other' && 'その他'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {ins.coverage.toLocaleString()}円
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {ins.monthlyPremium.toLocaleString()}円
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900">
                    合計
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                    {totalCurrentCoverage.toLocaleString()}円
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    {currentInsurance
                      .reduce((sum, ins) => sum + ins.monthlyPremium, 0)
                      .toLocaleString()}
                    円
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
