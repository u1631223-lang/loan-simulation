# NISA複利計算ツール - 実装ガイド

このドキュメントは、NISA複利計算ツールを実装する際の具体的な手順を示します。

---

## 📋 事前準備

### 必要な知識
- React Hooks（useState, useEffect, useCallback）
- TypeScript（型定義、インターフェース）
- Tailwind CSS（レスポンシブデザイン）
- recharts（グラフライブラリ）

### 参考ドキュメント
- `docs/NISA_FEATURE_SPEC.md` - 機能仕様
- `docs/TICKETS_NISA.md` - チケット詳細
- `docs/DEVELOPMENT_PLAN.md` - Phase 9.5セクション

---

## 🚀 実装手順

### Phase 1: 基盤構築（2時間）

#### TICKET-1001: rechartsインストール

```bash
npm install recharts
```

**確認**:
```bash
npm list recharts
# recharts@2.x.x が表示されればOK
```

---

#### TICKET-1002: 型定義作成

**ファイル**: `src/types/investment.ts`

```typescript
/**
 * 投資計算のパラメータ
 */
export interface InvestmentParams {
  /** 月々の積立額（円） */
  monthlyAmount: number;

  /** 想定利回り（年利%） */
  annualReturn: number;

  /** 積立期間（年） */
  years: number;

  /** 初期投資額（円、オプション） */
  initialInvestment?: number;
}

/**
 * 投資計算の結果
 */
export interface InvestmentResult {
  /** 総積立額（元本） */
  principal: number;

  /** 運用益 */
  profit: number;

  /** 最終資産額 */
  total: number;

  /** 年次データ（グラフ用） */
  yearlyData: YearlyData[];
}

/**
 * 年次データ（グラフ用）
 */
export interface YearlyData {
  /** 年数（1, 2, 3...） */
  year: number;

  /** 累計元本 */
  principal: number;

  /** 運用後資産額 */
  total: number;

  /** 運用益 */
  profit: number;
}
```

**確認**:
```bash
npm run type-check
```

---

#### TICKET-1003: 複利計算関数実装

**ファイル**: `src/utils/investmentCalculator.ts`

```typescript
import type { InvestmentParams, InvestmentResult, YearlyData } from '@/types/investment';

/**
 * 複利計算（毎月積立 + 初期投資）
 *
 * 数式:
 * FV = PMT × ((1 + r)^n - 1) / r
 * FV_total = FV_monthly + PV × (1 + r)^n
 *
 * Where:
 * - FV  = Future Value（将来価値）
 * - PMT = 月々の積立額
 * - r   = 月利（年利 / 12 / 100）
 * - n   = 総月数（年数 × 12）
 * - PV  = Present Value（初期投資額）
 *
 * @param params - 投資パラメータ
 * @returns 投資計算結果
 */
export function calculateCompoundInterest(
  params: InvestmentParams
): InvestmentResult {
  const { monthlyAmount, annualReturn, years, initialInvestment = 0 } = params;

  // 月利を計算
  const monthlyRate = annualReturn / 12 / 100;
  const totalMonths = years * 12;

  // 元本（積立総額 + 初期投資）
  const principal = monthlyAmount * totalMonths + initialInvestment;

  // 複利計算
  let monthlyFV = 0;
  if (monthlyRate === 0) {
    // 金利0%の場合は単純な累計
    monthlyFV = monthlyAmount * totalMonths;
  } else {
    // 毎月積立の将来価値
    const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
    monthlyFV = monthlyAmount * ((compoundFactor - 1) / monthlyRate);
  }

  // 初期投資の将来価値
  const initialFV = initialInvestment * Math.pow(1 + monthlyRate, totalMonths);

  // 最終資産額
  const total = Math.round(monthlyFV + initialFV);

  // 運用益
  const profit = total - principal;

  // 年次データ生成
  const yearlyData = generateYearlyData(params);

  return {
    principal,
    profit,
    total,
    yearlyData
  };
}

/**
 * 年ごとの資産推移データを生成
 *
 * @param params - 投資パラメータ
 * @returns 年次データの配列
 */
export function generateYearlyData(params: InvestmentParams): YearlyData[] {
  const { monthlyAmount, annualReturn, years, initialInvestment = 0 } = params;
  const monthlyRate = annualReturn / 12 / 100;

  const data: YearlyData[] = [];

  for (let year = 1; year <= years; year++) {
    const months = year * 12;

    // その年までの累計元本
    const yearlyPrincipal = monthlyAmount * months + initialInvestment;

    // その年までの運用後資産額
    let monthlyFV = 0;
    if (monthlyRate === 0) {
      monthlyFV = monthlyAmount * months;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, months);
      monthlyFV = monthlyAmount * ((compoundFactor - 1) / monthlyRate);
    }
    const initialFV = initialInvestment * Math.pow(1 + monthlyRate, months);
    const yearlyTotal = Math.round(monthlyFV + initialFV);

    data.push({
      year,
      principal: yearlyPrincipal,
      total: yearlyTotal,
      profit: yearlyTotal - yearlyPrincipal
    });
  }

  return data;
}

/**
 * 通貨フォーマット（日本円）
 */
export function formatCurrency(value: number): string {
  return `${Math.round(value / 10000).toLocaleString('ja-JP')}万円`;
}
```

