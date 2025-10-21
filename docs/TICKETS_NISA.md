# NISA複利計算ツール - チケット詳細

## 📊 チケット概要

**Phase**: 9.5（無料版機能拡張）
**総チケット数**: 18
**総見積時間**: 約7.5時間
**優先度**: 🟡 High（無料版の魅力向上 + 有料版への導線強化）

---

## 🎫 Phase 1: 基盤構築（TICKET-1001 〜 1005）

### TICKET-1001: rechartsライブラリインストール
- **優先度**: 🔴 Critical
- **見積**: 5分
- **依存**: なし
- **担当**: 手動実行

**タスク**:
```bash
npm install recharts
```

**成果物**:
- `package.json` にrecharts追加
- `node_modules/recharts` インストール

**検証**:
```bash
npm list recharts
# recharts@2.x.x が表示されればOK
```

---

### TICKET-1002: 型定義作成
- **優先度**: 🔴 Critical
- **見積**: 15分
- **依存**: なし
- **担当**: メインエージェント

**タスク**:
- [x] `src/types/investment.ts` 作成
- [x] `InvestmentParams` インターフェース定義
- [x] `InvestmentResult` インターフェース定義
- [x] `YearlyData` インターフェース定義
- [x] JSDocコメント追加

**成果物**:
```typescript
// src/types/investment.ts
export interface InvestmentParams {
  monthlyAmount: number;
  annualReturn: number;
  years: number;
  initialInvestment?: number;
}

export interface InvestmentResult {
  principal: number;
  profit: number;
  total: number;
  yearlyData: YearlyData[];
}

export interface YearlyData {
  year: number;
  principal: number;
  total: number;
  profit: number;
}
```

**検証**:
```bash
npm run type-check
# エラーが出ないこと
```

---

### TICKET-1003: 複利計算関数実装
- **優先度**: 🔴 Critical
- **見積**: 30分
- **依存**: TICKET-1002
- **担当**: メインエージェント

**タスク**:
- [x] `src/utils/investmentCalculator.ts` 作成
- [x] `calculateCompoundInterest()` 関数実装
- [x] 複利計算式の実装（月次積立FV計算）
- [x] 初期投資額の複利計算
- [x] 金利0%のエッジケース対応
- [x] JSDocコメント + 数式を記載

**実装ポイント**:
```typescript
/**
 * 複利計算（毎月積立 + 初期投資）
 *
 * 数式:
 * FV = PMT × ((1 + r)^n - 1) / r
 * FV_total = FV_monthly + PV × (1 + r)^n
 */
export function calculateCompoundInterest(
  params: InvestmentParams
): InvestmentResult {
  // 実装
}
```

**検証**:
- 手動テスト: 月3万円、年利5%、20年
  - 元本: 720万円
  - 最終資産: 約1,233万円
  - 運用益: 約513万円

---

### TICKET-1004: 年次データ生成関数実装
- **優先度**: 🔴 Critical
- **見積**: 20分
- **依存**: TICKET-1002, TICKET-1003
- **担当**: メインエージェント

**タスク**:
- [x] `generateYearlyData()` 関数実装
- [x] 各年の累計元本を計算
- [x] 各年の運用後資産額を計算
- [x] 各年の運用益を計算
- [x] YearlyData配列を返却

**実装ポイント**:
```typescript
export function generateYearlyData(
  params: InvestmentParams
): YearlyData[] {
  const data: YearlyData[] = [];

  for (let year = 1; year <= params.years; year++) {
    // 各年の計算
    data.push({
      year,
      principal: /* 累計元本 */,
      total: /* 運用後資産額 */,
      profit: /* 運用益 */
    });
  }

  return data;
}
```

**検証**:
- 20年分のデータが生成されること
- 各年で資産が単調増加すること

---

### TICKET-1005: 単体テスト作成
- **優先度**: 🟡 High
- **見積**: 30分
- **依存**: TICKET-1003, TICKET-1004
- **担当**: メインエージェント

- [x] `tests/unit/investmentCalculator.test.ts` 作成
- [x] `calculateCompoundInterest()` のテスト
  - 通常ケース（月3万、年利5%、20年）
  - 金利0%のケース
  - 初期投資ありのケース
  - 極端な値のバリデーション
- [x] `generateYearlyData()` のテスト
  - データ件数確認
  - 単調増加確認

