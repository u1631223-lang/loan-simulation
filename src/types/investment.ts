/**
 * 資産運用シミュレーション用の型定義
 */

export interface InvestmentParams {
  /** 月々の積立額（円、0.1万円単位対応） */
  monthlyAmount: number;
  /** 想定利回り（年利%） */
  annualReturn: number;
  /** 積立期間（年） */
  years: number;
  /** 初期投資額（円、任意） */
  initialInvestment?: number;
}

export interface InvestmentResult {
  /** 総積立額（元本） */
  principal: number;
  /** 運用益 */
  profit: number;
  /** 最終資産額 */
  total: number;
  /** 年次データ（グラフ用） */
  yearlyData: YearlyData[];
}

export interface YearlyData {
  /** 経過年数 */
  year: number;
  /** 累計元本 */
  principal: number;
  /** 運用後資産額 */
  total: number;
  /** 運用益 */
  profit: number;
}

