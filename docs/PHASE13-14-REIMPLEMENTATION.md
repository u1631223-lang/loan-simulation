# Phase 13-14 コンポーネント再実装ガイド

> このドキュメントは、Phase 17 修正時に一時的に無効化されたコンポーネントを、Phase 13-14 実装時に再有効化・再実装するためのガイドです。

## 背景

Phase 17 の修正作業において、Supabase スキーマ不整合を修正した結果、`income_items` / `expense_items` の型定義が変更されました：

**変更前（Phase 14 想定）**:
- `budget_id` ベース（家計収支管理用）
- `item_name`, `frequency`, `is_fixed` などのプロパティ

**変更後（Phase 13 ライフプラン用）**:
- `user_id` ベース（ライフプラン用）
- `name`, `start_age`, `end_age` プロパティ
- 年齢ベースの期間管理

この変更により、Phase 14 の家計収支管理コンポーネントで型エラーが発生したため、一時的に無効化しました。

---

## 無効化されたファイル一覧

### 1. tsconfig.json から除外されたファイル

```json
"exclude": [
  "src/components/FP/Household/BudgetForm.tsx",
  "src/components/FP/Household/BudgetSummary.tsx",
  "src/components/FP/Household/BudgetChart.tsx",
  "src/components/FP/Household/ExpenseItems.tsx",
  "src/components/FP/Household/IncomeItems.tsx",
  "src/pages/HouseholdBudget.tsx",
  "src/utils/budgetAnalyzer.ts"
]
```

### 2. App.tsx でコメントアウトされたルート

```tsx
// Phase 13-14 実装時に有効化（現在は型エラーのため一時的に無効化）
// import HouseholdBudget from '@/pages/HouseholdBudget';

/* Phase 13-14 実装時に有効化
<Route
  path="/household-budget"
  element={
    <ProtectedRoute>
      <HouseholdBudget />
    </ProtectedRoute>
  }
/>
*/
```

---

## 再実装の方針

### Option A: ライフプラン用に作り直す（推奨）

**Phase 13 ライフプラン機能として再実装**

#### 設計方針
- `income_items` / `expense_items` は**年齢ベース**のライフプラン用として使用
- 家計収支管理（Phase 14）は**別テーブル**を作成
  - `budget_income_items`（月次・年次の収入）
  - `budget_expense_items`（月次・年次の支出）

#### 実装ステップ

1. **新しいテーブル作成**（Phase 14 用）
   ```sql
   -- supabase/migrations/002_budget_tables.sql

   CREATE TABLE IF NOT EXISTS public.budget_income_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     budget_id UUID NOT NULL REFERENCES budget_summaries(id) ON DELETE CASCADE,
     category TEXT NOT NULL,
     item_name TEXT NOT NULL,
     amount NUMERIC(15, 2) NOT NULL,
     frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'annual', 'one_time')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE IF NOT EXISTS public.budget_expense_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     budget_id UUID NOT NULL REFERENCES budget_summaries(id) ON DELETE CASCADE,
     category TEXT NOT NULL,
     item_name TEXT NOT NULL,
     amount NUMERIC(15, 2) NOT NULL,
     frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'annual', 'one_time')),
     is_fixed BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- RLS policies
   ALTER TABLE public.budget_income_items ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.budget_expense_items ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can manage own budget income items"
     ON public.budget_income_items FOR ALL
     USING (auth.uid() IN (
       SELECT user_id FROM budget_summaries WHERE id = budget_id
     ));

   CREATE POLICY "Users can manage own budget expense items"
     ON public.budget_expense_items FOR ALL
     USING (auth.uid() IN (
       SELECT user_id FROM budget_summaries WHERE id = budget_id
     ));
   ```

2. **新しい hooks を作成**（Phase 14 用）
   - `src/hooks/useBudgetIncomeItems.ts`（`budget_income_items` 用）
   - `src/hooks/useBudgetExpenseItems.ts`（`budget_expense_items` 用）

3. **既存のコンポーネントを修正**
   - `BudgetForm.tsx`: 新しい hooks を使用
   - `ExpenseItems.tsx`: 新しい hooks を使用
   - `IncomeItems.tsx`: 新しい hooks を使用
   - `budgetAnalyzer.ts`: 新しい型定義を使用

4. **ライフプラン用コンポーネントを新規作成**（Phase 13）
   - `src/components/FP/LifePlan/LifeEventForm.tsx`（ライフイベント管理）
   - `src/components/FP/LifePlan/CashFlowTimeline.tsx`（CF タイムライン）
   - `src/components/FP/LifePlan/IncomeExpenseManager.tsx`（年齢ベース収支管理）
   - `src/pages/LifePlan.tsx`（ライフプラン画面）

5. **tsconfig.json と App.tsx の復元**
   - `tsconfig.json` から `exclude` を削除
   - `App.tsx` で `HouseholdBudget` のコメントアウトを解除
   - `LifePlan` のルートを追加

---

### Option B: 既存のコンポーネントを修正して再利用

**Phase 14 家計収支管理として、現在の `income_items` / `expense_items` を使用**

