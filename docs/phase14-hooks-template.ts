/**
 * Phase 14 家計収支管理用 hooks テンプレート
 *
 * このファイルは Phase 14 実装時に参考にしてください。
 *
 * 作成するファイル:
 * - src/hooks/useBudgetIncomeItems.ts
 * - src/hooks/useBudgetExpenseItems.ts
 */

// =====================================================
// useBudgetIncomeItems.ts
// =====================================================

/**
 * useBudgetIncomeItems - 家計収支管理用の収入項目フック
 *
 * Phase 14 実装時に作成
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// 頻度
export type BudgetFrequency = 'monthly' | 'annual' | 'one_time';

// 収入カテゴリ
export type BudgetIncomeCategory = 'salary' | 'bonus' | 'side_income' | 'pension' | 'investment' | 'other';

// 収入項目（Phase 14 家計収支管理用）
export interface BudgetIncomeItem {
  id: string;
  budgetId: string;
  category: BudgetIncomeCategory;
  itemName: string;
  amount: number;
  frequency: BudgetFrequency;
  createdAt?: string;
  updatedAt?: string;
}

// 収入項目作成パラメータ
export interface CreateBudgetIncomeItemParams {
  budgetId: string;
  category: BudgetIncomeCategory;
  itemName: string;
  amount: number;
  frequency: BudgetFrequency;
}

// 収入項目更新パラメータ
export interface UpdateBudgetIncomeItemParams {
  category?: BudgetIncomeCategory;
  itemName?: string;
  amount?: number;
  frequency?: BudgetFrequency;
}

interface UseBudgetIncomeItemsReturn {
  incomeItems: BudgetIncomeItem[];
  loading: boolean;
  error: string | null;
  createIncomeItem: (params: CreateBudgetIncomeItemParams) => Promise<BudgetIncomeItem | null>;
  updateIncomeItem: (id: string, params: UpdateBudgetIncomeItemParams) => Promise<boolean>;
  deleteIncomeItem: (id: string) => Promise<boolean>;
  refreshIncomeItems: () => Promise<void>;
}

export const useBudgetIncomeItems = (budgetId?: string): UseBudgetIncomeItemsReturn => {
  const { user } = useAuth();
  const [incomeItems, setIncomeItems] = useState<BudgetIncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 収入項目一覧を取得
  const fetchIncomeItems = useCallback(async () => {
    if (!budgetId || !supabase) {
      setIncomeItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('budget_income_items')
        .select('*')
        .eq('budget_id', budgetId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setIncomeItems(
        (data || []).map((item) => ({
          id: item.id,
          budgetId: item.budget_id,
          category: item.category as BudgetIncomeCategory,
          itemName: item.item_name,
          amount: parseFloat(item.amount),
          frequency: item.frequency as BudgetFrequency,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }))
      );
    } catch (err) {
      console.error('Error fetching budget income items:', err);
      setError(err instanceof Error ? err.message : '収入項目の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  // 収入項目作成
  const createIncomeItem = async (
    params: CreateBudgetIncomeItemParams
  ): Promise<BudgetIncomeItem | null> => {
    if (!user || !supabase) {
      setError('ログインが必要です');
      return null;
    }

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('budget_income_items')
        .insert({
          budget_id: params.budgetId,
          category: params.category,
          item_name: params.itemName,
          amount: params.amount,
          frequency: params.frequency,
        })
        .select()
        .single();

      if (createError) throw createError;

      const newItem: BudgetIncomeItem = {
        id: data.id,
        budgetId: data.budget_id,
        category: data.category as BudgetIncomeCategory,
        itemName: data.item_name,
        amount: parseFloat(data.amount),
        frequency: data.frequency as BudgetFrequency,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setIncomeItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      console.error('Error creating budget income item:', err);
      setError(err instanceof Error ? err.message : '収入項目の作成に失敗しました');
      return null;
    }
  };

  // 収入項目更新
  const updateIncomeItem = async (
    id: string,
    params: UpdateBudgetIncomeItemParams
  ): Promise<boolean> => {
    if (!supabase) {
      setError('認証が設定されていません');
      return false;
    }

    try {
      setError(null);

      const updateData: Record<string, unknown> = {};
      if (params.category !== undefined) updateData.category = params.category;
      if (params.itemName !== undefined) updateData.item_name = params.itemName;
      if (params.amount !== undefined) updateData.amount = params.amount;
      if (params.frequency !== undefined) updateData.frequency = params.frequency;

      const { error: updateError } = await supabase
        .from('budget_income_items')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setIncomeItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...params } : item
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating budget income item:', err);
      setError(err instanceof Error ? err.message : '収入項目の更新に失敗しました');
      return false;
    }
  };

  // 収入項目削除
  const deleteIncomeItem = async (id: string): Promise<boolean> => {
    if (!supabase) {
      setError('認証が設定されていません');
      return false;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('budget_income_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setIncomeItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting budget income item:', err);
      setError(err instanceof Error ? err.message : '収入項目の削除に失敗しました');
      return false;
    }
  };

  // 初回ロード
  useEffect(() => {
    fetchIncomeItems();
  }, [fetchIncomeItems]);

  return {
    incomeItems,
    loading,
    error,
    createIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    refreshIncomeItems: fetchIncomeItems,
  };
};

// =====================================================
// useBudgetExpenseItems.ts
// =====================================================

/**
 * useBudgetExpenseItems - 家計収支管理用の支出項目フック
 *
 * Phase 14 実装時に作成
 */

