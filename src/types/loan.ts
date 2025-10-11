/**
 * ローン計算に関する型定義
 */

/**
 * 返済方式
 */
export type RepaymentType = 'equal-payment' | 'equal-principal';

/**
 * ボーナス払い設定
 */
export interface BonusPayment {
  enabled: boolean;
  amount: number;        // ボーナス返済額
  months: number[];      // ボーナス月（1-12）例: [6, 12] = 6月と12月
}

/**
 * ローンパラメータ
 */
export interface LoanParams {
  principal: number;        // 借入金額
  interestRate: number;     // 金利（年利%）
  years: number;            // 返済期間（年）
  months: number;           // 返済期間（月）※yearsに加算
  repaymentType: RepaymentType; // 返済方式
  bonusPayment?: BonusPayment;  // ボーナス払い（オプション）
}

/**
 * 月次返済計画
 */
export interface PaymentSchedule {
  month: number;          // 返済回数（1から開始）
  payment: number;        // 返済額
  principal: number;      // 元金
  interest: number;       // 利息
  balance: number;        // 残高
  isBonus?: boolean;      // ボーナス月かどうか
}

/**
 * ローン計算結果
 */
export interface LoanResult {
  monthlyPayment: number;       // 月々返済額
  bonusPayment?: number;        // ボーナス返済額（ある場合）
  totalPayment: number;         // 総返済額
  totalInterest: number;        // 利息総額
  totalPrincipal: number;       // 元金総額
  schedule: PaymentSchedule[];  // 返済計画表
}

/**
 * 計算履歴
 */
export interface LoanHistory {
  id: string;               // 一意のID
  timestamp: number;        // タイムスタンプ
  params: LoanParams;       // 計算パラメータ
  result: LoanResult;       // 計算結果
  label?: string;           // ラベル（オプション）
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * バリデーションエラー
 */
export interface ValidationError {
  field: keyof LoanParams;
  message: string;
}

/**
 * ローン計算の設定
 */
export interface CalculatorSettings {
  defaultInterestRate: number;   // デフォルト金利
  defaultYears: number;           // デフォルト返済期間
  maxHistoryItems: number;        // 最大履歴保存数
  dateFormat: string;             // 日付フォーマット
}
