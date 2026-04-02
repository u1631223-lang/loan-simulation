/**
 * useExpenseItems - 支出項目管理フック
 *
 * 支出項目のCRUD操作を提供
 */

import { useState } from 'react';
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

// 支出項目（ライフプラン用・年齢ベース）
export interface ExpenseItem {
  id: string;
  userId: string;
  category: ExpenseCategory;
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
  isFixed?: boolean;
  budgetId?: string;
}

// 支出項目作成パラメータ
export interface CreateExpenseItemParams {
  category: ExpenseCategory;
  name: string;
  amount: number;
  startAge?: number;
  endAge?: number;

  // 後方互換性のため一時的に保持（Phase 13-14 実装時に削除予定）
  // @deprecated
  budgetId?: string;
  itemName?: string;
  frequency?: Frequency;
  isFixed?: boolean;
}

// 支出項目更新パラメータ
export interface UpdateExpenseItemParams {
  category?: ExpenseCategory;
  name?: string;
  amount?: number;
  startAge?: number;
  endAge?: number;

  // 後方互換性のため一時的に保持（Phase 13-14 実装時に削除予定）
  // @deprecated
  itemName?: string;
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

/**
 * 認証撤廃に伴い、ローカルステートのみで動作。
 * Supabase連携は無効化。
 */
export const useExpenseItems = (_budgetId?: string): UseExpenseItemsReturn => {
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createExpenseItem = async (
    params: CreateExpenseItemParams
  ): Promise<ExpenseItem | null> => {
    const newItem: ExpenseItem = {
      id: `expense-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: 'local',
      category: params.category,
      name: params.name,
      amount: params.amount,
      startAge: params.startAge,
      endAge: params.endAge,
      createdAt: new Date().toISOString(),
    };
    setExpenseItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateExpenseItem = async (
    id: string,
    params: UpdateExpenseItemParams
  ): Promise<boolean> => {
    setExpenseItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...params } : item
      )
    );
    return true;
  };

  const deleteExpenseItem = async (id: string): Promise<boolean> => {
    setExpenseItems((prev) => prev.filter((item) => item.id !== id));
    return true;
  };

  const refreshExpenseItems = async () => {};

  // Suppress unused setter warning
  void setError;

  return {
    expenseItems,
    loading: false,
    error,
    createExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
    refreshExpenseItems,
  };
};
