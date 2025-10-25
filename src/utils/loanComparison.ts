/**
 * ローン比較計算ユーティリティ
 *
 * 複数のローンプランを比較する機能を提供します。
 */

import type { LoanParams, LoanResult, PaymentSchedule } from '@/types';
import { calculateEqualPayment, generateEqualPaymentSchedule, calculateEqualPrincipal, roundFinancial } from './loanCalculator';

/**
 * ローンプラン（手数料込み）
 */
export interface LoanPlan {
  id: string;
  name: string;
  params: LoanParams;
  fees: {
    upfrontFee: number;        // 事務手数料（定額）
    upfrontFeeRate: number;    // 事務手数料率（%）例: 2.2%
    guaranteeFee: number;      // 保証料
    otherFees: number;         // その他諸費用
  };
}

/**
 * ローン比較結果
 */
export interface ComparisonResult {
  plan: LoanPlan;
  result: LoanResult;
  totalFees: number;           // 諸費用合計
  totalCost: number;           // 総支払額（返済額 + 諸費用）
  effectiveRate: number;       // 実質金利（諸費用込み）
  monthlyPayment: number;      // 月々返済額
}

/**
 * おすすめプラン
 */
export interface Recommendation {
  bestForMonthly: number;      // 月々返済額が最小のプラン（インデックス）
  bestForTotal: number;        // 総支払額が最小のプラン（インデックス）
  bestOverall: number;         // 総合的におすすめのプラン（インデックス）
  reasoning: string;           // 推奨理由
}

/**
 * ローン比較分析
 */
export interface ComparisonAnalysis {
  comparison: ComparisonResult[];
  recommendation: Recommendation;
}

/**
 * 諸費用の合計を計算
 *
 * @param fees 諸費用
 * @param principal 借入金額
 * @returns 諸費用合計
 */
const calculateTotalFees = (
  fees: LoanPlan['fees'],
  principal: number
): number => {
  const upfrontFee = fees.upfrontFee;
  const upfrontFeeByRate = principal * (fees.upfrontFeeRate / 100);
  const guaranteeFee = fees.guaranteeFee;
  const otherFees = fees.otherFees;

  return roundFinancial(upfrontFee + upfrontFeeByRate + guaranteeFee + otherFees);
};

/**
 * 実質金利を計算（諸費用込み）
 *
 * @param params ローンパラメータ
 * @returns 実質金利（%）
 */
export const calculateEffectiveRate = (params: {
  nominalRate: number;          // 表面金利
  fees: number;                 // 諸費用
  principal: number;            // 借入額
  years: number;                // 返済期間（年）
  repaymentType?: 'equal-payment' | 'equal-principal'; // 返済方式
  schedule?: PaymentSchedule[]; // 実際のスケジュール（推奨）
}): number => {
  const { nominalRate, fees, principal, years, schedule } = params;

  const effectivePrincipal = principal + fees;

  // スケジュールがある場合は実データから総支払額を計算
  let totalPayment: number;
  if (schedule && schedule.length > 0) {
    totalPayment = schedule.reduce((sum, payment) => sum + payment.payment, 0);
  } else {
    // スケジュールがない場合は元利均等で概算
    const monthlyPayment = calculateEqualPayment(principal, nominalRate, years * 12);
    totalPayment = monthlyPayment * years * 12;
  }

  const totalInterest = totalPayment - principal;
  const effectiveInterest = totalInterest + fees;

  // 実質金利 ≈ (実質利息 / 実質元金) / 返済期間 * 100
  const effectiveRate = (effectiveInterest / effectivePrincipal / years) * 100;

  return roundFinancial(effectiveRate, 3);
};

/**
 * 複数ローンプランの比較分析
 *
 * @param plans ローンプランの配列（最大3つ）
 * @returns 比較分析結果
 */
export const compareLoanPlans = (plans: LoanPlan[]): ComparisonAnalysis => {
  if (plans.length === 0) {
    throw new Error('比較するローンプランがありません');
  }

  if (plans.length > 5) {
    throw new Error('比較できるローンプランは最大5つまでです');
  }

  // 各プランの計算結果を取得
  const comparison: ComparisonResult[] = plans.map((plan) => {
    const { params } = plan;
    const totalMonths = params.years * 12 + (params.months || 0);

    let result: LoanResult;

    if (params.repaymentType === 'equal-payment') {
      const monthlyPayment = calculateEqualPayment(params.principal, params.interestRate, totalMonths);
      const schedule = generateEqualPaymentSchedule(params.principal, params.interestRate, totalMonths);
      const totalPayment = schedule.reduce((sum, s) => sum + s.payment, 0);
      const totalInterest = schedule.reduce((sum, s) => sum + s.interest, 0);

      result = {
        monthlyPayment,
        totalPayment: roundFinancial(totalPayment),
        totalInterest: roundFinancial(totalInterest),
        totalPrincipal: params.principal,
        schedule,
      };
    } else {
      const schedule = calculateEqualPrincipal(params.principal, params.interestRate, totalMonths);
      const totalPayment = schedule.reduce((sum, s) => sum + s.payment, 0);
      const totalInterest = schedule.reduce((sum, s) => sum + s.interest, 0);

      result = {
        monthlyPayment: schedule[0].payment,
        totalPayment: roundFinancial(totalPayment),
        totalInterest: roundFinancial(totalInterest),
        totalPrincipal: params.principal,
        schedule,
      };
    }

    const totalFees = calculateTotalFees(plan.fees, params.principal);
    const totalCost = result.totalPayment + totalFees;
    const effectiveRate = calculateEffectiveRate({
      nominalRate: params.interestRate,
      fees: totalFees,
      principal: params.principal,
      years: params.years + (params.months || 0) / 12,
      repaymentType: params.repaymentType,
      schedule: result.schedule, // 実際のスケジュールを渡す
    });

    return {
      plan,
      result,
      totalFees,
      totalCost: roundFinancial(totalCost),
      effectiveRate,
      monthlyPayment: result.monthlyPayment,
    };
  });

  // おすすめプランを判定
  const bestForMonthly = comparison.reduce((minIndex, current, index, arr) =>
    current.monthlyPayment < arr[minIndex].monthlyPayment ? index : minIndex
  , 0);

  const bestForTotal = comparison.reduce((minIndex, current, index, arr) =>
    current.totalCost < arr[minIndex].totalCost ? index : minIndex
  , 0);

  // 総合的なおすすめ: 総支払額が最小のプランを推奨
  const bestOverall = bestForTotal;

  const bestPlan = comparison[bestOverall].plan;
  const reasoning = `総支払額が最も少ない「${bestPlan.name}」をおすすめします。
表面金利だけでなく、諸費用を含めた実質的な負担額を重視して選択することが重要です。`;

  const recommendation: Recommendation = {
    bestForMonthly,
    bestForTotal,
    bestOverall,
    reasoning,
  };

  return {
    comparison,
    recommendation,
  };
};

/**
 * ローンプランの差額を計算
 *
 * @param plan1 プラン1
 * @param plan2 プラン2
 * @returns 差額情報
 */
export const calculatePlanDifference = (
  plan1: ComparisonResult,
  plan2: ComparisonResult
): {
  monthlyDiff: number;
  totalDiff: number;
  feesDiff: number;
} => {
  return {
    monthlyDiff: roundFinancial(plan1.monthlyPayment - plan2.monthlyPayment),
    totalDiff: roundFinancial(plan1.totalCost - plan2.totalCost),
    feesDiff: roundFinancial(plan1.totalFees - plan2.totalFees),
  };
};
