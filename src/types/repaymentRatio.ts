/**
 * 返済負担率計算の型定義
 */

/**
 * 返済負担率計算パラメータ
 */
export interface RepaymentRatioParams {
  /** 本人年収（万円） */
  primaryIncome: number;
  /** 連帯債務者年収（万円、0の場合は単独） */
  coDebtorIncome: number;
  /** 返済負担率（0.25 = 25%） */
  repaymentRatio: number;
  /** 金利（年利%） */
  interestRate: number;
  /** 返済期間（年） */
  years: number;
}

/**
 * 返済負担率計算結果
 */
export interface RepaymentRatioResult {
  /** 借入可能額（円） */
  maxBorrowable: number;
  /** 月々返済額（円） */
  monthlyPayment: number;
  /** 年間返済額（円） */
  annualPayment: number;
  /** 総返済額（円） */
  totalPayment: number;
  /** 利息総額（円） */
  totalInterest: number;
  /** 合算年収（万円） */
  totalIncome: number;
  /** 使用した返済負担率 */
  repaymentRatio: number;
}
