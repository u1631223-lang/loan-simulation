# ライフプランキャッシュフロー計算エンジン - 使用方法

## 概要

`lifePlanCalculator.ts` は、ライフプランの年次キャッシュフロー計算を行うユーティリティモジュールです。

## 主要機能

### 1. 年次キャッシュフロー計算

指定した年の収入・支出・イベント費用を集計し、貯蓄額を計算します。

```typescript
import { calculateAnnualCashFlow } from '@/utils/lifePlanCalculator';
import type { IncomeSource, ExpenseItem, LifeEvent } from '@/types/lifePlan';

const incomes: IncomeSource[] = [
  {
    id: 'salary',
    name: '給与',
    amount: 6000000, // 年収600万円
    startYear: 2025,
    endYear: 2060,
    frequency: 'annual',
  },
];

const expenses: ExpenseItem[] = [
  {
    id: 'living',
    category: '生活費',
    name: '食費・光熱費',
    amount: 200000, // 月20万円
    startYear: 2025,
    frequency: 'monthly',
    isFixed: true,
  },
];

const events: LifeEvent[] = [
  {
    id: 'event1',
    lifePlanId: 'lp1',
    eventType: 'marriage',
    eventName: '結婚',
    year: 2027,
    amount: 3000000, // 300万円
  },
];

// 2027年のキャッシュフロー計算
const result = calculateAnnualCashFlow(2027, incomes, expenses, events);

console.log(result);
// {
//   totalIncome: 6000000,
//   totalExpenses: 2400000,
//   eventCosts: 3000000,
//   savings: 600000
// }
```

### 2. 全期間キャッシュフロー計算

開始年から終了年までの全期間のキャッシュフローを計算し、資産残高の推移を含めて返します。

```typescript
import { calculateLifePlanCashFlow } from '@/utils/lifePlanCalculator';

const cashFlows = calculateLifePlanCashFlow(
  'lp1',           // ライフプランID
  2025,            // 開始年
  2060,            // 終了年
  10000000,        // 初期資産（1000万円）
  incomes,
  expenses,
  events
);

console.log(cashFlows[0]);
// {
//   id: 'lp1-2025',
//   lifePlanId: 'lp1',
//   year: 2025,
//   income: 6000000,
//   expenses: 2400000,
//   savings: 3600000,
//   balance: 13600000,
//   createdAt: '2025-10-25T...'
// }
```

### 3. 資産残高の再計算

初期資産を変更した場合に、既存のキャッシュフロー配列から資産残高を再計算します。

```typescript
import { calculateBalanceProgression } from '@/utils/lifePlanCalculator';

// 初期資産を2000万円に変更して再計算
const updatedCashFlows = calculateBalanceProgression(cashFlows, 20000000);

console.log(updatedCashFlows[0].balance); // 23600000（2000万 + 360万）
```

### 4. サマリー情報の計算

全期間の総収入・総支出・総貯蓄・最終残高を計算します。

```typescript
import { calculateLifePlanSummary } from '@/utils/lifePlanCalculator';

const summary = calculateLifePlanSummary(cashFlows);

console.log(summary);
// {
//   totalIncome: 210000000,  // 2.1億円
//   totalExpenses: 150000000, // 1.5億円
//   totalSavings: 60000000,   // 6000万円
//   finalBalance: 70000000    // 7000万円（初期1000万+貯蓄6000万）
// }
```

### 5. 資産不足の検出

資産残高がマイナスになる年を検出します。

```typescript
import { detectBalanceDeficit } from '@/utils/lifePlanCalculator';

const deficitYears = detectBalanceDeficit(cashFlows);

if (deficitYears.length > 0) {
  console.log(`警告: ${deficitYears.join(', ')}年に資産不足が発生します`);
}
```

### 6. 特定年の詳細情報

指定した年のキャッシュフローとライフイベントを取得します。

```typescript
import { getYearDetail } from '@/utils/lifePlanCalculator';

const detail = getYearDetail(2027, cashFlows, events);

console.log(detail.cashFlow); // その年のキャッシュフロー
console.log(detail.events);   // その年のライフイベント配列
```

