/**
 * Phase 15: 資産運用シミュレーション計算エンジン
 *
 * ポートフォリオリターン・リスク分析・目標金額達成計算など
 */

import type {
  AssetClass,
  AssetClassInfo,
  AssetAllocation,
  PortfolioReturn,
  RiskReturnAnalysis,
  YearlyData,
} from '@/types/investment';

/**
 * アセットクラス定義（期待リターン・リスク）
 *
 * データソース: 日本の長期投資データ（過去30年平均）
 * - 国内株式: TOPIX
 * - 海外株式: S&P500 (ヘッジなし)
 * - 債券: 日本国債・先進国債券
 * - REIT: 東証REIT指数
 */
export const ASSET_CLASSES: Record<AssetClass, AssetClassInfo> = {
  domestic_stocks: {
    label: '国内株式',
    expectedReturn: 0.05,  // 5% (TOPIX長期平均)
    risk: 0.18,            // 18% (標準偏差)
  },
  foreign_stocks: {
    label: '海外株式',
    expectedReturn: 0.07,  // 7% (S&P500保守的見積もり)
    risk: 0.20,            // 20%
  },
  domestic_bonds: {
    label: '国内債券',
    expectedReturn: 0.01,  // 1% (日本国債)
    risk: 0.03,            // 3%
  },
  foreign_bonds: {
    label: '海外債券',
    expectedReturn: 0.03,  // 3% (先進国債券)
    risk: 0.08,            // 8%
  },
  reit: {
    label: '不動産(REIT)',
    expectedReturn: 0.04,  // 4% (東証REIT)
    risk: 0.15,            // 15%
  },
  cash: {
    label: '現金・預金',
    expectedReturn: 0.001, // 0.1% (普通預金)
    risk: 0.00,            // リスクなし
  },
};

/**
 * 複利計算（一括投資）
 *
 * 数式: FV = PV × (1 + r)^n
 * - FV: 将来価値
 * - PV: 現在価値（元本）
 * - r: 年利（小数）
 * - n: 運用年数
 */
export const calculateLumpSumInvestment = (
  principal: number,
  annualRate: number,
  years: number
): {
  finalAmount: number;
  totalInterest: number;
  yearlyBreakdown: YearlyData[];
} => {
  const rate = annualRate / 100;
  const finalAmount = Math.round(principal * Math.pow(1 + rate, years));
  const totalInterest = finalAmount - principal;

  const yearlyBreakdown: YearlyData[] = [];
  for (let year = 1; year <= years; year += 1) {
    const total = Math.round(principal * Math.pow(1 + rate, year));
    yearlyBreakdown.push({
      year,
      principal,
      total,
      profit: total - principal,
    });
  }

  return {
    finalAmount,
    totalInterest,
    yearlyBreakdown,
  };
};

/**
 * 積立投資計算（毎月積立）
 *
 * 数式: FV = PMT × ((1 + r)^n - 1) / r
 * - PMT: 月々積立額
 * - r: 月利
 * - n: 総月数
 */
export const calculateMonthlyInvestment = (
  monthlyAmount: number,
  annualRate: number,
  years: number
): {
  totalInvestment: number;
  finalAmount: number;
  totalReturn: number;
  yearlyBreakdown: YearlyData[];
} => {
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = years * 12;
  const totalInvestment = Math.round(monthlyAmount * totalMonths);

  const finalAmount =
    monthlyRate === 0
      ? totalInvestment
      : Math.round(
          monthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
        );

  const totalReturn = finalAmount - totalInvestment;

  const yearlyBreakdown: YearlyData[] = [];
  for (let year = 1; year <= years; year += 1) {
    const months = year * 12;
    const principal = Math.round(monthlyAmount * months);
    const total =
      monthlyRate === 0
        ? principal
        : Math.round(
            monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
          );

    yearlyBreakdown.push({
      year,
      principal,
      total,
      profit: total - principal,
    });
  }

  return {
    totalInvestment,
    finalAmount,
    totalReturn,
    yearlyBreakdown,
  };
};

/**
 * ポートフォリオリターン計算
 *
 * 期待リターン = Σ(資産クラスi の期待リターン × 割合i)
 * リスク（分散） = Σ(資産クラスi のリスク² × 割合i²)
 * シャープレシオ = (期待リターン - 無リスク金利) / リスク
 *
 * 注: 簡易版のため、相関係数は考慮しない（保守的見積もり）
 */