// 支出カテゴリ
export type BudgetExpenseCategory =
  | 'food'           // 食費
  | 'housing'        // 住居費
  | 'utilities'      // 光熱費
  | 'transportation' // 交通費
  | 'communication'  // 通信費
  | 'insurance'      // 保険料
  | 'education'      // 教育費
  | 'entertainment'  // 娯楽費
  | 'medical'        // 医療費
  | 'other';         // その他

// 支出項目（Phase 14 家計収支管理用）
export interface BudgetExpenseItem {
  id: string;
  budgetId: string;
  category: BudgetExpenseCategory;
  itemName: string;
  amount: number;
  frequency: BudgetFrequency;
  isFixed: boolean;  // 固定費/変動費
  createdAt?: string;
  updatedAt?: string;
}

// 支出項目作成パラメータ
export interface CreateBudgetExpenseItemParams {
  budgetId: string;
  category: BudgetExpenseCategory;
  itemName: string;
  amount: number;
  frequency: BudgetFrequency;
  isFixed: boolean;
}

// 支出項目更新パラメータ
export interface UpdateBudgetExpenseItemParams {
  category?: BudgetExpenseCategory;
  itemName?: string;
  amount?: number;
  frequency?: BudgetFrequency;
  isFixed?: boolean;
}

interface UseBudgetExpenseItemsReturn {
  expenseItems: BudgetExpenseItem[];
  loading: boolean;
  error: string | null;
  createExpenseItem: (params: CreateBudgetExpenseItemParams) => Promise<BudgetExpenseItem | null>;
  updateExpenseItem: (id: string, params: UpdateBudgetExpenseItemParams) => Promise<boolean>;
  deleteExpenseItem: (id: string) => Promise<boolean>;
  refreshExpenseItems: () => Promise<void>;
}

export const useBudgetExpenseItems = (budgetId?: string): UseBudgetExpenseItemsReturn => {
  // 実装は useBudgetIncomeItems と同様
  // テーブル名を 'budget_expense_items' に変更
  // isFixed フィールドを追加
  // ...（省略）
};

// =====================================================
// 使用例
// =====================================================

/*
import { useBudgetIncomeItems } from '@/hooks/useBudgetIncomeItems';
import { useBudgetExpenseItems } from '@/hooks/useBudgetExpenseItems';

function HouseholdBudgetPage() {
  const budgetId = 'some-budget-id';

  const {
    incomeItems,
    createIncomeItem,
    loading: incomeLoading
  } = useBudgetIncomeItems(budgetId);

  const {
    expenseItems,
    createExpenseItem,
    loading: expenseLoading
  } = useBudgetExpenseItems(budgetId);

  // ...
}
*/