**確認**:
手動計算で検証（月3万円、年利5%、20年）
- 元本: 720万円
- 最終資産: 約1,233万円

---

#### TICKET-1004: 年次データ生成関数実装

すでにTICKET-1003で実装済み（`generateYearlyData`）

---

#### TICKET-1005: 単体テスト作成

**ファイル**: `tests/unit/investmentCalculator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateCompoundInterest,
  generateYearlyData
} from '../../src/utils/investmentCalculator';

describe('複利計算ロジック', () => {
  describe('calculateCompoundInterest', () => {
    it('月3万円、年利5%、20年の場合', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 30000,
        annualReturn: 5.0,
        years: 20
      });

      expect(result.principal).toBe(7200000); // 3万 × 12 × 20
      expect(result.total).toBeCloseTo(12331977, -3); // 複利計算結果
      expect(result.profit).toBeCloseTo(5131977, -3);
      expect(result.yearlyData).toHaveLength(20);
    });

    it('年利0%の場合は元本のみ', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 30000,
        annualReturn: 0,
        years: 20
      });

      expect(result.principal).toBe(7200000);
      expect(result.total).toBe(7200000);
      expect(result.profit).toBe(0);
    });

    it('初期投資額がある場合', () => {
      const result = calculateCompoundInterest({
        monthlyAmount: 30000,
        annualReturn: 5.0,
        years: 20,
        initialInvestment: 1000000 // 100万円
      });

      expect(result.principal).toBe(8200000); // 720万 + 100万
      expect(result.total).toBeGreaterThan(13000000);
      expect(result.profit).toBeGreaterThan(5000000);
    });
  });

  describe('generateYearlyData', () => {
    it('20年分のデータが生成される', () => {
      const data = generateYearlyData({
        monthlyAmount: 30000,
        annualReturn: 5.0,
        years: 20
      });

      expect(data).toHaveLength(20);
      expect(data[0].year).toBe(1);
      expect(data[19].year).toBe(20);
    });

    it('年ごとに資産が増加する', () => {
      const data = generateYearlyData({
        monthlyAmount: 30000,
        annualReturn: 5.0,
        years: 20
      });

      // 各年で資産が単調増加していることを確認
      for (let i = 1; i < data.length; i++) {
        expect(data[i].total).toBeGreaterThan(data[i - 1].total);
      }
    });
  });
});
```

**確認**:
```bash
npm run test -- --run
# 全テストパス
```

---

### Phase 2: コンポーネント実装（2.5時間）

#### TICKET-1006 〜 1008: InvestmentCalculatorコンポーネント

**ファイル**: `src/components/Investment/InvestmentCalculator.tsx`

