# 返済負担率計算機能 - 開発チケット

## 📊 プロジェクト概要

**機能名**: 返済負担率から借入可能額を計算
**フェーズ**: Phase 9.10（無料版拡張）
**優先度**: 🟡 High
**見積時間**: 約6-8時間

**関連ドキュメント**: `docs/FEATURE_REPAYMENT_RATIO_CALCULATOR.md`

---

## 🎯 実装スコープ

### Phase 9.10.1: 無料版（今回実装）
- ✅ 返済負担率25%固定での計算
- ✅ 本人年収 + 連帯債務者年収（任意）入力
- ✅ 基本UI実装
- ✅ 計算ロジック実装

### Phase 9.10.2: 有料版（将来実装）
- ⏭️ 複数返済負担率比較（20%, 25%, 30%）
- ⏭️ カスタム返済負担率入力
- ⏭️ 比較表UI

---

## 📋 チケット一覧

### TICKET-1001: 型定義の作成 🔴 Critical
**見積時間**: 30分
**担当**: Backend/Type定義

**タスク**:
- [ ] `src/types/repaymentRatio.ts` を作成
- [ ] `RepaymentRatioParams` 型を定義
- [ ] `RepaymentRatioResult` 型を定義
- [ ] `src/types/index.ts` でエクスポート

**成果物**:
```typescript
// src/types/repaymentRatio.ts
export interface RepaymentRatioParams {
  primaryIncome: number;        // 本人年収（万円）
  coDebtorIncome: number;       // 連帯債務者年収（万円、0の場合は単独）
  repaymentRatio: number;       // 返済負担率（0.25 = 25%）
  interestRate: number;         // 金利（年利%）
  years: number;                // 返済期間（年）
}

export interface RepaymentRatioResult {
  maxBorrowable: number;        // 借入可能額（円）
  monthlyPayment: number;       // 月々返済額（円）
  annualPayment: number;        // 年間返済額（円）
  totalPayment: number;         // 総返済額（円）
  totalInterest: number;        // 利息総額（円）
  totalIncome: number;          // 合算年収（万円）
  repaymentRatio: number;       // 使用した返済負担率
}
```

**確認項目**:
- [ ] 型定義がすべて正しくエクスポートされている
- [ ] TypeScript型チェックが通る

---

### TICKET-1002: 計算ロジックの実装 🔴 Critical
**見積時間**: 1時間
**担当**: Backend/Utils
**依存**: TICKET-1001

**タスク**:
- [ ] `src/utils/repaymentRatioCalculator.ts` を作成
- [ ] `calculateFromRepaymentRatio()` 関数を実装
- [ ] 逆算ロジック（`calculatePrincipalFromPayment`）を再利用

**実装内容**:
```typescript
// src/utils/repaymentRatioCalculator.ts
import type { RepaymentRatioParams, RepaymentRatioResult } from '@/types/repaymentRatio';
import { calculatePrincipalFromPayment, getTotalMonths } from './loanCalculator';

export const calculateFromRepaymentRatio = (
  params: RepaymentRatioParams
): RepaymentRatioResult => {
  // Step 1: 合算年収
  const totalIncome = params.primaryIncome + params.coDebtorIncome;

  // Step 2: 年間返済可能額
  const annualPayment = totalIncome * 10000 * params.repaymentRatio; // 万円→円

  // Step 3: 月々返済額
  const monthlyPayment = annualPayment / 12;

  // Step 4: 借入可能額を逆算
  const totalMonths = getTotalMonths(params.years);
  const maxBorrowable = calculatePrincipalFromPayment(
    monthlyPayment,
    params.interestRate,
    totalMonths
  );

  // Step 5: 総返済額・利息計算
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - maxBorrowable;

  return {
    maxBorrowable: Math.round(maxBorrowable),
    monthlyPayment: Math.round(monthlyPayment),
    annualPayment: Math.round(annualPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    totalIncome,
    repaymentRatio: params.repaymentRatio,
  };
};
```