**テストケース例**:
```typescript
describe('複利計算ロジック', () => {
  it('月3万円、年利5%、20年の場合', () => {
    const result = calculateCompoundInterest({
      monthlyAmount: 30000,
      annualReturn: 5.0,
      years: 20
    });

    expect(result.principal).toBe(7200000);
    expect(result.total).toBeCloseTo(12331977, -3);
    expect(result.profit).toBeCloseTo(5131977, -3);
  });

  it('年利0%の場合', () => {
    // ...
  });
});
```

**検証**:
```bash
npm run test -- --run
# 全テストパス
```

---

## 🎫 Phase 2: コンポーネント実装（TICKET-1006 〜 1011）

### TICKET-1006: InvestmentCalculatorコンポーネント構造作成
- **優先度**: 🔴 Critical
- **見積**: 20分
- **依存**: TICKET-1002
- **担当**: メインエージェント

**タスク**:
- [x] `src/components/Investment/InvestmentCalculator.tsx` 作成
- [x] Reactコンポーネント骨格作成
- [x] ステート定義（入力値、結果、エラー）
- [x] 計算ハンドラー定義

**実装骨格**:
```typescript
import React, { useState } from 'react';
import type { InvestmentParams, InvestmentResult } from '@/types/investment';

export function InvestmentCalculator() {
  const [params, setParams] = useState<InvestmentParams>({
    monthlyAmount: 30000,
    annualReturn: 5.0,
    years: 20,
    initialInvestment: 0
  });

  const [result, setResult] = useState<InvestmentResult | null>(null);

  const handleCalculate = () => {
    // 計算実行
  };

  return (
    <div>
      {/* 入力フォーム */}
      {/* 結果表示 */}
    </div>
  );
}
```

**検証**:
- コンポーネントがエラーなくレンダリングされること

---

### TICKET-1007: 入力フォーム実装
- **優先度**: 🔴 Critical
- **見積**: 40分
- **依存**: TICKET-1006
- **担当**: メインエージェント

**タスク**:
- [x] 月々の積立額入力フィールド（万円単位）
- [x] 想定利回り入力フィールド（%）
- [x] 積立期間入力フィールド（年）
- [x] 各フィールドに↑↓ボタン追加
- [x] 初期投資額フィールド（折りたたみ可能）
- [x] 「計算する」ボタン
- [x] 入力値バリデーション

**UI構成**:
```tsx
<div className="space-y-4">
  {/* 月々の積立額 */}
  <div>
    <label>月々の積立額</label>
    <div className="flex items-center gap-2">
      <input type="text" value={monthlyAmount / 10000} />
      <span>万円</span>
      <button onClick={() => increment('monthly')}>▲</button>
      <button onClick={() => decrement('monthly')}>▼</button>
    </div>
  </div>

  {/* 想定利回り */}
  {/* 積立期間 */}
  {/* 詳細設定（初期投資額） */}

  <button onClick={handleCalculate}>
    計算する
  </button>
</div>
```

**検証**:
- 各入力フィールドが正しく動作
- ↑↓ボタンで値が変更される
- バリデーションエラーが表示される

---

### TICKET-1008: 結果サマリー表示実装
- **優先度**: 🔴 Critical
- **見積**: 30分
- **依存**: TICKET-1006
- **担当**: メインエージェント

**タスク**:
- [x] 結果サマリーカード作成
- [x] 総積立額（元本）表示
- [x] 運用益表示
- [x] 最終資産額表示
- [x] 万円単位での表示
- [x] カンマ区切り表示

**UI構成**:
```tsx
{result && (
  <div className="bg-white rounded-lg shadow p-6">
    <h3>投資シミュレーション結果</h3>

    <div className="grid grid-cols-3 gap-4 mt-4">
      <div>
        <p className="text-sm text-gray-600">総積立額（元本）</p>
        <p className="text-2xl font-bold text-blue-600">
          {formatCurrency(result.principal)}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-600">運用益</p>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(result.profit)}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-600">最終資産額</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(result.total)}
        </p>
      </div>
    </div>
  </div>
)}
```

**検証**:
- 計算後に結果が表示される
- 数値が正しくフォーマットされている

---

### TICKET-1009: InvestmentChart折れ線グラフ実装
- **優先度**: 🔴 Critical
- **見積**: 40分
- **依存**: TICKET-1001, TICKET-1002
- **担当**: メインエージェント

**タスク**:
- [x] `src/components/Investment/InvestmentChart.tsx` 作成
- [x] recharts LineChartコンポーネント使用
- [x] 年次データをグラフ化
- [x] 2本の線（元本、運用後資産）
- [x] レスポンシブ対応

