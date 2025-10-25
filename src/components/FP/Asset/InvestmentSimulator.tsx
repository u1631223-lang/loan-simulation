/**
 * Phase 15: 積立投資シミュレーター
 *
 * 初期投資・月々積立・利回り・期間を入力して運用結果をシミュレーション
 */

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  calculateMonthlyInvestment,
  calculateLumpSumInvestment,
} from '@/utils/assetCalculator';
import type { YearlyData } from '@/types/investment';

export const InvestmentSimulator = () => {
  const [initialInvestment, setInitialInvestment] = useState(0); // 初期投資額（万円）
  const [monthlyAmount, setMonthlyAmount] = useState(30000); // 月々積立額（円）
  const [annualReturn, setAnnualReturn] = useState(7); // 想定利回り（%）
  const [years, setYears] = useState(30); // 運用期間（年）

  const [result, setResult] = useState<{
    totalInvestment: number;
    finalAmount: number;
    totalReturn: number;
    yearlyData: YearlyData[];
  } | null>(null);

  // 計算実行
  useEffect(() => {
    const initialInYen = initialInvestment * 10000;

    // 積立投資計算
    const monthlyResult = calculateMonthlyInvestment(monthlyAmount, annualReturn, years);

    // 初期投資がある場合は一括投資計算も実施
    let finalAmount = monthlyResult.finalAmount;
    let totalInvestment = monthlyResult.totalInvestment + initialInYen;

    if (initialInYen > 0) {
      const lumpSumResult = calculateLumpSumInvestment(initialInYen, annualReturn, years);
      finalAmount += lumpSumResult.finalAmount;
    }

    // 年次データ統合（初期投資 + 積立投資）
    const yearlyData: YearlyData[] = monthlyResult.yearlyBreakdown.map((data, index) => {
      const principal = data.principal + initialInYen;
      let total = data.total;

      if (initialInYen > 0) {
        const lumpSumYearly = calculateLumpSumInvestment(initialInYen, annualReturn, index + 1);
        total += lumpSumYearly.finalAmount;
      }

      return {
        year: data.year,
        principal,
        total,
        profit: total - principal,
      };
    });

    setResult({
      totalInvestment,
      finalAmount,
      totalReturn: finalAmount - totalInvestment,
      yearlyData,
    });
  }, [initialInvestment, monthlyAmount, annualReturn, years]);

  const formatCurrency = (value: number) => {
    return `${Math.round(value / 10000).toLocaleString('ja-JP')}万円`;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">積立投資シミュレーター</h3>
        <p className="text-sm text-gray-600">
          初期投資額・月々の積立額・想定利回り・運用期間を設定して、将来の資産額をシミュレーションします
        </p>
      </div>

      {/* 入力フォーム */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 初期投資額 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            初期投資額（万円）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="10000"
              step="10"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Math.max(0, parseFloat(e.target.value) || 0))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setInitialInvestment(Math.max(0, initialInvestment - 100))}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ▼
            </button>
            <button
              onClick={() => setInitialInvestment(initialInvestment + 100)}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ▲
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            一括で投資する元本（例: 退職金、ボーナスなど）
          </div>
        </div>

        {/* 月々積立額 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            月々積立額（円）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="1000000"
              step="1000"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setMonthlyAmount(Math.max(0, monthlyAmount - 10000))}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ▼
            </button>
            <button
              onClick={() => setMonthlyAmount(monthlyAmount + 10000)}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ▲
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            毎月定期的に積み立てる金額（例: 30,000円）
          </div>
        </div>

        {/* 想定利回り */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            想定利回り（年利 %）
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10B981 0%, #10B981 ${(annualReturn / 15) * 100}%, #E5E7EB ${(annualReturn / 15) * 100}%, #E5E7EB 100%)`,
              }}
            />
            <span className="text-2xl font-bold text-green-600 min-w-[80px] text-right">
              {annualReturn.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ※ S&P500の長期平均: 約10.5%、保守的見積もり: 7%
          </div>
        </div>

        {/* 運用期間 */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            運用期間（年）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={years}
              onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setYears(Math.max(1, years - 1))}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ▼
            </button>
            <button
              onClick={() => setYears(Math.min(50, years + 1))}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ▲
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            運用する期間（例: 30年、40年）
          </div>
        </div>
      </div>

      {/* 結果サマリー */}
      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">総投資額（元本）</div>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(result.totalInvestment)}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">運用益</div>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(result.totalReturn)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">最終資産額</div>
              <div className="text-2xl font-bold text-purple-700">
                {formatCurrency(result.finalAmount)}
              </div>
            </div>
          </div>

          {/* グラフ */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">年次推移グラフ</h4>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={result.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{ value: '経過年数', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: '金額（万円）', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `${Math.round(value / 10000)}万`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `${label}年目`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="principal"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="元本"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="運用益"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  name="合計"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ヘルプテキスト */}
      <div className="bg-yellow-50 rounded-lg p-4 text-sm text-gray-700">
        <div className="font-semibold mb-2">シミュレーション活用のポイント</div>
        <ul className="list-disc list-inside space-y-1">
          <li>想定利回りは過去データに基づく参考値です。実際の運用成績を保証するものではありません</li>
          <li>長期投資ほど複利効果が大きくなります（20年以上推奨）</li>
          <li>税金（約20%）や手数料は考慮されていません</li>
          <li>定期的な積立投資（ドルコスト平均法）でリスクを分散できます</li>
        </ul>
      </div>
    </div>
  );
};
