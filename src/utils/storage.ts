/**
 * localStorage ユーティリティ
 *
 * ローン計算の履歴と設定をlocalStorageに保存
 */

import type { LoanHistory, CalculatorSettings } from '@/types';

/**
 * localStorage キー定義
 */
export const STORAGE_KEYS = {
  LOAN_HISTORY: 'loan-calculator-history',
  SETTINGS: 'loan-calculator-settings',
} as const;

/**
 * デフォルト設定
 */
const DEFAULT_SETTINGS: CalculatorSettings = {
  defaultInterestRate: 1.5,
  defaultYears: 35,
  maxHistoryItems: 20,
  dateFormat: 'YYYY/MM/DD',
};

/**
 * 最大履歴保存数
 */
const MAX_HISTORY_ITEMS = 20;

/**
 * 履歴を保存
 *
 * @param history 履歴配列
 */
export const saveHistory = (history: LoanHistory[]): void => {
  try {
    // 最大20件まで保存（FIFO）
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    const json = JSON.stringify(limitedHistory);
    localStorage.setItem(STORAGE_KEYS.LOAN_HISTORY, json);
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
    // QuotaExceededError の場合は古い履歴を削除して再試行
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        const reducedHistory = history.slice(0, 10);
        const json = JSON.stringify(reducedHistory);
        localStorage.setItem(STORAGE_KEYS.LOAN_HISTORY, json);
      } catch (retryError) {
        console.error('Failed to save reduced history:', retryError);
      }
    }
  }
};

/**
 * 履歴を読み込み
 *
 * @returns 履歴配列（エラー時は空配列）
 */
export const loadHistory = (): LoanHistory[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.LOAN_HISTORY);
    if (!json) {
      return [];
    }

    const history = JSON.parse(json) as LoanHistory[];

    // バリデーション
    if (!Array.isArray(history)) {
      console.warn('Invalid history format in localStorage');
      return [];
    }

    return history;
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
    return [];
  }
};

/**
 * 履歴をクリア
 */
export const clearHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOAN_HISTORY);
  } catch (error) {
    console.error('Failed to clear history from localStorage:', error);
  }
};

/**
 * 履歴アイテムを削除
 *
 * @param historyId 削除する履歴のID
 */
export const removeHistoryItem = (historyId: string): void => {
  try {
    const history = loadHistory();
    const filteredHistory = history.filter((item) => item.id !== historyId);
    saveHistory(filteredHistory);
  } catch (error) {
    console.error('Failed to remove history item:', error);
  }
};

/**
 * 設定を保存
 *
 * @param settings 設定オブジェクト
 */
export const saveSettings = (settings: CalculatorSettings): void => {
  try {
    const json = JSON.stringify(settings);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, json);
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

/**
 * 設定を読み込み
 *
 * @returns 設定オブジェクト（エラー時はデフォルト設定）
 */
export const loadSettings = (): CalculatorSettings => {
  try {
    const json = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!json) {
      return DEFAULT_SETTINGS;
    }

    const settings = JSON.parse(json) as CalculatorSettings;
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * すべてのデータをクリア
 */
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOAN_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error('Failed to clear all data from localStorage:', error);
  }
};

/**
 * localStorage が利用可能かチェック
 *
 * @returns localStorage が利用可能ならtrue
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