```typescript
import React, { useState } from 'react';
import type { InvestmentParams, InvestmentResult } from '@/types/investment';
import { calculateCompoundInterest, formatCurrency } from '@/utils/investmentCalculator';
import { InvestmentChart } from './InvestmentChart';

export function InvestmentCalculator() {
  // 入力パラメータ（万円単位で管理）
  const [monthlyAmount, setMonthlyAmount] = useState(3); // 3万円
  const [annualReturn, setAnnualReturn] = useState(5.0); // 5.0%
  const [years, setYears] = useState(20); // 20年
  const [initialInvestment, setInitialInvestment] = useState(0); // 0円
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 計算結果
  const [result, setResult] = useState<InvestmentResult | null>(null);

  // 計算実行
  const handleCalculate = () => {
    const params: InvestmentParams = {
      monthlyAmount: monthlyAmount * 10000, // 万円 → 円
      annualReturn,
      years,
      initialInvestment: initialInvestment * 10000 // 万円 → 円
    };

    const calculatedResult = calculateCompoundInterest(params);
    setResult(calculatedResult);
  };

  // 増減ボタンハンドラー
  const increment = (field: 'monthly' | 'return' | 'years' | 'initial') => {
    switch (field) {
      case 'monthly':
        setMonthlyAmount((prev) => Math.min(prev + 1, 100)); // 最大100万円
        break;
      case 'return':
        setAnnualReturn((prev) => Math.min(prev + 0.1, 20.0)); // 最大20%
        break;
      case 'years':
        setYears((prev) => Math.min(prev + 1, 50)); // 最大50年
        break;
      case 'initial':
        setInitialInvestment((prev) => Math.min(prev + 10, 10000)); // 最大1億円
        break;
    }
  };

  const decrement = (field: 'monthly' | 'return' | 'years' | 'initial') => {
    switch (field) {
      case 'monthly':
        setMonthlyAmount((prev) => Math.max(prev - 1, 0.1)); // 最小0.1万円
        break;
      case 'return':
        setAnnualReturn((prev) => Math.max(prev - 0.1, 0)); // 最小0%
        break;
      case 'years':
        setYears((prev) => Math.max(prev - 1, 1)); // 最小1年
        break;
      case 'initial':
        setInitialInvestment((prev) => Math.max(prev - 10, 0)); // 最小0円
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側: 入力フォーム */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              NISA複利シミュレーション
            </h2>

            <div className="space-y-4">
              {/* 月々の積立額 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月々の積立額
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">万円</span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => increment('monthly')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => decrement('monthly')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* 想定利回り */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  想定利回り（年利）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={annualReturn}
                    onChange={(e) => setAnnualReturn(Number(e.target.value))}
                    step="0.1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">%</span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => increment('return')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => decrement('return')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* 積立期間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  積立期間
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">年</span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => increment('years')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => decrement('years')}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* 詳細設定（折りたたみ） */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {showAdvanced ? '▼' : '▶'} 詳細設定（任意）
                </button>

                {showAdvanced && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      初期投資額
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={initialInvestment}
                        onChange={(e) => setInitialInvestment(Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-600">万円</span>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => increment('initial')}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => decrement('initial')}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 計算ボタン */}
              <button
                onClick={handleCalculate}
                className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
              >
                計算する
              </button>
            </div>
          </div>
        </div>

        {/* 右側: 結果表示 */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6">
              {/* サマリー */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  投資シミュレーション結果
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">総積立額（元本）</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(result.principal)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">運用益</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.profit)}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">最終資産額</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(result.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* グラフ */}
              <InvestmentChart yearlyData={result.yearlyData} />

              {/* 有料版誘導CTA */}
              <div className="p-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-2xl">💡</div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      繰上返済との詳細比較は有料版で
                    </h3>
                    <p className="mt-2 text-sm text-gray-700">
                      「この積立額を繰上返済に回した場合」との比較シミュレーションが可能です。
                      利息軽減効果とNISA運用益を並べて提示できるため、顧客への提案がより説得力を持ちます。
                    </p>
                    <button className="mt-4 text-amber-600 hover:text-amber-700 font-medium">
                      詳しく見る →
                    </button>
                  </div>
                </div>
              </div>

              {/* PDF出力ボタン（鍵マーク） */}
              <button
                disabled
                className="w-full px-6 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 hover:bg-gray-300"
                title="有料版でご利用いただけます"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                PDF出力（有料版機能）
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">
                左側のフォームに値を入力して「計算する」ボタンを押してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

#### TICKET-1009 〜 1010: InvestmentChartコンポーネント

**ファイル**: `src/components/Investment/InvestmentChart.tsx`

```typescript
import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { YearlyData } from '@/types/investment';