**実装例**:
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface InvestmentChartProps {
  yearlyData: YearlyData[];
}

export function InvestmentChart({ yearlyData }: InvestmentChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">資産推移</h3>

      <LineChart width={600} height={300} data={yearlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" label={{ value: '年数', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: '金額（万円）', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${(value / 10000).toFixed(0)}万円`} />
        <Legend />

        <Line type="monotone" dataKey="principal" stroke="#3B82F6" name="累計元本" />
        <Line type="monotone" dataKey="total" stroke="#10B981" name="運用後資産額" />
      </LineChart>
    </div>
  );
}
```

**検証**:
- グラフが正しく描画される
- レスポンシブで縮小される

---

### TICKET-1010: 棒グラフ追加（元本 vs 運用益）
- **優先度**: 🟡 High
- **見積**: 30分
- **依存**: TICKET-1009
- **担当**: メインエージェント

**タスク**:
- [x] recharts BarChartコンポーネント追加
- [x] 最終結果の内訳を表示
- [x] 元本（青）と運用益（緑）の棒グラフ

**実装例**:
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const barData = [
  {
    name: '内訳',
    元本: result.principal,
    運用益: result.profit
  }
];

<BarChart width={600} height={300} data={barData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip formatter={(value) => `${(value / 10000).toFixed(0)}万円`} />
  <Legend />

  <Bar dataKey="元本" fill="#3B82F6" />
  <Bar dataKey="運用益" fill="#10B981" />
</BarChart>
```

**検証**:
- 棒グラフが正しく表示される
- 元本と運用益の比率が視覚的に理解できる

---

### TICKET-1011: barrel export作成
- **優先度**: 🟢 Medium
- **見積**: 5分
- **依存**: TICKET-1006, TICKET-1009
- **担当**: メインエージェント

**タスク**:
- [x] `src/components/Investment/index.ts` 作成
- [x] InvestmentCalculatorをexport
- [x] InvestmentChartをexport

**成果物**:
```typescript
// src/components/Investment/index.ts
export { InvestmentCalculator } from './InvestmentCalculator';
export { InvestmentChart } from './InvestmentChart';
```

**検証**:
```typescript
import { InvestmentCalculator } from '@/components/Investment';
// エラーが出ないこと
```

---

## 🎫 Phase 3: ページ統合（TICKET-1012 〜 1014）

### TICKET-1012: ViewMode型に'investment'追加
- **優先度**: 🔴 Critical
- **見積**: 5分
- **依存**: なし
- **担当**: メインエージェント

**タスク**:
- [x] `src/pages/Home.tsx` のViewMode型定義を修正

**変更内容**:
```typescript
// Before
type ViewMode = 'loan' | 'calculator';

// After
type ViewMode = 'loan' | 'calculator' | 'investment';
```

**検証**:
```bash
npm run type-check
```

---

### TICKET-1013: タブナビゲーションに「資産運用」追加
- **優先度**: 🔴 Critical
- **見積**: 15分
- **依存**: TICKET-1012
- **担当**: メインエージェント

**タスク**:
- [x] Header部分にタブボタン追加
- [x] アクティブ状態のスタイリング

**実装例**:
```tsx
<div className="flex gap-2 mb-6">
  <button
    onClick={() => setViewMode('loan')}
    className={viewMode === 'loan' ? 'active' : ''}
  >
    住宅ローン
  </button>

  <button
    onClick={() => setViewMode('calculator')}
    className={viewMode === 'calculator' ? 'active' : ''}
  >
    簡易電卓
  </button>

  <button
    onClick={() => setViewMode('investment')}
    className={viewMode === 'investment' ? 'active' : ''}
  >
    資産運用
  </button>
</div>
```

**検証**:
- 3つのタブが表示される
- クリックでタブが切り替わる

---

### TICKET-1014: InvestmentCalculator条件付きレンダリング
- **優先度**: 🔴 Critical
- **見積**: 10分
- **依存**: TICKET-1011, TICKET-1012
- **担当**: メインエージェント

**タスク**:
- [x] viewMode === 'investment' の条件分岐追加
- [x] InvestmentCalculatorコンポーネントのインポート
- [x] 条件付きレンダリング

**実装例**:
```tsx
import { InvestmentCalculator } from '@/components/Investment';

// ...

{viewMode === 'investment' && (
  <InvestmentCalculator />
)}
```