export const calculatePortfolioReturn = (
  allocations: AssetAllocation[]
): PortfolioReturn => {
  // バリデーション: 合計が100%でない場合は補正
  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (totalPercentage === 0) {
    return {
      expectedReturn: 0,
      risk: 0,
      sharpeRatio: 0,
    };
  }

  const normalizedAllocations = allocations.map((a) => ({
    ...a,
    percentage: (a.percentage / totalPercentage) * 100,
  }));

  // 期待リターン計算（加重平均）
  let expectedReturn = 0;
  let varianceSum = 0;

  normalizedAllocations.forEach((allocation) => {
    const weight = allocation.percentage / 100;
    const assetInfo = ASSET_CLASSES[allocation.assetClass];
    const assetReturn = allocation.expectedReturn ?? assetInfo.expectedReturn;
    const assetRisk = assetInfo.risk;

    expectedReturn += assetReturn * weight;
    varianceSum += Math.pow(assetRisk * weight, 2);
  });

  const risk = Math.sqrt(varianceSum);

  // シャープレシオ（無リスク金利を0.001と仮定）
  const riskFreeRate = 0.001;
  const sharpeRatio = risk === 0 ? 0 : (expectedReturn - riskFreeRate) / risk;

  return {
    expectedReturn: Math.round(expectedReturn * 10000) / 100,  // %表記
    risk: Math.round(risk * 10000) / 100,                      // %表記
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
  };
};

/**
 * 目標金額達成のための必要積立額計算（逆算）
 *
 * PMT = FV × r / ((1 + r)^n - 1)
 * - FV: 目標金額
 * - r: 月利
 * - n: 総月数
 */
export const calculateRequiredMonthlyInvestment = (
  targetAmount: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = years * 12;

  if (totalMonths === 0) return 0;

  if (monthlyRate === 0) {
    return Math.round(targetAmount / totalMonths);
  }

  const monthlyAmount =
    (targetAmount * monthlyRate) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.round(monthlyAmount);
};

/**
 * リスク・リターン分析
 *
 * ポートフォリオ全体の期待リターン・リスク・シャープレシオを計算し、
 * 各アセットクラスの詳細情報も含めて返す
 */
export const analyzeRiskReturn = (
  allocations: AssetAllocation[]
): RiskReturnAnalysis => {
  const portfolioReturn = calculatePortfolioReturn(allocations);

  // 合計割合を計算（正規化用）
  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);

  const allocationDetails = allocations.map((allocation) => {
    const assetInfo = ASSET_CLASSES[allocation.assetClass];
    const normalizedPercentage =
      totalPercentage === 0 ? 0 : (allocation.percentage / totalPercentage) * 100;

    return {
      assetClass: allocation.assetClass,
      label: assetInfo.label,
      percentage: Math.round(normalizedPercentage * 10) / 10,
      expectedReturn: Math.round((allocation.expectedReturn ?? assetInfo.expectedReturn) * 10000) / 100,
      risk: Math.round(assetInfo.risk * 10000) / 100,
    };
  });

  return {
    expectedReturn: portfolioReturn.expectedReturn,
    risk: portfolioReturn.risk,
    sharpeRatio: portfolioReturn.sharpeRatio,
    allocations: allocationDetails,
  };
};

/**
 * ポートフォリオバリデーション
 *
 * - 合計が100%に近いか（95-105%の範囲）
 * - 各資産クラスの割合が0-100%の範囲内か
 */
export const validatePortfolio = (
  allocations: AssetAllocation[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 合計割合チェック
  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (totalPercentage < 95 || totalPercentage > 105) {
    errors.push(
      `合計割合が${Math.round(totalPercentage)}%です。100%に近づけてください。`
    );
  }

  // 各割合チェック
  allocations.forEach((allocation) => {
    if (allocation.percentage < 0 || allocation.percentage > 100) {
      const assetInfo = ASSET_CLASSES[allocation.assetClass];
      errors.push(`${assetInfo.label}の割合が不正です（${allocation.percentage}%）`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * リバランス提案
 *
 * 目標ポートフォリオと現在のポートフォリオを比較し、
 * 調整が必要な資産クラスと金額を提案
 */
export const suggestRebalancing = (
  currentAllocations: AssetAllocation[],
  targetAllocations: AssetAllocation[],
  totalAssets: number
): Array<{
  assetClass: AssetClass;
  label: string;
  currentPercentage: number;
  targetPercentage: number;
  difference: number;
  adjustmentAmount: number;
}> => {
  const suggestions: Array<{
    assetClass: AssetClass;
    label: string;
    currentPercentage: number;
    targetPercentage: number;
    difference: number;
    adjustmentAmount: number;
  }> = [];

  targetAllocations.forEach((target) => {
    const current = currentAllocations.find((a) => a.assetClass === target.assetClass);
    const currentPercentage = current?.percentage ?? 0;
    const difference = target.percentage - currentPercentage;
    const adjustmentAmount = Math.round((difference / 100) * totalAssets);

    const assetInfo = ASSET_CLASSES[target.assetClass];

    suggestions.push({
      assetClass: target.assetClass,
      label: assetInfo.label,
      currentPercentage: Math.round(currentPercentage * 10) / 10,
      targetPercentage: Math.round(target.percentage * 10) / 10,
      difference: Math.round(difference * 10) / 10,
      adjustmentAmount,
    });
  });

  return suggestions.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
};
