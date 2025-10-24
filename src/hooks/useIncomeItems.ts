/**
 * useIncomeItems - 収入項目管理フック
 *
 * 収入項目のCRUD操作を提供
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// 収入カテゴリ
export type IncomeCategory = 'salary' | 'bonus' | 'side_income' | 'pension' | 'investment' | 'other';

// 頻度
export type Frequency = 'monthly' | 'annual' | 'one_time';

// 収入項目
export interface IncomeItem {
  id: string;
  budgetId: string;
  category: IncomeCategory;
  itemName: string;
  amount: number;
  frequency: Frequency;
  createdAt?: string;
}

// 収入項目作成パラメータ
export interface CreateIncomeItemParams {
  budgetId: string;
  category: IncomeCategory;
  itemName: string;
  amount: number;
  frequency: Frequency;
}

// 収入項目更新パラメータ
export interface UpdateIncomeItemParams {
  category?: IncomeCategory;
  itemName?: string;
  amount?: number;
  frequency?: Frequency;
}

interface UseIncomeItemsReturn {
  incomeItems: IncomeItem[];
  loading: boolean;
  error: string | null;
  createIncomeItem: (params: CreateIncomeItemParams) => Promise<IncomeItem | null>;
  updateIncomeItem: (id: string, params: UpdateIncomeItemParams) => Promise<boolean>;
  deleteIncomeItem: (id: string) => Promise<boolean>;
  refreshIncomeItems: () => Promise<void>;
}

export const useIncomeItems = (budgetId?: string): UseIncomeItemsReturn => {
  const { user } = useAuth();
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 収入項目一覧を取得
  const fetchIncomeItems = useCallback(async () => {
    if (!budgetId) {
      setIncomeItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('income_items')
        .select('*')
        .eq('budget_id', budgetId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setIncomeItems(
        (data || []).map((item) => ({
          id: item.id,
          budgetId: item.budget_id,
          category: item.category as IncomeCategory,
          itemName: item.item_name,
          amount: parseFloat(item.amount),
          frequency: item.frequency as Frequency,
          createdAt: item.created_at,
        }))
      );
    } catch (err) {
      console.error('Error fetching income items:', err);
      setError(err instanceof Error ? err.message : '収入項目の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  // 収入項目作成
  const createIncomeItem = async (
    params: CreateIncomeItemParams
  ): Promise<IncomeItem | null> => {
    if (!user) {
      setError('ログインが必要です');
      return null;
    }

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('income_items')
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

      const newItem: IncomeItem = {
        id: data.id,
        budgetId: data.budget_id,
        category: data.category as IncomeCategory,
        itemName: data.item_name,
        amount: parseFloat(data.amount),
        frequency: data.frequency as Frequency,
        createdAt: data.created_at,
      };

      setIncomeItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      console.error('Error creating income item:', err);
      setError(err instanceof Error ? err.message : '収入項目の作成に失敗しました');
      return null;
    }
  };

  // 収入項目更新
  const updateIncomeItem = async (
    id: string,
    params: UpdateIncomeItemParams
  ): Promise<boolean> => {
    try {
      setError(null);

      const updateData: Record<string, unknown> = {};
      if (params.category !== undefined) updateData.category = params.category;
      if (params.itemName !== undefined) updateData.item_name = params.itemName;
      if (params.amount !== undefined) updateData.amount = params.amount;
      if (params.frequency !== undefined) updateData.frequency = params.frequency;

      const { error: updateError } = await supabase
        .from('income_items')
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
      console.error('Error updating income item:', err);
      setError(err instanceof Error ? err.message : '収入項目の更新に失敗しました');
      return false;
    }
  };

  // 収入項目削除
  const deleteIncomeItem = async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('income_items')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setIncomeItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting income item:', err);
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