**検証**:
- 資産運用タブをクリックするとInvestmentCalculatorが表示される
- 他のタブをクリックすると非表示になる

---

## 🎫 Phase 4: 有料版誘導UI（TICKET-1015 〜 1016）

### TICKET-1015: 繰上返済比較CTA作成
- **優先度**: 🟡 High
- **見積**: 20分
- **依存**: TICKET-1008
- **担当**: メインエージェント

**タスク**:
- [x] 結果表示の下にCTAセクション追加
- [x] 有料版機能の説明テキスト
- [x] 「詳しく見る」ボタン

**実装例**:
```tsx
{result && (
  <div className="mt-8 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
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
)}
```

**検証**:
- CTAが目立つデザインで表示される
- ボタンがホバーで色が変わる

---

### TICKET-1016: PDF出力ボタン（鍵マーク付き）追加
- **優先度**: 🟡 High
- **見積**: 15分
- **依存**: TICKET-1008
- **担当**: メインエージェント

**タスク**:
- [x] 鍵アイコンSVG追加
- [x] disabledボタン作成
- [x] ツールチップ表示（任意）

**実装例**:
```tsx
<button
  disabled
  className="mt-4 px-6 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed
             flex items-center hover:bg-gray-300"
  title="有料版でご利用いただけます"
>
  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
  PDF出力（有料版機能）
</button>
```

**検証**:
- ボタンがグレーアウトされている
- 鍵マークが表示される
- ホバーで「有料版機能」と分かる

---

## 🎫 Phase 5: 品質保証（TICKET-1017 〜 1018）

### TICKET-1017: レスポンシブデザインテスト
- **優先度**: 🟡 High
- **見積**: 20分
- **依存**: 全コンポーネント実装完了
- **担当**: メインエージェント

**タスク**:
- [ ] モバイル（< 640px）での表示確認
- [ ] タブレット（640px - 1024px）での表示確認
- [ ] デスクトップ（> 1024px）での表示確認
- [ ] グラフのレスポンシブ動作確認
- [ ] タッチ操作の確認

**確認項目**:
- [ ] 入力フォームが縦並びになる（モバイル）
- [ ] グラフが画面幅に収まる
- [ ] ボタンのタッチターゲットが十分（≥44px）
- [ ] テキストが読みやすいサイズ

**検証方法**:
```bash
npm run dev
# ブラウザの開発者ツールでレスポンシブモードを使用
```

---

### TICKET-1018: 品質チェック実行
- **優先度**: 🔴 Critical
- **見積**: 15分
- **依存**: 全実装完了
- **担当**: メインエージェント

**タスク**:
- [x] 型チェック実行
- [x] Lint実行
- [x] テスト実行
- [x] ビルド実行

**コマンド**:
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

**合格基準**:
- [x] 型エラー: 0件
- [ ] Lintエラー: 0件
- [ ] Lint警告: 0件（または正当化済み）
- [x] テスト: 全てパス
- [x] ビルド: 成功

---

## 📊 進捗管理

### チケットステータス

| ステータス | 件数 | チケット番号 |
|-----------|------|-------------|
| ⬜ 未着手 | 0 | - |
| 🟦 実装中 | 2 | TICKET-1017, TICKET-1018 |
| ✅ 完了 | 16 | TICKET-1001〜1016 |

### マイルストーン

| マイルストーン | 期限 | 完了条件 |
|--------------|------|---------|
| Phase 1完了 | Day 1 | ✅ TICKET-1001〜1005完了 |
| Phase 2完了 | Day 2 | ✅ TICKET-1006〜1011完了 |
| Phase 3完了 | Day 2 | ✅ TICKET-1012〜1014完了 |
| Phase 4完了 | Day 3 | ✅ TICKET-1015〜1016完了 |
| Phase 5完了 | Day 3 | 🟦 TICKET-1017〜1018（QA対応中） |
| **機能リリース** | **Day 3** | **全チケット完了** |

---

## 🎯 次のアクション

1. **TICKET-1017**: レスポンシブ表示とタッチ操作の手動確認
2. **TICKET-1018**: Lintエラー/警告の解消（既存Auth関連のany型など）

**備考**: 機能実装・テスト・ビルドは完了済み。残りはQA対応とCIが通るようLintの技術的負債解消。

---

**作成日**: 2025-10-21
**最終更新**: 2025-10-21
**バージョン**: 1.0