**確認項目**:
- [ ] 計算ロジックが正しい
- [ ] 既存の `calculatePrincipalFromPayment` を正しく再利用
- [ ] 円単位で四捨五入されている

---

### TICKET-1003: ユニットテストの作成 🟡 High
**見積時間**: 1時間
**担当**: Testing
**依存**: TICKET-1002

**タスク**:
- [ ] `tests/unit/repaymentRatioCalculator.test.ts` を作成
- [ ] 正常系テストケース作成
- [ ] 異常系テストケース作成
- [ ] 境界値テストケース作成

**テストケース**:
```typescript
describe('calculateFromRepaymentRatio', () => {
  it('本人年収500万円、返済負担率25%、35年、金利1.0%', () => {
    const result = calculateFromRepaymentRatio({
      primaryIncome: 500,
      coDebtorIncome: 0,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 35,
    });

    expect(result.totalIncome).toBe(500);
    expect(result.monthlyPayment).toBe(104166); // 125万円÷12
    expect(result.maxBorrowable).toBeCloseTo(43750000, -4); // 約4375万円
  });

  it('連帯債務者あり（400万+300万）', () => {
    const result = calculateFromRepaymentRatio({
      primaryIncome: 400,
      coDebtorIncome: 300,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 35,
    });

    expect(result.totalIncome).toBe(700);
    expect(result.monthlyPayment).toBe(145833); // 175万円÷12
  });

  it('返済負担率20%', () => {
    const result = calculateFromRepaymentRatio({
      primaryIncome: 500,
      coDebtorIncome: 0,
      repaymentRatio: 0.20,
      interestRate: 1.0,
      years: 35,
    });

    expect(result.monthlyPayment).toBe(83333); // 100万円÷12
  });
});
```

**確認項目**:
- [ ] すべてのテストが通る
- [ ] カバレッジが80%以上

---

### TICKET-1004: UIコンポーネントの作成 🔴 Critical
**見積時間**: 2時間
**担当**: Frontend
**依存**: TICKET-1001, TICKET-1002

**タスク**:
- [ ] `src/components/Input/RepaymentRatioForm.tsx` を作成
- [ ] 入力フォームUI実装
- [ ] バリデーション実装
- [ ] 計算ボタンの実装

**実装内容**:
```typescript
// src/components/Input/RepaymentRatioForm.tsx
interface RepaymentRatioFormProps {
  onCalculate: (result: RepaymentRatioResult) => void;
}

export const RepaymentRatioForm: React.FC<RepaymentRatioFormProps> = ({ onCalculate }) => {
  const [primaryIncome, setPrimaryIncome] = useState<string>('');
  const [coDebtorIncome, setCoDebtorIncome] = useState<string>('');
  const [interestRate, setInterestRate] = useState<number>(1.0);
  const [years, setYears] = useState<number>(35);

  const handleCalculate = () => {
    const params: RepaymentRatioParams = {
      primaryIncome: Number(primaryIncome) || 0,
      coDebtorIncome: Number(coDebtorIncome) || 0,
      repaymentRatio: 0.25, // 無料版は25%固定
      interestRate,
      years,
    };

    const result = calculateFromRepaymentRatio(params);
    onCalculate(result);
  };

  return (
    <div className="space-y-4">
      {/* 本人年収 */}
      <div>
        <label>本人年収 *</label>
        <input
          type="text"
          inputMode="decimal"
          value={primaryIncome}
          onChange={(e) => setPrimaryIncome(e.target.value)}
          placeholder="例：500"
        />
        <span>万円</span>
      </div>

      {/* 連帯債務者年収 */}
      <div>
        <label>連帯債務者年収（任意）</label>
        <input
          type="text"
          inputMode="decimal"
          value={coDebtorIncome}
          onChange={(e) => setCoDebtorIncome(e.target.value)}
          placeholder="例：300"
        />
        <span>万円</span>
        <p className="text-sm text-gray-600">
          配偶者など、共同で返済する方の年収
        </p>
      </div>

      {/* 返済負担率（固定表示） */}
      <div>
        <label>返済負担率</label>
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="font-semibold text-lg">25% （推奨）</p>
          <p className="text-sm text-gray-600">
            無理のない返済計画の目安です
          </p>
        </div>
      </div>

      {/* 金利・返済期間 */}
      {/* ... */}

      <button onClick={handleCalculate}>
        計算する
      </button>
    </div>
  );
};
```

