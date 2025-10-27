# 👤 お客様名登録機能（Tier 2限定）

## 🎯 コンセプト

**「しれっと」自然に現れる機能**
- ログインすると、入力フォームに「お客様名」フィールドが**自然に表示**される
- 説明文やCTAは不要（「登録しよう！」などのプッシュ感ゼロ）
- ユーザーが「あ、このフィールドがある！」と自分で発見する体験
- FP営業担当者が顧客情報を管理しやすくなる

---

## 📋 機能仕様

### 表示条件

**Tier 1（匿名ユーザー）**: 表示なし
- お客様名フィールドは存在しない
- 通常の計算機能のみ

**Tier 2/3（ログインユーザー）**: 自然に表示
- 借入額計算、返済額計算、年収計算のすべてのフォームに表示
- 既存の入力項目と同じデザイン（違和感なく溶け込む）
- プレースホルダー: 「例）山田 太郎」
- オプション項目（入力なしでも計算可能）

---

## 🎨 UI/UX設計

### 配置位置

**フォームの一番上**（借入金額などの前）:
```
┌─────────────────────────────────────┐
│  借入額から計算                      │
├─────────────────────────────────────┤
│                                     │
│  👤 お客様名（任意）                 │  ← NEW!（Tier 2以上で表示）
│  [              ]                   │
│                                     │
│  💰 借入金額                        │
│  [ 5000 ] 万円  [▲] [▼]           │
│                                     │
│  ...                                │
└─────────────────────────────────────┘
```

**デザイン原則**:
- 既存フィールドと同じスタイル（違和感なし）
- 必須マークなし（任意項目であることを暗示）
- 説明文なし（シンプルに「お客様名」とだけ表示）
- アイコン: 👤（人物アイコン、控えめに）

---

## 🔧 実装仕様

### データ構造

#### LoanParams 拡張
```typescript
// src/types/loan.ts

export interface LoanParams {
  // 既存フィールド
  principal: number;
  interestRate: number;
  years: number;
  months: number;
  repaymentType: 'equal-payment' | 'equal-principal';
  bonusPayment?: BonusPayment;

  // 🆕 追加フィールド
  customerName?: string; // Tier 2以上で使用
}

export interface ReverseLoanParams {
  // 既存フィールド
  monthlyPayment: number;
  interestRate: number;
  years: number;
  months: number;
  repaymentType: 'equal-payment' | 'equal-principal';
  bonusPayment?: ReverseBonusPayment;

  // 🆕 追加フィールド
  customerName?: string;
}

// 🆕 年収計算用（Phase 9.8）
export interface IncomeParams {
  primaryIncome: number;
  interestRate: number;
  years: number;
  hasCoDebtor: boolean;
  coDebtorType?: 'joint-debtor' | 'guarantor';
  coDebtorIncome?: number;

  // 🆕 追加フィールド
  customerName?: string;
}
```

### 履歴データ拡張

#### HistoryEntry 拡張
```typescript
// src/types/loan.ts

export interface HistoryEntry {
  id: string;
  timestamp: number;
  params: LoanParams | ReverseLoanParams | IncomeParams;
  result: LoanResult;
  mode: 'forward' | 'reverse' | 'income'; // income 追加

  // 🆕 お客様名（Tier 2以上の履歴のみ）
  customerName?: string;
}
```

### Supabase テーブル拡張

#### calculations テーブル
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_customer_name.sql

ALTER TABLE calculations
ADD COLUMN customer_name TEXT;

-- インデックス追加（検索用）
CREATE INDEX idx_calculations_customer_name
ON calculations(user_id, customer_name)
WHERE customer_name IS NOT NULL;
```

---

## 🎨 コンポーネント実装

### LoanForm.tsx の変更

```tsx
// src/components/Input/LoanForm.tsx

import { useAuth } from '@/contexts/AuthContext';

export const LoanForm: React.FC = () => {
  const { user, userTier } = useAuth();
  const [customerName, setCustomerName] = useState('');

  // Tier 2以上でのみ表示
  const showCustomerName = userTier >= 2;

  return (
    <form>
      {/* お客様名フィールド（Tier 2以上でのみ表示） */}
      {showCustomerName && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <span className="text-lg">👤</span>
            <span>お客様名（任意）</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="例）山田 太郎"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-lg"
            maxLength={50}
          />
        </div>
      )}

      {/* 既存の入力フィールド */}
      <div className="mb-4">
        <label>💰 借入金額</label>
        {/* ... */}
      </div>
      {/* ... */}
    </form>
  );
};
```

### ReverseLoanForm.tsx の変更

同様のパターンで追加:
```tsx
{showCustomerName && (
  <div className="mb-4">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
      <span className="text-lg">👤</span>
      <span>お客様名（任意）</span>
    </label>
    <input
      type="text"
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
      placeholder="例）山田 太郎"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 text-lg"
      maxLength={50}
    />
  </div>
)}
```

### IncomeForm.tsx の変更（Phase 9.8実装時）

年収計算フォームにも同様に追加。

---

## 💾 データ保存

### localStorage（Tier 1）

Tier 1 ユーザーには customerName フィールドは表示されないため、localStorage には保存されない。

### Supabase（Tier 2/3）

```typescript
// src/contexts/LoanContext.tsx または useCalculator.ts

