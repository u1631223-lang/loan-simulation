/**
 * NISA複利シミュレーション向けユーティリティ
 */

import type {
  InvestmentParams,
  InvestmentResult,
  YearlyData,
} from '@/types/investment';

/**
 * 複利計算（毎月積立 + 初期投資）
 *
 * 数式:
 * FV = PMT × ((1 + r)^n - 1) / r
 * FV_total = FV_monthly + PV × (1 + r)^n
 *
 * - FV: 将来価値
 * - PMT: 月々の積立額
 * - r: 月利（年利 / 12 / 100）
 * - n: 総月数（年数 × 12）
 * - PV: 初期投資額
 */
export const calculateCompoundInterest = (
  params: InvestmentParams
): InvestmentResult => {
  const normalized = normalizeParams(params);
  const { monthlyAmount, annualReturn, years, initialInvestment } = normalized;

  const monthlyRate = annualReturn / 12 / 100;
  const totalMonths = years * 12;

  if (totalMonths === 0) {
    const principalOnly = Math.round(initialInvestment);
    return {
      principal: principalOnly,
      profit: 0,
      total: principalOnly,
      yearlyData: [],
    };
  }

  const principal = Math.round(monthlyAmount * totalMonths + initialInvestment);

  const monthlyFutureValue =
    monthlyRate === 0
      ? monthlyAmount * totalMonths
      : monthlyAmount * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

  const initialFutureValue = initialInvestment * Math.pow(1 + monthlyRate, totalMonths);
  const total = Math.round(monthlyFutureValue + initialFutureValue);
  const profit = Math.max(0, total - principal);

  return {
    principal,
    profit,
    total,
    yearlyData: generateYearlyData(normalized),
  };
};

/**
 * 年次データ（折れ線・棒グラフ用）を生成
 */
export const generateYearlyData = (params: InvestmentParams): YearlyData[] => {
  const normalized = normalizeParams(params);
  const { monthlyAmount, annualReturn, years, initialInvestment } = normalized;

  const monthlyRate = annualReturn / 12 / 100;
  const data: YearlyData[] = [];

  for (let year = 1; year <= years; year += 1) {
    const months = year * 12;

    const principal = monthlyAmount * months + initialInvestment;

    const monthlyFutureValue =
      monthlyRate === 0
        ? monthlyAmount * months
        : monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    const initialFutureValue = initialInvestment * Math.pow(1 + monthlyRate, months);
    const total = Math.round(monthlyFutureValue + initialFutureValue);

    data.push({
      year,
      principal: Math.round(principal),
      total,
      profit: Math.max(0, total - Math.round(principal)),
    });
  }

  return data;
};

/**
 * 万円単位のフォーマット（例: 7,200万円）
 */
export const formatInvestmentAmount = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const manyen = Math.round(safeValue / 10000);
  return `${manyen.toLocaleString('ja-JP')}万円`;
};

/**
 * 入力値を計算に利用できる形へ正規化
 */
const normalizeParams = (params: InvestmentParams): Required<InvestmentParams> => {
  const monthlyAmount = Math.max(0, params.monthlyAmount);
  const annualReturn = Math.max(0, Math.min(20, params.annualReturn));
  const years = Math.max(0, Math.floor(params.years));
  const initialInvestment = Math.max(0, params.initialInvestment ?? 0);

  return {
    monthlyAmount,
    annualReturn,
    years,
    initialInvestment,
  };
};

