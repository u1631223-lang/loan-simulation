/**
 * useHistory - 履歴管理用カスタムフック
 */

import { useCallback } from 'react';
import { useLoanContext } from '@/contexts/LoanContext';

/**
 * 履歴管理フック
 */
export const useHistory = () => {
  const {
    history,
    loadFromHistory,
    clearHistory,
    removeHistoryItem,
  } = useLoanContext();

  /**
   * 履歴アイテムを読み込み
   */
  const handleLoadHistory = useCallback(
    (historyId: string) => {
      loadFromHistory(historyId);
    },
    [loadFromHistory]
  );

  /**
   * 履歴全体をクリア
   */
  const handleClearHistory = useCallback(() => {
    if (window.confirm('すべての履歴を削除しますか？')) {
      clearHistory();
    }
  }, [clearHistory]);

  /**
   * 履歴アイテムを削除
   */
  const handleRemoveItem = useCallback(
    (historyId: string) => {
      removeHistoryItem(historyId);
    },
    [removeHistoryItem]
  );

  return {
    history,
    loadHistory: handleLoadHistory,
    clearHistory: handleClearHistory,
    removeItem: handleRemoveItem,
  };
};
