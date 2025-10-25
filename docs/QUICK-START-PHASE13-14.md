# Phase 13-14 実装クイックスタート

> Phase 17 修正完了後、Phase 13（ライフプラン）と Phase 14（家計収支管理）を実装する際のクイックガイドです。

## 📚 参考ドキュメント

1. **[PHASE13-14-REIMPLEMENTATION.md](./PHASE13-14-REIMPLEMENTATION.md)** - 詳細な再実装ガイド（推奨方針、実装ステップ、チェックリスト）
2. **[phase14-migration-template.sql](./phase14-migration-template.sql)** - Phase 14 用のマイグレーションSQL
3. **[phase14-hooks-template.ts](./phase14-hooks-template.ts)** - Phase 14 用の hooks テンプレート
4. **[PHASE17-FIX-SUMMARY.md](./PHASE17-FIX-SUMMARY.md)** - Phase 17 修正内容のサマリー

---

## 🚀 クイックスタート

### Phase 13: ライフプラン機能（推奨: 先に実装）

#### 使用するテーブル
- `life_events`（ライフイベント管理）
- `income_items`（年齢ベースの収入）
- `expense_items`（年齢ベースの支出）

#### 実装内容
1. ライフイベント管理UI
2. 収入・支出管理UI（年齢ベース）
3. キャッシュフロー計算エンジン
4. タイムラインUI
5. グラフ可視化

#### 作成するファイル
```
src/
├── components/FP/LifePlan/
│   ├── LifeEventForm.tsx          # ライフイベント入力
│   ├── CashFlowTimeline.tsx       # CF タイムライン
│   └── IncomeExpenseManager.tsx   # 年齢ベース収支管理
├── pages/
│   └── LifePlan.tsx               # ライフプラン画面
└── hooks/
    ├── useLifeEvents.ts           # ライフイベント管理
    └── (既存) useIncomeItems.ts   # 収入管理（年齢ベース）
    └── (既存) useExpenseItems.ts  # 支出管理（年齢ベース）
```

#### ルーティング追加
```tsx
// src/App.tsx
import LifePlan from '@/pages/LifePlan';

<Route
  path="/life-plan"
  element={
    <ProtectedRoute>
      <LifePlan />
    </ProtectedRoute>
  }
/>
```

---

### Phase 14: 家計収支管理（Phase 13 完了後）

#### 新しいテーブルを作成
```bash
# 1. マイグレーションファイル作成
supabase migration new budget_items_tables

# 2. docs/phase14-migration-template.sql の内容をコピー

# 3. マイグレーション適用
supabase db push
```

#### 新しい hooks を作成
```bash
# docs/phase14-hooks-template.ts を参考に作成
src/hooks/useBudgetIncomeItems.ts
src/hooks/useBudgetExpenseItems.ts
```

#### 既存コンポーネントを修正
以下のファイルを新しい hooks（`useBudgetIncomeItems` / `useBudgetExpenseItems`）に対応：

```
src/components/FP/Household/BudgetForm.tsx
src/components/FP/Household/ExpenseItems.tsx
src/components/FP/Household/IncomeItems.tsx
src/utils/budgetAnalyzer.ts
```

#### tsconfig.json と App.tsx を復元

**tsconfig.json**:
```json
// "exclude" を削除
"include": ["src"],
"references": [{ "path": "./tsconfig.node.json" }]
```

**App.tsx**:
```tsx
// コメントアウトを解除
import HouseholdBudget from '@/pages/HouseholdBudget';

<Route
  path="/household-budget"
  element={
    <ProtectedRoute>
      <HouseholdBudget />
    </ProtectedRoute>
  }
/>
```

---

## 🧹 後方互換性レイヤーの削除

Phase 13-14 実装完了後、以下を削除：

### useIncomeItems.ts / useExpenseItems.ts
```typescript
// 削除
export type Frequency = 'monthly' | 'annual' | 'one_time';

// IncomeItem から削除
itemName?: string;
frequency?: Frequency;
budgetId?: string;

// ExpenseItem から削除
itemName?: string;
frequency?: Frequency;
isFixed?: boolean;
budgetId?: string;

// CreateIncomeItemParams / CreateExpenseItemParams から削除
budgetId?: string;
itemName?: string;
frequency?: Frequency;
isFixed?: boolean;  // ExpenseItem only

// UpdateIncomeItemParams / UpdateExpenseItemParams から削除
itemName?: string;
frequency?: Frequency;
isFixed?: boolean;  // ExpenseItem only

// hooks の警告メッセージを削除
if (budgetId) {
  console.warn('budgetId parameter is deprecated...');
}
```

### BudgetChart.tsx
```typescript
// 一時的な型定義を削除
// import を復元
import type { CategorySummary, ExpenseStructure } from '@/utils/budgetAnalyzer';
```

---

## ✅ 最終チェックリスト

### Phase 13 完了時
- [ ] ライフイベント管理UI実装
- [ ] 収入・支出管理（年齢ベース）UI実装
- [ ] キャッシュフロー計算エンジン実装
- [ ] タイムラインUI実装
- [ ] LifePlan ページ作成
- [ ] ルーティング追加（`/life-plan`）
- [ ] テスト実行（pass 確認）
- [ ] ビルド確認（エラーなし）

### Phase 14 完了時
- [ ] 新テーブル作成マイグレーション実行
- [ ] `useBudgetIncomeItems` / `useBudgetExpenseItems` hooks 作成
- [ ] `BudgetForm.tsx` を新 hooks に対応
- [ ] `ExpenseItems.tsx` を新 hooks に対応
- [ ] `IncomeItems.tsx` を新 hooks に対応
- [ ] `budgetAnalyzer.ts` を新型定義に対応
- [ ] `tsconfig.json` から `exclude` を削除
- [ ] `App.tsx` で `HouseholdBudget` ルートのコメントアウト解除
- [ ] テスト実行（pass 確認）
- [ ] ビルド確認（エラーなし）

### 後方互換性レイヤー削除時
- [ ] `useIncomeItems.ts` から `@deprecated` プロパティ削除
- [ ] `useExpenseItems.ts` から `@deprecated` プロパティ削除
- [ ] `BudgetChart.tsx` の一時的な型定義削除
- [ ] 全テスト実行（pass 確認）
- [ ] ビルド確認（エラーなし）
- [ ] Git commit & push

---

## 💡 Tips

1. **Phase 13 を先に実装する理由**
   - `income_items` / `expense_items` は既にライフプラン用の設計
   - Phase 14 は新テーブルを作成するため、Phase 13 と並行して進められる
   - Phase 13 完了後、Phase 14 のマイグレーションを実行すればOK

2. **テーブル設計の分離**
   - ライフプラン（Phase 13）: 年齢ベース、長期的な計画
   - 家計収支（Phase 14）: 月次・年次ベース、短期的な管理
   - 目的が異なるため、別テーブルで管理するのが最適

3. **後方互換性レイヤーの削除タイミング**
   - Phase 13-14 の実装が完了し、テストが全て pass してから削除
   - 削除前に必ずバックアップを取得
   - Git commit を細かく分けて、問題があればロールバック可能にする

---

## 📞 困ったときは

- **PHASE13-14-REIMPLEMENTATION.md** に詳細な実装ステップとトラブルシューティングを記載
- **PHASE17-FIX-SUMMARY.md** に Phase 17 修正内容と背景を記載
- Git history を確認（commit `f3310b7`）

Good luck! 🚀