interface InvestmentChartProps {
  yearlyData: YearlyData[];
}

export function InvestmentChart({ yearlyData }: InvestmentChartProps) {
  // 万円単位に変換
  const lineData = yearlyData.map((d) => ({
    year: d.year,
    元本: Math.round(d.principal / 10000),
    資産額: Math.round(d.total / 10000)
  }));

  // 最終結果の内訳（棒グラフ用）
  const lastYear = yearlyData[yearlyData.length - 1];
  const barData = [
    {
      name: '内訳',
      元本: Math.round(lastYear.principal / 10000),
      運用益: Math.round(lastYear.profit / 10000)
    }
  ];

  return (
    <div className="space-y-6">
      {/* 折れ線グラフ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">資産推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: '年数', position: 'insideBottom', offset: -5 }}
            />
            <YAxis label={{ value: '金額（万円）', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value}万円`} />
            <Legend />
            <Line type="monotone" dataKey="元本" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="資産額" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 棒グラフ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">元本 vs 運用益</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}万円`} />
            <Legend />
            <Bar dataKey="元本" fill="#3B82F6" />
            <Bar dataKey="運用益" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

---

#### TICKET-1011: barrel export作成

**ファイル**: `src/components/Investment/index.ts`

```typescript
export { InvestmentCalculator } from './InvestmentCalculator';
export { InvestmentChart } from './InvestmentChart';
```

---

### Phase 3: ページ統合（30分）

#### TICKET-1012 〜 1014: Home.tsx修正

**ファイル**: `src/pages/Home.tsx`（修正箇所のみ）

```typescript
// 型定義を修正
type ViewMode = 'loan' | 'calculator' | 'investment';  // 'investment' を追加

// インポート追加
import { InvestmentCalculator } from '@/components/Investment';

// タブボタン追加（Header部分）
<div className="flex gap-2 mb-6">
  <button
    onClick={() => setViewMode('loan')}
    className={/* スタイル */}
  >
    住宅ローン
  </button>

  <button
    onClick={() => setViewMode('calculator')}
    className={/* スタイル */}
  >
    簡易電卓
  </button>

  <button
    onClick={() => setViewMode('investment')}
    className={/* スタイル */}
  >
    資産運用
  </button>
</div>

// 条件付きレンダリング追加
{viewMode === 'loan' && (
  // 既存のローン計算UI
)}

{viewMode === 'calculator' && (
  <SimpleCalculator />
)}

{viewMode === 'investment' && (
  <InvestmentCalculator />
)}
```

---

### Phase 4 & 5: 品質保証（1時間）

#### TICKET-1017: レスポンシブテスト

```bash
npm run dev
# ブラウザの開発者ツールでレスポンシブモード
# 確認: モバイル（375px）、タブレット（768px）、PC（1024px）
```

#### TICKET-1018: 品質チェック

```bash
# 型チェック
npm run type-check

# Lint
npm run lint

# テスト
npm run test -- --run

# ビルド
npm run build
```

---

## ✅ 完成チェックリスト

- [ ] rechartsがインストールされている
- [ ] 型定義が作成されている（`src/types/investment.ts`）
- [ ] 計算ロジックが実装されている（`src/utils/investmentCalculator.ts`）
- [ ] 単体テストが全てパスする
- [ ] InvestmentCalculatorコンポーネントが動作する
- [ ] InvestmentChartでグラフが表示される
- [ ] Home.tsxに資産運用タブが追加されている
- [ ] 有料版誘導UIが表示される
- [ ] モバイル・タブレット・PCで正しく表示される
- [ ] 型チェック・Lint・テスト・ビルドが全て成功する

---

## 🔧 トラブルシューティング

### recharts が動作しない
```bash
# キャッシュクリア
rm -rf node_modules package-lock.json
npm install
```

### TypeScriptエラーが出る
```bash
npm run type-check
# エラー箇所を確認して修正
```

### グラフが表示されない
- ResponsiveContainerのwidthとheightを確認
- データ形式が正しいか確認（yearlyData配列）
- ブラウザのコンソールでエラーを確認

---

**作成日**: 2025-10-21
**バージョン**: 1.0
