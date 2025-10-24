# TICKET-1302 収入・支出データ管理実装 - 完了レポート

## 📋 タスク概要

**Phase 13** ライフプランシミュレーションの一環として、収入・支出項目の完全なCRUD機能を実装しました。

**実装日**: 2025-10-25  
**所要時間**: 約2時間  
**ステータス**: ✅ **完了**

---

## 🎯 実装目標

1. ✅ 収入項目の管理（給与・賞与・副収入・年金など）
2. ✅ 支出項目の管理（食費・住居費・光熱費・通信費など）
3. ✅ 月次・年次・単発の頻度設定
4. ✅ 固定費・変動費の区別
5. ✅ Supabase連携（RLS適用）

---

## 📦 成果物

### 新規作成ファイル（5ファイル）

| ファイル | サイズ | 説明 |
|---------|--------|------|
| `src/hooks/useIncomeItems.ts` | 5.9 KB | 収入項目CRUD hook |
| `src/hooks/useExpenseItems.ts` | 6.4 KB | 支出項目CRUD hook |
| `src/components/FP/Household/IncomeItems.tsx` | 12.6 KB | 収入項目UI |
| `src/components/FP/Household/ExpenseItems.tsx` | 15.2 KB | 支出項目UI |
| `src/pages/HouseholdBudget.tsx` | 3.8 KB | デモページ（統合例）|
| **合計** | **43.9 KB** | |

---

## 🏗️ アーキテクチャ

### データフロー

```
┌─────────────────────────────────────────────────┐
│           HouseholdBudget Page                  │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  IncomeItems     │  │  ExpenseItems    │   │
│  │  Component       │  │  Component       │   │
│  └────────┬─────────┘  └────────┬─────────┘   │
│           │                     │               │
└───────────┼─────────────────────┼───────────────┘
            │                     │
            ▼                     ▼
    ┌───────────────┐     ┌────────────────┐
    │useIncomeItems │     │useExpenseItems │
    │     Hook      │     │      Hook      │
    └───────┬───────┘     └────────┬───────┘
            │                      │
            └──────────┬───────────┘
                       ▼
              ┌─────────────────┐
              │  Supabase SDK   │
              └────────┬────────┘
                       ▼
         ┌──────────────────────────┐
         │  PostgreSQL + RLS        │
         │  - income_items          │
         │  - expense_items         │
         │  - household_budgets     │
         └──────────────────────────┘
```

---

## 🎨 UI/UX設計

### 収入項目（IncomeItems.tsx）

#### カテゴリ選択（6種類）
```
┌─────────────────────────────────────────┐
│ [💼 給与] [🎁 賞与] [💡 副収入]        │
│ [🏦 年金] [📈 投資] [💰 その他]        │
└─────────────────────────────────────────┘
```

#### 頻度選択
```
[毎月] [年1回] [単発]
```

#### 一覧表示
```
┌────────────────────────────────────────────────┐
│ 💼 給与 | 毎月                                  │
│ 基本給                                         │
│ 月額: 300,000円                        [編集] [削除] │
├────────────────────────────────────────────────┤
│ 🎁 賞与 | 年1回                                 │
│ 夏季賞与                                       │
│ 年額: 600,000円 (月換算: 50,000円)    [編集] [削除] │
└────────────────────────────────────────────────┘

月次合計: 350,000円
```

### 支出項目（ExpenseItems.tsx）

#### カテゴリ選択（10種類）
```
┌─────────────────────────────────────────────────┐
│ [🍽️ 食費] [🏠 住居] [💡 光熱] [🚗 交通]      │
│ [📱 通信] [🛡️ 保険] [📚 教育] [🎮 娯楽]      │
│ [🏥 医療] [💸 その他]                          │
└─────────────────────────────────────────────────┘
```

#### 固定費・変動費の区別
```
☑ 固定費として扱う

固定費: 毎月金額が変わらない費用（住居費・通信費など）
変動費: 毎月金額が変動する費用（食費・娯楽費など）
```

#### 一覧表示
```
┌─────────────────────────────────────────────────┐
│ 🏠 住居費 | 毎月 | 固定費                         │
│ マンション家賃                                   │
│ 月額: 120,000円                        [編集] [削除] │
├─────────────────────────────────────────────────┤
│ 🍽️ 食費 | 毎月 | 変動費                          │
│ 食料品                                          │
│ 月額: 60,000円                         [編集] [削除] │
└─────────────────────────────────────────────────┘

月次合計: 180,000円
固定費: 120,000円 | 変動費: 60,000円
```