const saveCalculation = async (params: LoanParams, result: LoanResult) => {
  if (userTier >= 2 && user) {
    // Supabase に保存
    const { error } = await supabase
      .from('calculations')
      .insert({
        user_id: user.id,
        calculation_type: 'loan_forward',
        params: params,
        result: result,
        customer_name: params.customerName || null, // 🆕
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to save calculation:', error);
    }
  } else {
    // localStorage に保存（Tier 1）
    // customerName は含まれない
  }
};
```

---

## 📊 履歴表示での活用

### HistoryList.tsx の変更

```tsx
// src/components/History/HistoryList.tsx

export const HistoryList: React.FC = () => {
  const { userTier } = useAuth();

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <div key={entry.id} className="bg-white p-4 rounded-lg shadow">
          {/* お客様名表示（Tier 2以上 & 入力されている場合のみ） */}
          {userTier >= 2 && entry.customerName && (
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
              <span className="text-base">👤</span>
              <span className="font-medium">{entry.customerName}</span>
            </div>
          )}

          {/* 既存の履歴表示 */}
          <div className="text-lg font-bold">
            {formatCurrency(entry.result.totalPayment)}
          </div>
          <div className="text-sm text-gray-600">
            {new Date(entry.timestamp).toLocaleDateString('ja-JP')}
          </div>
          {/* ... */}
        </div>
      ))}
    </div>
  );
};
```

---

## 🔍 検索機能（将来拡張）

### お客様名での履歴検索（Tier 2/3）

```tsx
// 将来的に実装（Phase 19以降）
const [searchQuery, setSearchQuery] = useState('');

const filteredHistory = history.filter(entry =>
  entry.customerName?.includes(searchQuery)
);
```

---

## 🎯 期待される効果

### ユーザー体験
- ✅ 自然な発見体験（「あ、このフィールドがある！」）
- ✅ プッシュ感ゼロ（ユーザーが自分のペースで使える）
- ✅ FP営業担当者の業務効率化（顧客情報管理）

### ビジネス
- ✅ Tier 2 の価値向上（無料でも便利な機能）
- ✅ 顧客管理ツールとしての側面を強化
- ✅ 有料版への導線（より高度な顧客管理機能へ）

### 技術
- ✅ 既存のデータ構造を拡張（大きな変更なし）
- ✅ Tier による表示制御（userTier >= 2 の条件分岐のみ）
- ✅ 検索機能の基盤（将来の拡張が容易）

---

## 📝 実装チケット

### TICKET-990: お客様名フィールド追加（Tier 2限定）

**Priority**: 🟡 High
**Estimate**: 1時間
**Dependencies**: なし（Phase 9.8 と並行可能）

**Tasks**:
- [ ] `src/types/loan.ts` に `customerName?: string` 追加
- [ ] `LoanForm.tsx` にフィールド追加（Tier 2以上で表示）
- [ ] `ReverseLoanForm.tsx` にフィールド追加
- [ ] `IncomeForm.tsx` にフィールド追加（Phase 9.8実装時）
- [ ] Supabase migration 作成（customer_name カラム追加）
- [ ] `LoanContext.tsx` で保存処理実装
- [ ] `HistoryList.tsx` で表示処理実装
- [ ] 手動テスト（Tier 1/2/3 で表示切替確認）

**Acceptance Criteria**:
- Tier 1: お客様名フィールドは表示されない
- Tier 2/3: お客様名フィールドが自然に表示される
- 入力したお客様名が履歴に保存される
- 履歴一覧でお客様名が表示される

---

## 🔗 関連ドキュメント

- `docs/TICKETS_INCOME_CALCULATOR.md`: Phase 9.8 チケット
- `docs/PHASE-18-SUMMARY.md`: Freemium戦略
- `src/types/loan.ts`: 型定義
- `src/contexts/AuthContext.tsx`: Tier 判定ロジック

---

**作成日**: 2025-10-27
**Phase**: 9.9（無料版機能拡張 - Tier 2 価値向上）
**Total Estimate**: 1時間
