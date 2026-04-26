/**
 * フォーム入力の自動保存・自動復元
 *
 * iPad のホーム画面ショートカットや、別端末で再開した際に
 * 「毎回1から入力し直し」になる問題を解消する。
 *
 * Home.tsx で管理している主要なフォーム state を localStorage に
 * 保存し、起動時に復元する。
 */

import type { LoanParams, ReverseLoanParams, CalculationMode } from '@/types';

export type ViewMode = 'loan' | 'calculator' | 'investment' | 'guide';

export interface FormDraft {
  forward: LoanParams;
  reverse: ReverseLoanParams;
  calculationMode: CalculationMode;
  viewMode: ViewMode;
  savedAt: string;
}

const STORAGE_KEY = 'loan-calculator-form-draft';
const SCHEMA_VERSION = 1;

interface StoredDraft extends FormDraft {
  __v: number;
}

export const DEFAULT_FORWARD: LoanParams = {
  principal: 50000000,
  interestRate: 1.0,
  years: 40,
  months: 0,
  repaymentType: 'equal-payment',
  bonusPayment: {
    enabled: true,
    amount: 15000000,
    months: [1, 8],
  },
};

export const DEFAULT_REVERSE: ReverseLoanParams = {
  monthlyPayment: 150000,
  interestRate: 1.0,
  years: 40,
  months: 0,
  repaymentType: 'equal-payment',
  bonusPayment: {
    enabled: true,
    payment: 200000,
    months: [1, 8],
  },
};

const isLoanParams = (value: unknown): value is LoanParams => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.principal === 'number' &&
    typeof v.interestRate === 'number' &&
    typeof v.years === 'number' &&
    typeof v.months === 'number' &&
    (v.repaymentType === 'equal-payment' || v.repaymentType === 'equal-principal')
  );
};

const isReverseLoanParams = (value: unknown): value is ReverseLoanParams => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.monthlyPayment === 'number' &&
    typeof v.interestRate === 'number' &&
    typeof v.years === 'number' &&
    typeof v.months === 'number' &&
    (v.repaymentType === 'equal-payment' || v.repaymentType === 'equal-principal')
  );
};

const isCalculationMode = (value: unknown): value is CalculationMode =>
  value === 'forward' || value === 'reverse' || value === 'repayment-ratio' || value === 'income';

const isViewMode = (value: unknown): value is ViewMode =>
  value === 'loan' || value === 'calculator' || value === 'investment' || value === 'guide';

/**
 * 最終入力値を localStorage から読み込む。
 * 値が無い・壊れている場合はデフォルト値を返す。
 */
export const hasFormDraft = (): boolean => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return false;
    const parsed = JSON.parse(json) as Partial<StoredDraft>;
    return parsed.__v === SCHEMA_VERSION;
  } catch {
    return false;
  }
};

export const loadFormDraft = (): FormDraft => {
  const fallback: FormDraft = {
    forward: DEFAULT_FORWARD,
    reverse: DEFAULT_REVERSE,
    calculationMode: 'forward',
    viewMode: 'loan',
    savedAt: '',
  };

  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return fallback;

    // Prototype pollution (CWE-1321) を防ぐため、危険なキーを含む JSON は拒否する。
    if (/"\s*(__proto__|constructor|prototype)\s*"\s*:/.test(json)) {
      return fallback;
    }

    const parsed = JSON.parse(json) as Partial<StoredDraft>;
    if (!parsed || typeof parsed !== 'object') return fallback;
    if (parsed.__v !== SCHEMA_VERSION) return fallback;

    return {
      forward: isLoanParams(parsed.forward) ? parsed.forward : DEFAULT_FORWARD,
      reverse: isReverseLoanParams(parsed.reverse) ? parsed.reverse : DEFAULT_REVERSE,
      calculationMode: isCalculationMode(parsed.calculationMode)
        ? parsed.calculationMode
        : 'forward',
      viewMode: isViewMode(parsed.viewMode) ? parsed.viewMode : 'loan',
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : '',
    };
  } catch (error) {
    console.warn('Failed to load form draft:', error);
    return fallback;
  }
};

/**
 * 最終入力値を localStorage に保存する。
 */
export const saveFormDraft = (draft: Omit<FormDraft, 'savedAt'>): void => {
  const stored: StoredDraft = {
    ...draft,
    savedAt: new Date().toISOString(),
    __v: SCHEMA_VERSION,
  };
  const payload = JSON.stringify(stored);

  try {
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    // QuotaExceededError 等で保存に失敗した場合、自分の枠を一度開放してから再試行する
    if (error instanceof DOMException) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, payload);
        return;
      } catch {
        // 再試行も失敗した場合は諦める（次回保存時に再挑戦）
      }
    }
    console.warn('Failed to save form draft:', error);
  }
};

/**
 * 保存されたドラフトを削除する（「初期値に戻す」操作用）。
 */
export const clearFormDraft = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear form draft:', error);
  }
};
