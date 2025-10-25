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

// ============================================================
// Phase 15: Asset Portfolio Types
// ============================================================

/**
 * アセットクラス（資産クラス）
 */
export type AssetClass =
  | 'domestic_stocks'    // 国内株式
  | 'foreign_stocks'     // 海外株式
  | 'domestic_bonds'     // 国内債券
  | 'foreign_bonds'      // 海外債券
  | 'reit'               // 不動産（REIT）
  | 'cash';              // 現金・預金

/**
 * アセットクラス情報
 */
export interface AssetClassInfo {
  label: string;
  expectedReturn: number;  // 期待リターン（年利、小数）
  risk: number;           // リスク（標準偏差、小数）
}

/**
 * アセットアロケーション（資産配分）
 */
export interface AssetAllocation {
  id?: string;
  assetClass: AssetClass;
  percentage: number;         // 割合（0-100）
  expectedReturn?: number;    // カスタム期待リターン（オプション）
  riskLevel?: 'low' | 'medium' | 'high';
}

/**
 * ポートフォリオ
 */
export interface AssetPortfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  allocations: AssetAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ポートフォリオリターン計算結果
 */
export interface PortfolioReturn {
  expectedReturn: number;  // 期待リターン（年利%）
  risk: number;           // リスク（標準偏差%）
  sharpeRatio: number;    // シャープレシオ
}

/**
 * リスク・リターン分析結果
 */
export interface RiskReturnAnalysis {
  expectedReturn: number;
  risk: number;
  sharpeRatio: number;
  allocations: Array<{
    assetClass: AssetClass;
    label: string;
    percentage: number;
    expectedReturn: number;
    risk: number;
  }>;
}

/**
 * ポートフォリオ作成パラメータ
 */
export interface CreatePortfolioParams {
  name: string;
  description?: string;
  allocations: AssetAllocation[];
}

/**
 * ポートフォリオ更新パラメータ
 */
export interface UpdatePortfolioParams {
  name?: string;
  description?: string;
  allocations?: AssetAllocation[];
}

