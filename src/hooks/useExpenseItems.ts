/**
 * useExpenseItems - 支出項目管理フック
 *
 * 支出項目のCRUD操作を提供
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Frequency } from './useIncomeItems';

// 支出カテゴリ
export type ExpenseCategory =
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

// 支出項目
export interface ExpenseItem {
  id: string;
  budgetId: string;
  category: ExpenseCategory;
  itemName: string;
  amount: number;
  frequency: Frequency;
  isFixed: boolean;
  createdAt?: string;
}

// 支出項目作成パラメータ
export interface CreateExpenseItemParams {
  budgetId: string;
  category: ExpenseCategory;
  itemName: string;
  amount: number;
  frequency: Frequency;
  isFixed: boolean;
}

// 支出項目更新パラメータ
export interface UpdateExpenseItemParams {
  category?: ExpenseCategory;
  itemName?: string;
  amount?: number;
  frequency?: Frequency;
  isFixed?: boolean;
}

interface UseExpenseItemsReturn {
  expenseItems: ExpenseItem[];
  loading: boolean;
  error: string | null;
  createExpenseItem: (params: CreateExpenseItemParams) => Promise<ExpenseItem | null>;
  updateExpenseItem: (id: string, params: UpdateExpenseItemParams) => Promise<boolean>;
  deleteExpenseItem: (id: string) => Promise<boolean>;
  refreshExpenseItems: () => Promise<void>;
}

export const useExpenseItems = (budgetId?: string): UseExpenseItemsReturn => {
  const { user } = useAuth();
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 支出項目一覧を取得
  const fetchExpenseItems = useCallback(async () => {
    if (!budgetId || !supabase) {
      setExpenseItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('expense_items')
        .select('*')
        .eq('budget_id', budgetId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setExpenseItems(
        (data || []).map((item) => ({
          id: item.id,
          budgetId: item.budget_id,
          category: item.category as ExpenseCategory,
          itemName: item.item_name,
          amount: parseFloat(item.amount),
          frequency: item.frequency as Frequency,
          isFixed: item.is_fixed,
          createdAt: item.created_at,
        }))
      );
    } catch (err) {
      console.error('Error fetching expense items:', err);
      setError(err instanceof Error ? err.message : '支出項目の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  // 支出項目作成
  const createExpenseItem = async (
    params: CreateExpenseItemParams
  ): Promise<ExpenseItem | null> => {
    if (!user || !supabase) {
      setError('ログインが必要です');
      return null;
    }

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('expense_items')
        .insert({
          budget_id: params.budgetId,
          category: params.category,
          item_name: params.itemName,
          amount: params.amount,
          frequency: params.frequency,
          is_fixed: params.isFixed,
        })
        .select()
        .single();

      if (createError) throw createError;

      const newItem: ExpenseItem = {
        id: data.id,
        budgetId: data.budget_id,
        category: data.category as ExpenseCategory,
        itemName: data.item_name,
        amount: parseFloat(data.amount),
        frequency: data.frequency as Frequency,
        isFixed: data.is_fixed,
        createdAt: data.created_at,
      };

      setExpenseItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      console.error('Error creating expense item:', err);
      setError(err instanceof Error ? err.message : '支出項目の作成に失敗しました');
      return null;
    }
  };

  // 支出項目更新
  const updateExpenseItem = async (
    id: string,
    params: UpdateExpenseItemParams
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
      if (params.isFixed !== undefined) updateData.is_fixed = params.isFixed;

      const { error: updateError } = await supabase
        .from('expense_items')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setExpenseItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...params } : item
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating expense item:', err);
      setError(err instanceof Error ? err.message : '支出項目の更新に失敗しました');
      return false;
    }
  };

  // 支出項目削除
  const deleteExpenseItem = async (id: string): Promise<boolean> => {
    if (!supabase) {
      setError('認証が設定されていません');
      return false;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('expense_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setExpenseItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting expense item:', err);
      setError(err instanceof Error ? err.message : '支出項目の削除に失敗しました');
      return false;
    }
  };

  // 初回ロード
  useEffect(() => {
    fetchExpenseItems();
  }, [fetchExpenseItems]);

  return {
    expenseItems,
    loading,
    error,
    createExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
    refreshExpenseItems: fetchExpenseItems,
  };
};
