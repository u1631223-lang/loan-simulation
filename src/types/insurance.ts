/**
 * 保険設計シミュレーション関連の型定義
 */

/**
 * 子供情報
 */
export interface ChildInfo {
  age: number;                    // 現在の年齢
  educationPlan: {
    elementary: 'public' | 'private';
    juniorHigh: 'public' | 'private';
    highSchool: 'public' | 'private';
    university: 'national' | 'private' | 'science' | 'none';
  };
}

/**
 * 年別支出
 */
export interface YearlyExpense {
  year: number;                   // 年数（現在から）
  livingExpense: number;          // 生活費
  housingCost: number;            // 住居費
  educationCost: number;          // 教育費
  total: number;                  // 合計
}

/**
 * 年別収入
 */
export interface YearlyIncome {
  year: number;                   // 年数（現在から）
  spouseIncome: number;           // 配偶者収入
  pensionAmount: number;          // 年金額
  otherIncome: number;            // その他収入
  total: number;                  // 合計
}

/**
 * 教育費内訳
 */
export interface EducationCostBreakdown {
  childIndex: number;             // 子供の番号
  age: number;                    // 年齢
  stage: string;                  // 教育段階
  cost: number;                   // 費用
}

/**
 * 遺族年金計算結果
 */
export interface SurvivorPension {
  basicPension: number;           // 基礎年金
  earningsRelated: number;        // 報酬比例部分
  childAllowance: number;         // 加算額
  totalAnnual: number;            // 年間合計
}

/**
 * 必要保障額の内訳
 */
export interface CoverageBreakdown {
  totalExpenses: number;          // 総支出
  totalIncome: number;            // 総収入
  existingAssets: number;         // 既存資産
  gap: number;                    // 不足額
}

/**
 * 必要保障額計算結果
 */
export interface CoverageAnalysis {
  requiredAmount: number;         // 必要保障額
  breakdown: CoverageBreakdown;
  yearlyExpenses: YearlyExpense[];
  yearlyIncome: YearlyIncome[];
}

/**
 * 加入中の保険情報
 */
export interface CurrentInsurance {
  id: string;
  type: 'life' | 'medical' | 'cancer' | 'income' | 'other';
  name: string;                   // 保険名
  coverage: number;               // 保障額
  monthlyPremium: number;         // 月額保険料
}

/**
 * 保険提案のステータス
 */
export type RecommendationStatus = 'insufficient' | 'excessive' | 'adequate';

/**
 * 保険提案
 */
export interface InsuranceRecommendation {
  status: RecommendationStatus;
  message: string;
  suggestions: string[];
}

/**
 * 保険プランのパラメータ
 */
export interface InsurancePlanParams {
  // 基本情報
  householdHeadAge: number;       // 世帯主年齢
  spouseAge: number;              // 配偶者年齢
  children: ChildInfo[];          // 子供情報

  // 生活費
  monthlyExpense: number;         // 月間生活費
  housingCost: number;            // 住居費（ローン残債 or 家賃）

  // 収入情報
  spouseIncome: number;           // 配偶者年収
  otherIncome: number;            // その他収入

  // 資産情報
  savings: number;                // 預貯金
  securities: number;             // 有価証券
  realEstate: number;             // 不動産（自宅以外）

  // 遺族年金情報（簡易計算用）
  averageSalary: number;          // 平均標準報酬月額
  insuredMonths: number;          // 加入月数

  // 現在の保険
  currentInsurance: CurrentInsurance[];
}

/**
 * 保険プラン
 */
export interface InsurancePlan {
  id: string;
  userId: string;
  name: string;
  params: InsurancePlanParams;
  analysis: CoverageAnalysis;
  recommendation: InsuranceRecommendation;
  createdAt: number;
  updatedAt: number;
}

/**
 * 保険プラン作成パラメータ
 */
export interface CreateInsurancePlanParams {
  name: string;
  params: InsurancePlanParams;
}

/**
 * 保険プラン更新パラメータ
 */
export interface UpdateInsurancePlanParams {
  name?: string;
  params?: InsurancePlanParams;
}
