/**
 * AI アドバイス関連の型定義
 */

/**
 * リスクレベル
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * AI生成されたローンアドバイス
 */
export interface AILoanAdvice {
  /** リスクレベル */
  riskLevel: RiskLevel;
  /** 総合評価（200-300文字） */
  analysis: string;
  /** 具体的な提案リスト */
  recommendations: string[];
  /** 注意点リスト */
  warnings: string[];
  /** 生成日時（ISO 8601形式） */
  generatedAt: string;
}

/**
 * ローン分析用のパラメータ
 */
export interface LoanAnalysisParams {
  /** 年収（万円） */
  annualIncome: number;
  /** 借入額（円） */
  principal: number;
  /** 返済期間（年） */
  years: number;
  /** 金利（%） */
  interestRate: number;
  /** 月々返済額（円） */
  monthlyPayment: number;
  /** 返済負担率（%） */
  repaymentRatio: number;
  /** 家族人数 */
  familySize: number;
  /** 子供の人数 */
  childrenCount: number;
  /** ボーナス返済額（オプション） */
  bonusPayment?: number;
  /** 現在の年齢（オプション） */
  currentAge?: number;
  /** 定年年齢（オプション） */
  retirementAge?: number;
}

/**
 * AIアドバイスエラー
 */
export interface AIAdviceError {
  /** エラータイプ */
  type: 'parse_error' | 'api_error' | 'validation_error' | 'network_error';
  /** エラーメッセージ */
  message: string;
  /** 元のエラー（オプション） */
  originalError?: Error;
}

/**
 * AIアドバイス生成リクエストの状態
 */
export type AIAdviceStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * AIアドバイス生成の結果
 */
export interface AIAdviceResult {
  status: AIAdviceStatus;
  advice?: AILoanAdvice;
  error?: AIAdviceError;
}