---

## 🔧 技術仕様

### 収入カテゴリ
```typescript
type IncomeCategory = 
  | 'salary'       // 💼 給与
  | 'bonus'        // 🎁 賞与
  | 'side_income'  // 💡 副収入
  | 'pension'      // 🏦 年金
  | 'investment'   // 📈 投資収益
  | 'other';       // 💰 その他
```

### 支出カテゴリ
```typescript
type ExpenseCategory =
  | 'food'           // 🍽️ 食費
  | 'housing'        // 🏠 住居費
  | 'utilities'      // 💡 光熱費
  | 'transportation' // 🚗 交通費
  | 'communication'  // 📱 通信費
  | 'insurance'      // 🛡️ 保険料
  | 'education'      // 📚 教育費
  | 'entertainment'  // 🎮 娯楽費
  | 'medical'        // 🏥 医療費
  | 'other';         // 💸 その他
```

### 頻度
```typescript
type Frequency = 
  | 'monthly'   // 毎月
  | 'annual'    // 年1回
  | 'one_time'; // 単発
```

---

## 🔐 セキュリティ

### Row Level Security (RLS)

すべてのテーブルにRLSポリシーを適用し、ユーザーは自分のデータのみアクセス可能。

```sql
-- Income Items
CREATE POLICY "Users can manage own income items"
  ON public.income_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.household_budgets
      WHERE household_budgets.id = income_items.budget_id
      AND household_budgets.user_id = auth.uid()
    )
  );

-- Expense Items
CREATE POLICY "Users can manage own expense items"
  ON public.expense_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.household_budgets
      WHERE household_budgets.id = expense_items.budget_id
      AND household_budgets.user_id = auth.uid()
    )
  );
```

---

## 🧪 テスト結果

### TypeScript型チェック
```bash
$ npm run type-check
✅ PASSED - エラーなし
```

### 手動テスト項目

#### 収入項目
- [x] 収入項目の追加
- [x] カテゴリ選択（6種類）
- [x] 頻度選択（毎月/年1回/単発）
- [x] 金額入力
- [x] 年次金額の月換算プレビュー
- [x] 収入項目の編集
- [x] 収入項目の削除（確認ダイアログ）
- [x] 月次合計の表示
- [x] エラーハンドリング

#### 支出項目
- [x] 支出項目の追加
- [x] カテゴリ選択（10種類）
- [x] 頻度選択（毎月/年1回/単発）
- [x] 金額入力
- [x] 固定費・変動費チェックボックス
- [x] 年次金額の月換算プレビュー
- [x] 支出項目の編集
- [x] 支出項目の削除（確認ダイアログ）
- [x] 月次合計の表示（固定費・変動費内訳付き）
- [x] エラーハンドリング

---

## 📱 レスポンシブ対応

### ブレークポイント

| デバイス | カテゴリグリッド | 頻度ボタン |
|---------|----------------|-----------|
| モバイル (< 640px) | 3列 | 3列 |
| タブレット (640px+) | 3列 | 3列 |
| PC (768px+) | 3列 | 3列 |

### モーダルサイズ
- 最大幅: 28rem (448px)
- 最大高: 90vh (スクロール可能)

---

## 💡 実装のポイント

### 1. 月次換算機能
年次金額を自動で月次に換算して表示
```typescript
const getMonthlyAmount = (item: IncomeItem): number => {
  if (item.frequency === 'monthly') return item.amount;
  if (item.frequency === 'annual') return item.amount / 12;
  return 0; // one_time は月次換算しない
};
```

### 2. カテゴリアイコン
絵文字を使用して視覚的にわかりやすく
```typescript
const INCOME_CATEGORIES: Record<IncomeCategory, { label: string; icon: string }> = {
  salary: { label: '給与', icon: '💼' },
  bonus: { label: '賞与', icon: '🎁' },
  // ...
};
```

### 3. カラーコーディング
- 収入: 青色系（`bg-blue-600`, `text-blue-700`）
- 支出: 赤色系（`bg-red-600`, `text-red-700`）
- 固定費: 青バッジ（`bg-blue-100`）
- 変動費: オレンジバッジ（`bg-orange-100`）

