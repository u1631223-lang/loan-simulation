/**
 * 年収ベース借入可能額計算の型定義
 */

/**
 * 年収計算のパラメータ
 */
export interface IncomeParams {
  /** 本人の年収（万円） */
  primaryIncome: number;

  /** 金利（年利、%） */
  interestRate: number;

  /** 返済期間（年） */
  years: number;

  /** 連帯債務者または連帯保証人の有無 */
  hasCoDebtor: boolean;

  /** 連帯債務者 or 連帯保証人の種類 */
  coDebtorType?: 'joint-debtor' | 'guarantor';

  /** 相手の年収（万円） */
  coDebtorIncome?: number;

  /** メモ（Tier 2以上で使用可能） */
  memo?: string;
}

/**
 * 年収計算の結果
 */
export interface IncomeResult {
  /** 借入可能額（円） */
  maxBorrowableAmount: number;

  /** 月々の返済額（円） */
  monthlyPayment: number;

  /** 返済負担率（0.30 or 0.35） */
  repaymentRatio: number;

  /** 合算年収（万円） */
  totalIncome: number;

  /** 年間返済額（円） */
  annualRepayment: number;
}