**確認項目**:
- [ ] キーボード直接入力が可能
- [ ] バリデーションエラーが表示される
- [ ] レスポンシブ対応

---

### TICKET-1005: 結果表示コンポーネントの作成 🟡 High
**見積時間**: 1時間
**担当**: Frontend
**依存**: TICKET-1001

**タスク**:
- [ ] `src/components/Result/RepaymentRatioSummary.tsx` を作成
- [ ] 結果表示UI実装
- [ ] フォーマット処理実装

**実装内容**:
```typescript
// src/components/Result/RepaymentRatioSummary.tsx
interface RepaymentRatioSummaryProps {
  result: RepaymentRatioResult;
}

export const RepaymentRatioSummary: React.FC<RepaymentRatioSummaryProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">💰 計算結果</h3>

      <div className="space-y-3">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-700">借入可能額</span>
          <span className="text-2xl font-bold text-primary">
            {(result.maxBorrowable / 10000).toLocaleString('ja-JP')}万円
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">月々返済額</span>
          <span className="font-semibold">
            {result.monthlyPayment.toLocaleString('ja-JP')}円
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">年間返済額</span>
          <span className="font-semibold">
            {result.annualPayment.toLocaleString('ja-JP')}円
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">総返済額</span>
          <span className="font-semibold">
            {result.totalPayment.toLocaleString('ja-JP')}円
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">利息総額</span>
          <span className="font-semibold text-orange-600">
            {result.totalInterest.toLocaleString('ja-JP')}円
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-gray-700">
          💡 返済負担率25%は、無理のない返済計画の目安です
        </p>
      </div>
    </div>
  );
};
```

**確認項目**:
- [ ] 金額が正しくフォーマットされている
- [ ] デザインが統一されている

---

### TICKET-1006: Homeページへの統合 🔴 Critical
**見積時間**: 1.5時間
**担当**: Frontend
**依存**: TICKET-1004, TICKET-1005

**タスク**:
- [ ] `src/pages/Home.tsx` に新モード追加
- [ ] 「返済負担率」ボタンを追加（4つ目）
- [ ] モード切り替えロジック実装
- [ ] ボタン順序を調整（借入額・返済額・返済負担率・年収MAX）

**実装内容**:
```typescript
// src/pages/Home.tsx

// 計算モードに新しい選択肢を追加
type CalculationMode = 'forward' | 'reverse' | 'repayment-ratio' | 'income';

// ボタン追加（4つ横並び）
<div className="grid grid-cols-4 gap-3 mb-8 max-w-4xl mx-auto w-full">
  <button
    onClick={() => setCalculationMode('forward')}
    className={calculationModeButtonClass('forward')}
  >
    <span className="text-lg">🏠</span>
    借入額
  </button>
  <button
    onClick={() => setCalculationMode('reverse')}
    className={calculationModeButtonClass('reverse')}
  >
    <span className="text-lg">💳</span>
    返済額
  </button>
  <button
    onClick={() => setCalculationMode('repayment-ratio')}
    className={calculationModeButtonClass('repayment-ratio')}
  >
    <span className="text-lg">💰</span>
    返済負担率
  </button>
  <button
    onClick={() => setCalculationMode('income')}
    className={calculationModeButtonClass('income')}
  >
    <span className="text-lg">💼</span>
    年収MAX
  </button>
</div>

// コンポーネント表示
{viewMode === 'loan' && calculationMode === 'repayment-ratio' && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <RepaymentRatioForm onCalculate={handleRepaymentRatioCalculate} />
    </div>
    <div>
      {repaymentRatioResult && (
        <RepaymentRatioSummary result={repaymentRatioResult} />
      )}
    </div>
  </div>
)}
```