### 4. エラーハンドリング
```typescript
try {
  const { data, error } = await supabase.from('income_items').insert(...);
  if (error) throw error;
  // 成功処理
} catch (err) {
  console.error('Error:', err);
  setError(err instanceof Error ? err.message : 'エラーが発生しました');
}
```

---

## 📚 使用方法

### 基本的な使い方
```tsx
import IncomeItems from '@/components/FP/Household/IncomeItems';
import ExpenseItems from '@/components/FP/Household/ExpenseItems';

function HouseholdBudgetPage() {
  const budgetId = 'your-budget-id'; // 実際はAPIから取得

  return (
    <div>
      <IncomeItems budgetId={budgetId} />
      <ExpenseItems budgetId={budgetId} />
    </div>
  );
}
```

### Hookの使い方
```tsx
import { useIncomeItems } from '@/hooks/useIncomeItems';

function MyComponent() {
  const { 
    incomeItems, 
    loading, 
    error, 
    createIncomeItem, 
    updateIncomeItem, 
    deleteIncomeItem 
  } = useIncomeItems(budgetId);

  // 収入項目を追加
  const handleCreate = async () => {
    await createIncomeItem({
      budgetId: 'budget-id',
      category: 'salary',
      itemName: '基本給',
      amount: 300000,
      frequency: 'monthly',
    });
  };
}
```

---

## 🚀 今後の展開

### Phase 13 残タスク

| チケット | タスク | 見積 |
|---------|--------|------|
| TICKET-1303 | キャッシュフロー計算エンジン実装 | 2日 |
| TICKET-1304 | タイムラインUI実装 | 2日 |
| TICKET-1305 | グラフ・ビジュアライゼーション実装 | 2日 |

### Phase 14: 家計収支シミュレーション
- 月次収支入力フォーム
- 集計・分析ロジック
- カテゴリ別支出グラフ
- 年間収支サマリー

---

## 📝 実装メモ

### 参考にしたコード
- `src/components/FP/LifeEvent/LifeEventForm.tsx` - フォームUI
- `src/hooks/useLifeEvents.ts` - CRUD hook
- `src/types/lifePlan.ts` - 型定義

### 既存コードとの整合性
- ✅ 既存のlifePlanコンポーネントと同じUIパターン
- ✅ 既存のhookパターンを踏襲
- ✅ Tailwind CSSのカラースキームを統一
- ✅ エラーハンドリングの一貫性

### 改善の余地
1. **リアルタイム集計**: 収入・支出の合計をリアルタイム計算
2. **バリデーション強化**: 金額の上限チェック、重複チェック
3. **ソート機能**: カテゴリ別、金額順ソート
4. **フィルタ機能**: 固定費のみ表示など
5. **エクスポート機能**: CSV/Excelエクスポート

---

## ✅ チェックリスト

### 実装完了項目
- [x] useIncomeItems hook作成
- [x] useExpenseItems hook作成
- [x] IncomeItems component作成
- [x] ExpenseItems component作成
- [x] HouseholdBudget デモページ作成
- [x] TypeScript型チェック通過
- [x] カテゴリアイコン実装
- [x] 頻度選択実装
- [x] 固定費・変動費実装
- [x] 月次換算機能実装
- [x] CRUD機能実装
- [x] エラーハンドリング実装
- [x] レスポンシブデザイン実装
- [x] RLS適用確認
- [x] ドキュメント作成

### 次のステップ
- [ ] TICKET-1303: キャッシュフロー計算エンジン実装
- [ ] TICKET-1304: タイムラインUI実装
- [ ] TICKET-1305: グラフ・ビジュアライゼーション実装

---

## 🎉 まとめ

**TICKET-1302** の実装により、収入・支出項目の完全なCRUD機能が完成しました。

**主な成果:**
- 📦 5つの新規ファイル（43.9 KB）
- 🎨 直感的なUI（カテゴリアイコン、カラーコーディング）
- 🔐 セキュアな実装（Supabase RLS適用）
- 💡 便利な機能（月次換算、固定費・変動費区別）
- 📱 レスポンシブデザイン
- ✅ TypeScript型安全

**次のマイルストーン:**
Phase 13の残タスク（TICKET-1303-1305）を完了し、ライフプランシミュレーションの基盤を完成させます。

---

**作成日**: 2025-10-25  
**作成者**: Claude Code  
**レビュー**: Pending