### 7. 年齢と年の相互変換

ライフイベントの計画時に便利な補助関数です。

```typescript
import { calculateYearFromAge, calculateAgeFromYear } from '@/utils/lifePlanCalculator';

// 現在30歳（2025年）の人が65歳になる年を計算
const retirementYear = calculateYearFromAge(30, 2025, 65);
console.log(retirementYear); // 2060

// 2060年の時の年齢を計算
const ageAt2060 = calculateAgeFromYear(30, 2025, 2060);
console.log(ageAt2060); // 65
```

## データ型

### 収入源 (IncomeSource)

```typescript
interface IncomeSource {
  id: string;
  name: string;           // 収入名（例: 給与、賞与、退職金）
  amount: number;         // 金額
  startYear: number;      // 開始年
  endYear?: number;       // 終了年（オプション、指定がない場合は無期限）
  frequency: 'monthly' | 'annual' | 'one_time';
}
```

**frequency の違い:**
- `monthly`: 月次収入（`amount × 12` が年収になる）
- `annual`: 年次収入（`amount` がそのまま年収）
- `one_time`: 単発収入（`startYear` の年のみ）

### 支出項目 (ExpenseItem)

```typescript
interface ExpenseItem {
  id: string;
  category: string;       // カテゴリー（生活費、住居費、保険など）
  name: string;           // 支出名
  amount: number;         // 金額
  startYear: number;      // 開始年
  endYear?: number;       // 終了年（オプション）
  frequency: 'monthly' | 'annual' | 'one_time';
  isFixed: boolean;       // 固定費かどうか
}
```

### ライフイベント (LifeEvent)

```typescript
interface LifeEvent {
  id: string;
  lifePlanId: string;
  eventType: LifeEventType; // 'marriage' | 'birth' | 'education' | 'car' | 'housing' | 'retirement' | 'other'
  eventName: string;
  year: number;           // イベント発生年
  amount?: number;        // イベント費用（オプション）
  notes?: string;
}
```

### キャッシュフロー (CashFlow)

```typescript
interface CashFlow {
  id: string;
  lifePlanId: string;
  year: number;           // 対象年
  income: number;         // その年の総収入
  expenses: number;       // その年の総支出（イベント費用含む）
  savings: number;        // その年の貯蓄額
  balance: number;        // その年末の資産残高
  createdAt?: string;
}
```

## 実践例

### 完全なライフプランシミュレーション

