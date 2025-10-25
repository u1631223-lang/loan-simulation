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

// 頻度（後方互換性のため一時的に保持、Phase 13-14 実装時に削除予定）
// @deprecated - Use startAge/endAge instead
export type Frequency = 'monthly' | 'annual' | 'one_time';

// 収入項目（ライフプラン用・年齢ベース）
export interface IncomeItem {
  id: string;
  userId: string;
  category: IncomeCategory;
  name: string;
  amount: number;
  startAge?: number;
  endAge?: number;
  createdAt?: string;

  // 後方互換性のため一時的に保持（Phase 13-14 実装時に削除予定）
  // @deprecated - Use name instead
  itemName?: string;
  // @deprecated - Use startAge/endAge instead
  frequency?: Frequency;
  budgetId?: string;
}

// 収入項目作成パラメータ
export interface CreateIncomeItemParams {
  category: IncomeCategory;
  name: string;
  amount: number;
  startAge?: number;
  endAge?: number;

  // 後方互換性のため一時的に保持（Phase 13-14 実装時に削除予定）
  // @deprecated
  budgetId?: string;
  itemName?: string;
  frequency?: Frequency;
}

// 収入項目更新パラメータ
export interface UpdateIncomeItemParams {
  category?: IncomeCategory;
  name?: string;
  amount?: number;
  startAge?: number;
  endAge?: number;

  // 後方互換性のため一時的に保持（Phase 13-14 実装時に削除予定）
  // @deprecated
  itemName?: string;
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

  // budgetId は後方互換性のため受け付けるが、現在は user_id ベースで動作
  // Phase 13-14 実装時に削除予定
  if (budgetId) {
    console.warn('budgetId parameter is deprecated. Using user_id-based filtering instead.');
  }

  // 収入項目一覧を取得
  const fetchIncomeItems = useCallback(async () => {
    if (!user || !supabase) {
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setIncomeItems(
        (data || []).map((item) => ({
          id: item.id,
          userId: item.user_id,
          category: item.category as IncomeCategory,
          name: item.name,
          amount: parseFloat(item.amount),
          startAge: item.start_age,
          endAge: item.end_age,
          createdAt: item.created_at,
        }))
      );
    } catch (err) {
      console.error('Error fetching income items:', err);
      setError(err instanceof Error ? err.message : '収入項目の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 収入項目作成
  const createIncomeItem = async (
    params: CreateIncomeItemParams
  ): Promise<IncomeItem | null> => {
    if (!user || !supabase) {
      setError('ログインが必要です');
      return null;
    }

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('income_items')
        .insert({
          user_id: user.id,
          category: params.category,
          name: params.name,
          amount: params.amount,
          start_age: params.startAge,
          end_age: params.endAge,
        })
        .select()
        .single();

      if (createError) throw createError;

      const newItem: IncomeItem = {
        id: data.id,
        userId: data.user_id,
        category: data.category as IncomeCategory,
        name: data.name,
        amount: parseFloat(data.amount),
        startAge: data.start_age,
        endAge: data.end_age,
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
    if (!supabase) {
      setError('認証が設定されていません');
      return false;
    }

    try {
      setError(null);

      const updateData: Record<string, unknown> = {};
      if (params.category !== undefined) updateData.category = params.category;
      if (params.name !== undefined) updateData.name = params.name;
      if (params.amount !== undefined) updateData.amount = params.amount;
      if (params.startAge !== undefined) updateData.start_age = params.startAge;
      if (params.endAge !== undefined) updateData.end_age = params.endAge;

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
    if (!supabase) {
      setError('認証が設定されていません');
      return false;
    }

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
