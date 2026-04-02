/**
 * useIncomeItems - 収入項目管理フック
 *
 * 収入項目のCRUD操作を提供
 */

import { useState } from 'react';

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

/**
 * 認証撤廃に伴い、ローカルステートのみで動作。
 * Supabase連携は無効化。
 */
export const useIncomeItems = (_budgetId?: string): UseIncomeItemsReturn => {
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createIncomeItem = async (
    params: CreateIncomeItemParams
  ): Promise<IncomeItem | null> => {
    const newItem: IncomeItem = {
      id: `income-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: 'local',
      category: params.category,
      name: params.name,
      amount: params.amount,
      startAge: params.startAge,
      endAge: params.endAge,
      createdAt: new Date().toISOString(),
    };
    setIncomeItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateIncomeItem = async (
    id: string,
    params: UpdateIncomeItemParams
  ): Promise<boolean> => {
    setIncomeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...params } : item
      )
    );
    return true;
  };

  const deleteIncomeItem = async (id: string): Promise<boolean> => {
    setIncomeItems((prev) => prev.filter((item) => item.id !== id));
    return true;
  };

  const refreshIncomeItems = async () => {};

  // Suppress unused setter warning
  void setError;

  return {
    incomeItems,
    loading: false,
    error,
    createIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    refreshIncomeItems,
  };
};