#### 問題点
- `income_items` / `expense_items` は本来ライフプラン用（年齢ベース）
- 家計収支管理には `budget_id` や `frequency` が必要
- DBスキーマと型定義の不整合が再発する

#### 実装ステップ（非推奨）

1. **DBスキーマを拡張**
   ```sql
   ALTER TABLE public.income_items
     ADD COLUMN budget_id UUID REFERENCES budget_summaries(id),
     ADD COLUMN item_name TEXT,
     ADD COLUMN frequency TEXT CHECK (frequency IN ('monthly', 'annual', 'one_time'));

   ALTER TABLE public.expense_items
     ADD COLUMN budget_id UUID REFERENCES budget_summaries(id),
     ADD COLUMN item_name TEXT,
     ADD COLUMN frequency TEXT CHECK (frequency IN ('monthly', 'annual', 'one_time')),
     ADD COLUMN is_fixed BOOLEAN DEFAULT true;
   ```

2. **型定義を拡張**
   - `useIncomeItems.ts` と `useExpenseItems.ts` で後方互換性プロパティを正式化
   - `@deprecated` コメントを削除

3. **コンポーネントを修正**
   - 既存のコンポーネントをそのまま使用
   - 型エラーを解消

⚠️ **非推奨の理由**:
- Phase 13（ライフプラン）と Phase 14（家計収支）の目的が混在
- DBスキーマが複雑化
- 将来の拡張性が低下

---

## 推奨実装順序

### Phase 13: ライフプラン機能
1. ライフイベント管理（`life_events` テーブル使用）
2. 収入・支出管理（`income_items` / `expense_items` を年齢ベースで使用）
3. キャッシュフロー計算エンジン
4. タイムライン UI
5. グラフ可視化

### Phase 14: 家計収支管理
1. 新テーブル作成（`budget_income_items` / `budget_expense_items`）
2. 新 hooks 作成（`useBudgetIncomeItems` / `useBudgetExpenseItems`）
3. 既存コンポーネントの修正（新 hooks を使用）
4. 集計・分析ロジックの適用
5. カテゴリ別支出グラフ

---

## 後方互換性レイヤーの削除

Phase 13-14 実装完了後、以下の後方互換性レイヤーを削除してください：

### `useIncomeItems.ts`
```typescript
// 削除予定
// @deprecated - Use startAge/endAge instead
export type Frequency = 'monthly' | 'annual' | 'one_time';

// IncomeItem から削除予定
itemName?: string;
frequency?: Frequency;
budgetId?: string;

// CreateIncomeItemParams から削除予定
budgetId?: string;
itemName?: string;
frequency?: Frequency;

// UpdateIncomeItemParams から削除予定
itemName?: string;
frequency?: Frequency;

// useIncomeItems の警告メッセージ
if (budgetId) {
  console.warn('budgetId parameter is deprecated. Using user_id-based filtering instead.');
}
```

### `useExpenseItems.ts`
```typescript
// 同様の後方互換性レイヤーを削除
```

### `BudgetChart.tsx`
```typescript
// 一時的な型定義を削除
// import を復元
import type { CategorySummary, ExpenseStructure } from '@/utils/budgetAnalyzer';
```

---

## チェックリスト

### Phase 13 実装時
- [ ] ライフイベント管理コンポーネント作成
- [ ] 収入・支出管理（年齢ベース）コンポーネント作成
- [ ] キャッシュフロー計算エンジン実装
- [ ] タイムライン UI 実装
- [ ] LifePlan ページ作成
- [ ] ルーティング追加（`/life-plan`）

### Phase 14 実装時
- [ ] 新テーブル作成マイグレーション実行
- [ ] `useBudgetIncomeItems` / `useBudgetExpenseItems` hooks 作成
- [ ] `BudgetForm.tsx` を新 hooks に対応
- [ ] `ExpenseItems.tsx` を新 hooks に対応
- [ ] `IncomeItems.tsx` を新 hooks に対応
- [ ] `budgetAnalyzer.ts` を新型定義に対応
- [ ] `tsconfig.json` から `exclude` を削除
- [ ] `App.tsx` で `HouseholdBudget` ルートのコメントアウト解除

### 後方互換性レイヤー削除
- [ ] `useIncomeItems.ts` から `@deprecated` プロパティ削除
- [ ] `useExpenseItems.ts` から `@deprecated` プロパティ削除
- [ ] `BudgetChart.tsx` の一時的な型定義削除
- [ ] 全テスト実行（pass 確認）
- [ ] ビルド確認（エラーなし）

---

## 参考資料

- **Phase 13-14 実装チケット**: `docs/TICKETS_FP.md`
- **Supabase スキーマ**: `supabase/migrations/001_initial_schema.sql`
- **Phase 17 修正サマリー**: Git commit `f3310b7`

---

## まとめ

**推奨**: Option A（ライフプラン用に作り直す）

- Phase 13: 現在の `income_items` / `expense_items` を年齢ベースで使用
- Phase 14: 新テーブル `budget_income_items` / `budget_expense_items` を作成
- 後方互換性レイヤーは Phase 13-14 完了後に削除

この方針により、ライフプラン（Phase 13）と家計収支管理（Phase 14）を明確に分離し、将来の拡張性を確保できます。