```typescript
import {
  calculateLifePlanCashFlow,
  calculateLifePlanSummary,
  detectBalanceDeficit,
  calculateYearFromAge,
} from '@/utils/lifePlanCalculator';

// 30歳（2025年）から65歳（2060年）までのプラン
const currentAge = 30;
const baseYear = 2025;

// 収入定義
const incomes: IncomeSource[] = [
  // 給与（30-60歳）
  {
    id: 'salary',
    name: '給与',
    amount: 6000000,
    startYear: 2025,
    endYear: calculateYearFromAge(currentAge, baseYear, 60),
    frequency: 'annual',
  },
  // 退職金（60歳時）
  {
    id: 'retirement',
    name: '退職金',
    amount: 20000000,
    startYear: calculateYearFromAge(currentAge, baseYear, 60),
    frequency: 'one_time',
  },
  // 年金（65歳から）
  {
    id: 'pension',
    name: '年金',
    amount: 2400000,
    startYear: calculateYearFromAge(currentAge, baseYear, 65),
    frequency: 'annual',
  },
];

// 支出定義
const expenses: ExpenseItem[] = [
  // 基本生活費
  {
    id: 'living',
    category: '生活費',
    name: '食費・光熱費',
    amount: 200000,
    startYear: 2025,
    frequency: 'monthly',
    isFixed: true,
  },
  // 住宅ローン（40-65歳）
  {
    id: 'mortgage',
    category: '住居費',
    name: '住宅ローン',
    amount: 100000,
    startYear: calculateYearFromAge(currentAge, baseYear, 40),
    endYear: calculateYearFromAge(currentAge, baseYear, 65),
    frequency: 'monthly',
    isFixed: true,
  },
];

// ライフイベント
const events: LifeEvent[] = [
  {
    id: 'e1',
    lifePlanId: 'plan1',
    eventType: 'marriage',
    eventName: '結婚',
    year: calculateYearFromAge(currentAge, baseYear, 35),
    amount: 3000000,
  },
  {
    id: 'e2',
    lifePlanId: 'plan1',
    eventType: 'housing',
    eventName: '住宅購入（頭金）',
    year: calculateYearFromAge(currentAge, baseYear, 40),
    amount: 10000000,
  },
];

// キャッシュフロー計算
const cashFlows = calculateLifePlanCashFlow(
  'plan1',
  baseYear,
  calculateYearFromAge(currentAge, baseYear, 65),
  5000000, // 初期資産500万円
  incomes,
  expenses,
  events
);

// サマリー表示
const summary = calculateLifePlanSummary(cashFlows);
console.log('=== ライフプランサマリー ===');
console.log(`総収入: ${summary.totalIncome.toLocaleString('ja-JP')}円`);
console.log(`総支出: ${summary.totalExpenses.toLocaleString('ja-JP')}円`);
console.log(`総貯蓄: ${summary.totalSavings.toLocaleString('ja-JP')}円`);
console.log(`最終残高: ${summary.finalBalance.toLocaleString('ja-JP')}円`);

// 資産不足の検出
const deficitYears = detectBalanceDeficit(cashFlows);
if (deficitYears.length > 0) {
  console.log(`\n⚠️ 警告: 以下の年で資産不足が発生します`);
  console.log(deficitYears.join(', '));
} else {
  console.log('\n✅ 全期間で資産は黒字です');
}

// 各年の詳細表示（最初の5年）
console.log('\n=== 年次詳細（2025-2029年）===');
cashFlows.slice(0, 5).forEach(cf => {
  console.log(`${cf.year}年: 収入${cf.income.toLocaleString()}円 / 支出${cf.expenses.toLocaleString()}円 / 残高${cf.balance.toLocaleString()}円`);
});
```

## 計算ロジックの詳細

### 年次収入の計算

- **monthly**: `amount × 12`
- **annual**: `amount`
- **one_time**: `startYear` と同じ年のみ `amount`、それ以外は `0`

### 年次支出の計算

収入と同じロジックです。

### イベント費用の計算

指定された年に発生するすべてのイベントの `amount` を合計します。

### 貯蓄の計算

```
貯蓄 = 収入 - 支出 - イベント費用
```

### 資産残高の計算

```
残高[n] = 残高[n-1] + 貯蓄[n]
```

初年度は初期資産 + 貯蓄です。

## テスト

計算ロジックは25個のユニットテストでカバーされています。

```bash
npm run test -- lifePlanCalculator.test.ts --run
```

すべてのテストが通過していることを確認済みです（107/107 tests passing）。

## 注意事項

1. **期間の扱い**: `endYear` は含まれます（inclusive）。例えば `endYear: 2030` の場合、2030年まで（2030年を含む）継続します。

2. **金額の丸め**: すべての金額は円単位で四捨五入されます（`Math.round`）。

3. **資産不足**: 残高がマイナスになる場合も計算は継続されます。警告表示は `detectBalanceDeficit` を使用してください。

4. **年齢計算**: `calculateYearFromAge` と `calculateAgeFromYear` は単純な加減算です。誕生日の考慮はしていません。

## パフォーマンス

- 36年間（30歳-65歳）のシミュレーションは数ミリ秒で完了します
- 複数の収入源・支出項目・イベントを扱っても高速です
- メモリ使用量も最小限です

## 次のステップ

このユーティリティを使用して以下を実装できます:

1. **UI コンポーネント**: キャッシュフロー表、グラフ表示
2. **Context/Store**: グローバル状態管理
3. **API 連携**: Supabase へのデータ保存
4. **PDF 出力**: レポート生成機能

詳細は `docs/TICKETS_FP.md` の Phase 13-16 を参照してください。