**レイアウト**:
```
┌─────────────────────────────────────┐
│ ローン計算モード選択（4つ横並び）    │
├──────┬──────┬──────┬──────────┤
│ 借入額│返済額│返済負担率│年収MAX │ ← 新しい順序
└──────┴──────┴──────┴──────────┘
```

**確認項目**:
- [ ] 4つのボタンが正しく表示される
- [ ] ボタン順序が正しい（借入額・返済額・返済負担率・年収MAX）
- [ ] タブ切り替えが正常に動作
- [ ] 状態管理が正しい
- [ ] レスポンシブ対応（スマホでは縦2行×2列など）

---

### TICKET-1007: バリデーション強化 🟢 Medium
**見積時間**: 45分
**担当**: Frontend
**依存**: TICKET-1004

**タスク**:
- [ ] 入力値バリデーション実装
- [ ] エラーメッセージ表示
- [ ] 入力範囲制限

**バリデーションルール**:
```typescript
const validation = {
  primaryIncome: {
    required: true,
    min: 1,
    max: 9999,
    message: '本人年収は1万円〜9999万円で入力してください',
  },
  coDebtorIncome: {
    required: false,
    min: 0,
    max: 9999,
    message: '連帯債務者年収は0万円〜9999万円で入力してください',
  },
  interestRate: {
    required: true,
    min: 0.01,
    max: 10.0,
    message: '金利は0.01%〜10.0%で入力してください',
  },
  years: {
    required: true,
    min: 1,
    max: 50,
    message: '返済期間は1年〜50年で入力してください',
  },
};
```

**確認項目**:
- [ ] すべての入力値がバリデートされる
- [ ] エラーメッセージが適切に表示される

---

### TICKET-1008: ドキュメント更新 🟢 Medium
**見積時間**: 30分
**担当**: Documentation
**依存**: 全チケット完了後

**タスク**:
- [ ] `CLAUDE.md` を更新（新機能追加）
- [ ] `README.md` を更新（機能一覧）
- [ ] `docs/CURRENT_STATUS.md` を更新

**確認項目**:
- [ ] すべてのドキュメントが最新

---

## 📊 進捗管理

### Phase 9.10.1: 無料版実装（今回）

| チケット | 優先度 | 見積 | 状態 | 担当 |
|---------|-------|------|------|------|
| TICKET-1001 | 🔴 | 30分 | ⬜ | Type |
| TICKET-1002 | 🔴 | 1h | ⬜ | Utils |
| TICKET-1003 | 🟡 | 1h | ⬜ | Test |
| TICKET-1004 | 🔴 | 2h | ⬜ | UI |
| TICKET-1005 | 🟡 | 1h | ⬜ | UI |
| TICKET-1006 | 🔴 | 1.5h | ⬜ | Integration |
| TICKET-1007 | 🟢 | 45分 | ⬜ | Validation |
| TICKET-1008 | 🟢 | 30分 | ⬜ | Docs |

**合計見積時間**: 約8時間

---

## ✅ 完了条件

### 機能完了
- [ ] 本人年収 + 連帯債務者年収から借入可能額を計算できる
- [ ] 返済負担率25%固定で計算される
- [ ] 結果が正しく表示される
- [ ] キーボード直接入力が可能

### 品質完了
- [ ] すべてのユニットテストが通る
- [ ] TypeScript型チェックが通る
- [ ] ビルドが成功する
- [ ] レスポンシブ対応完了

### デプロイ完了
- [ ] Vercelにデプロイ
- [ ] 本番環境で動作確認

---

**作成日**: 2025-10-31
**更新日**: 2025-10-31
**次のアクション**: TICKET-1001から順次実装開始
