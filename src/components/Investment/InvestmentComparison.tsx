/**
 * InvestmentComparison コンポーネント
 * 3パターンの投資シミュレーションを並列比較
 * Tier 2以上の登録ユーザー限定機能
 */

import React, { useState } from 'react';
import type { InvestmentParams, InvestmentResult } from '@/types';
import {
  calculateCompoundInterest,
  formatInvestmentAmount,
} from '@/utils/investmentCalculator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

interface Pattern {
  monthly: number;
  initial: number;
}

const InvestmentComparison: React.FC = () => {
  // 共通設定
  const [annualReturn, setAnnualReturn] = useState(7.0);
  const [returnInputValue, setReturnInputValue] = useState('7.0');
  const [years, setYears] = useState(40);
  const [yearsInputValue, setYearsInputValue] = useState('40');

  // パターンA
  const [patternA, setPatternA] = useState<Pattern>({ monthly: 3, initial: 0 });
  const [patternAMonthlyInput, setPatternAMonthlyInput] = useState('3.0');
  const [patternAInitialInput, setPatternAInitialInput] = useState('0');

  // パターンB
  const [patternB, setPatternB] = useState<Pattern>({ monthly: 3, initial: 0 });
  const [patternBMonthlyInput, setPatternBMonthlyInput] = useState('3.0');
  const [patternBInitialInput, setPatternBInitialInput] = useState('0');

  // パターンC
  const [patternC, setPatternC] = useState<Pattern>({ monthly: 3, initial: 0 });
  const [patternCMonthlyInput, setPatternCMonthlyInput] = useState('3.0');
  const [patternCInitialInput, setPatternCInitialInput] = useState('0');

  const [results, setResults] = useState<{
    a: InvestmentResult | null;
    b: InvestmentResult | null;
    c: InvestmentResult | null;
  }>({ a: null, b: null, c: null });

  const [error, setError] = useState<string | null>(null);

  // 共通設定ハンドラ
  const handleReturnChange = (value: string) => {
    setReturnInputValue(value);
    if (value === '' || value === '.') {
      setAnnualReturn(0);
      return;
    }
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setAnnualReturn(clamp(parsed, 0, 20));
    }
  };

  const handleReturnBlur = () => {
    setReturnInputValue(annualReturn.toFixed(1));
  };

  const handleYearsChange = (value: string) => {
    setYearsInputValue(value);
    if (value === '') {
      setYears(1);
      return;
    }
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      setYears(clamp(parsed, 1, 50));
    }
  };

  const handleYearsBlur = () => {
    setYearsInputValue(years.toString());
  };

  // パターンA ハンドラ
  const handlePatternAMonthlyChange = (value: string) => {
    setPatternAMonthlyInput(value);
    if (value === '' || value === '.') {
      setPatternA(prev => ({ ...prev, monthly: 0 }));
      return;
    }
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setPatternA(prev => ({ ...prev, monthly: clamp(parsed, 0, 100) }));
    }
  };

  const handlePatternAMonthlyBlur = () => {
    setPatternAMonthlyInput(patternA.monthly === 0 ? '0' : patternA.monthly.toFixed(1));
  };

  const handlePatternAInitialChange = (value: string) => {
    setPatternAInitialInput(value);
    if (value === '' || value === '.') {
      setPatternA(prev => ({ ...prev, initial: 0 }));
      return;
    }
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setPatternA(prev => ({ ...prev, initial: clamp(parsed, 0, 10_000) }));
    }
  };

  const handlePatternAInitialBlur = () => {
    setPatternAInitialInput(patternA.initial.toString());
  };

  // パターンB ハンドラ
  const handlePatternBMonthlyChange = (value: string) => {
    setPatternBMonthlyInput(value);
    if (value === '' || value === '.') {
      setPatternB(prev => ({ ...prev, monthly: 0 }));
      return;
    }
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setPatternB(prev => ({ ...prev, monthly: clamp(parsed, 0, 100) }));
    }
  };

  const handlePatternBMonthlyBlur = () => {
    setPatternBMonthlyInput(patternB.monthly === 0 ? '0' : patternB.monthly.toFixed(1));
  };

  const handlePatternBInitialChange = (value: string) => {
    setPatternBInitialInput(value);
    if (value === '' || value === '.') {
      setPatternB(prev => ({ ...prev, initial: 0 }));
      return;
    }
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setPatternB(prev => ({ ...prev, initial: clamp(parsed, 0, 10_000) }));
    }
  };

  const handlePatternBInitialBlur = () => {
    setPatternBInitialInput(patternB.initial.toString());
  };

  // パターンC ハンドラ
  const handlePatternCMonthlyChange = (value: string) => {
    setPatternCMonthlyInput(value);
    if (value === '' || value === '.') {
      setPatternC(prev => ({ ...prev, monthly: 0 }));
      return;
    }
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setPatternC(prev => ({ ...prev, monthly: clamp(parsed, 0, 100) }));
    }
  };

  const handlePatternCMonthlyBlur = () => {
    setPatternCMonthlyInput(patternC.monthly === 0 ? '0' : patternC.monthly.toFixed(1));
  };

  const handlePatternCInitialChange = (value: string) => {
    setPatternCInitialInput(value);
    if (value === '' || value === '.') {
      setPatternC(prev => ({ ...prev, initial: 0 }));
      return;
    }
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      setPatternC(prev => ({ ...prev, initial: clamp(parsed, 0, 10_000) }));
    }
  };

  const handlePatternCInitialBlur = () => {
    setPatternCInitialInput(patternC.initial.toString());
  };

  const handleCalculate = () => {
    // バリデーション
    if (!Number.isFinite(annualReturn) || annualReturn < 0 || annualReturn > 20) {
      setError('想定利回りは0%〜20%の範囲で入力してください');
      return;
    }
    if (!Number.isFinite(years) || years < 1) {
      setError('積立期間は1年以上で入力してください');
      return;
    }

    setError(null);

    // 各パターンを計算
    const paramsA: InvestmentParams = {
      monthlyAmount: Math.round(patternA.monthly * 10_000),
      annualReturn,
      years: Math.round(years),
      initialInvestment: Math.round(patternA.initial * 10_000),
    };

    const paramsB: InvestmentParams = {
      monthlyAmount: Math.round(patternB.monthly * 10_000),
      annualReturn,
      years: Math.round(years),
      initialInvestment: Math.round(patternB.initial * 10_000),
    };

    const paramsC: InvestmentParams = {
      monthlyAmount: Math.round(patternC.monthly * 10_000),
      annualReturn,
      years: Math.round(years),
      initialInvestment: Math.round(patternC.initial * 10_000),
    };

    setResults({
      a: calculateCompoundInterest(paramsA),
      b: calculateCompoundInterest(paramsB),
      c: calculateCompoundInterest(paramsC),
    });
  };

  // グラフ用データ生成
  const chartData = React.useMemo(() => {
    if (!results.a || !results.b || !results.c) return [];

    const data = [];
    const maxLength = Math.max(
      results.a.yearlyData.length,
      results.b.yearlyData.length,
      results.c.yearlyData.length
    );

    for (let i = 0; i < maxLength; i++) {
      data.push({
        year: i + 1,
        patternA: results.a.yearlyData[i]?.total || 0,
        patternB: results.b.yearlyData[i]?.total || 0,
        patternC: results.c.yearlyData[i]?.total || 0,
      });
    }

    return data;
  }, [results]);

  const inputClass = 'flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div className="space-y-6">
      {/* 共通設定 */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">共通設定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              想定利回り（年利）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={returnInputValue}
                onChange={(e) => handleReturnChange(e.target.value)}
                onBlur={handleReturnBlur}
                className={inputClass}
                placeholder="7.0"
              />
              <span className="text-gray-600 text-sm">%</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              積立期間
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={yearsInputValue}
                onChange={(e) => handleYearsChange(e.target.value)}
                onBlur={handleYearsBlur}
                className={inputClass}
                placeholder="40"
              />
              <span className="text-gray-600 text-sm">年</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3パターン入力 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* パターンA */}
        <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
          <h4 className="mb-3 text-base font-semibold text-blue-900">パターンA</h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                月々積立額
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={patternAMonthlyInput}
                  onChange={(e) => handlePatternAMonthlyChange(e.target.value)}
                  onBlur={handlePatternAMonthlyBlur}
                  className={inputClass}
                  placeholder="3.0"
                />
                <span className="text-xs text-gray-600">万円</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                初期投資額
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={patternAInitialInput}
                  onChange={(e) => handlePatternAInitialChange(e.target.value)}
                  onBlur={handlePatternAInitialBlur}
                  className={inputClass}
                  placeholder="0"
                />
                <span className="text-xs text-gray-600">万円</span>
              </div>
            </div>
          </div>
        </div>

        {/* パターンB */}
        <div className="rounded-lg bg-emerald-50 border-2 border-emerald-200 p-4">
          <h4 className="mb-3 text-base font-semibold text-emerald-900">パターンB</h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                月々積立額
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={patternBMonthlyInput}
                  onChange={(e) => handlePatternBMonthlyChange(e.target.value)}
                  onBlur={handlePatternBMonthlyBlur}
                  className={inputClass}
                  placeholder="3.0"
                />
                <span className="text-xs text-gray-600">万円</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                初期投資額
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={patternBInitialInput}
                  onChange={(e) => handlePatternBInitialChange(e.target.value)}
                  onBlur={handlePatternBInitialBlur}
                  className={inputClass}
                  placeholder="0"
                />
                <span className="text-xs text-gray-600">万円</span>
              </div>
            </div>
          </div>
        </div>

        {/* パターンC */}
        <div className="rounded-lg bg-amber-50 border-2 border-amber-200 p-4">
          <h4 className="mb-3 text-base font-semibold text-amber-900">パターンC</h4>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                月々積立額
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={patternCMonthlyInput}
                  onChange={(e) => handlePatternCMonthlyChange(e.target.value)}
                  onBlur={handlePatternCMonthlyBlur}
                  className={inputClass}
                  placeholder="3.0"
                />
                <span className="text-xs text-gray-600">万円</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                初期投資額
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={patternCInitialInput}
                  onChange={(e) => handlePatternCInitialChange(e.target.value)}
                  onBlur={handlePatternCInitialBlur}
                  className={inputClass}
                  placeholder="0"
                />
                <span className="text-xs text-gray-600">万円</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 計算ボタン */}
      <button
        type="button"
        onClick={handleCalculate}
        className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white shadow hover:bg-emerald-600"
      >
        3パターン一括シミュレーション
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 結果表示 */}
      {results.a && results.b && results.c && (
        <div className="space-y-6">
          {/* サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4 text-center">
              <p className="text-sm text-blue-700 font-medium mb-1">パターンA</p>
              <p className="text-xs text-gray-600 mb-2">
                月々{patternA.monthly.toFixed(1)}万円 + 初期{patternA.initial}万円
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {formatInvestmentAmount(results.a.total)}
              </p>
              <p className="text-xs text-gray-600 mt-1">最終資産額</p>
            </div>

            <div className="rounded-lg bg-emerald-50 border-2 border-emerald-200 p-4 text-center">
              <p className="text-sm text-emerald-700 font-medium mb-1">パターンB</p>
              <p className="text-xs text-gray-600 mb-2">
                月々{patternB.monthly.toFixed(1)}万円 + 初期{patternB.initial}万円
              </p>
              <p className="text-2xl font-bold text-emerald-900">
                {formatInvestmentAmount(results.b.total)}
              </p>
              <p className="text-xs text-gray-600 mt-1">最終資産額</p>
            </div>

            <div className="rounded-lg bg-amber-50 border-2 border-amber-200 p-4 text-center">
              <p className="text-sm text-amber-700 font-medium mb-1">パターンC</p>
              <p className="text-xs text-gray-600 mb-2">
                月々{patternC.monthly.toFixed(1)}万円 + 初期{patternC.initial}万円
              </p>
              <p className="text-2xl font-bold text-amber-900">
                {formatInvestmentAmount(results.c.total)}
              </p>
              <p className="text-xs text-gray-600 mt-1">最終資産額</p>
            </div>
          </div>

          {/* グラフ比較 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">資産推移比較</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{ value: '年数', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: '資産額（万円）', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `${Math.round(value / 10000)}万`}
                />
                <Tooltip
                  formatter={(value: number) => `${Math.round(value / 10000).toLocaleString()}万円`}
                  labelFormatter={(label) => `${label}年目`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="patternA"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="パターンA"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="patternB"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="パターンB"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="patternC"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="パターンC"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentComparison;
