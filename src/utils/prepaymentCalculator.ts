/**
 * 繰上返済シミュレーション計算ユーティリティ
 *
 * このモジュールは繰上返済の効果を計算する関数を提供します。
 */

import type { LoanParams, PaymentSchedule } from '@/types';
import {
  calculateEqualPayment,
  generateEqualPaymentSchedule,
  calculateEqualPrincipal,
  getMonthlyRate,
  getTotalMonths,
  roundFinancial,
} from './loanCalculator';

/**
 * 繰上返済タイプ
 */
export type PrepaymentType = 'period' | 'payment';
// period = 期間短縮型（返済期間を短縮）
// payment = 返済額軽減型（月々の返済額を減少）

/**
 * 繰上返済設定
 */
export interface Prepayment {
  month: number;              // 繰上返済を行う月（1回目から数えて）
  amount: number;             // 繰上返済額
  type: PrepaymentType;       // 繰上返済タイプ
}

/**
 * 繰上返済前の状態
 */
export interface OriginalLoanState {
  totalPayment: number;       // 総返済額
  totalInterest: number;      // 総利息
  endMonth: number;           // 最終返済月
  monthlyPayment: number;     // 月々返済額
}

/**
 * 繰上返済後の状態
 */
export interface AfterPrepaymentState {
  totalPayment: number;       // 総返済額
  totalInterest: number;      // 総利息
  endMonth: number;           // 最終返済月
  monthlyPayment?: number;    // 月々返済額（返済額軽減型の場合変化）
  monthlySavings?: number;    // 月々の節約額（返済額軽減型）
  periodReduction?: number;   // 短縮期間（月数）（期間短縮型）
}

/**
 * 繰上返済効果
 */
export interface PrepaymentEffect {
  original: OriginalLoanState;
  afterPrepayment: AfterPrepaymentState;
  benefit: {
    interestSaved: number;    // 利息削減額
    totalSaved: number;       // 総削減額
    prepaymentAmount: number; // 繰上返済額
  };
  schedule: PaymentSchedule[]; // 繰上返済後の返済計画表
}

/**
 * 複数回繰上返済シミュレーション結果
 */
export interface PrepaymentSimulation {
  original: OriginalLoanState;
  afterPrepayments: AfterPrepaymentState;
  totalBenefit: {
    interestSaved: number;
    totalSaved: number;
    totalPrepaymentAmount: number;
  };
  prepayments: Prepayment[];
  schedule: PaymentSchedule[];
}

/**
 * 最適繰上返済タイミング分析結果
 */
export interface OptimalPrepaymentAnalysis {
  recommendedMonth: number;
  expectedSavings: number;
  reasoning: string;
  monthlyComparison: {
    month: number;
    savings: number;
  }[];
}

/**
 * 繰上返済効果を計算（1回のみ）
 *
 * @param params 繰上返済パラメータ
 * @returns 繰上返済効果
 */
export const calculatePrepaymentEffect = (params: {
  loanParams: LoanParams;
  prepaymentAmount: number;
  prepaymentMonth: number;
  prepaymentType: PrepaymentType;
}): PrepaymentEffect => {
  const { loanParams, prepaymentAmount, prepaymentMonth, prepaymentType } = params;

  // 元のローンの返済計画表を生成
  const totalMonths = getTotalMonths(loanParams.years, loanParams.months);
  const originalSchedule = loanParams.repaymentType === 'equal-payment'
    ? generateEqualPaymentSchedule(loanParams.principal, loanParams.interestRate, totalMonths)
    : calculateEqualPrincipal(loanParams.principal, loanParams.interestRate, totalMonths);

  const originalMonthlyPayment = originalSchedule[0].payment;
  const originalTotalPayment = originalSchedule.reduce((sum, s) => sum + s.payment, 0);
  const originalTotalInterest = originalSchedule.reduce((sum, s) => sum + s.interest, 0);

  const original: OriginalLoanState = {
    totalPayment: roundFinancial(originalTotalPayment),
    totalInterest: roundFinancial(originalTotalInterest),
    endMonth: totalMonths,
    monthlyPayment: originalMonthlyPayment,
  };

  // 繰上返済時点の残高を取得
  if (prepaymentMonth < 1 || prepaymentMonth > totalMonths) {
    throw new Error(`繰上返済月は1〜${totalMonths}の範囲で指定してください`);
  }

  const balanceAtPrepayment = prepaymentMonth === 1
    ? loanParams.principal
    : originalSchedule[prepaymentMonth - 2].balance;

  if (prepaymentAmount <= 0 || prepaymentAmount >= balanceAtPrepayment) {
    throw new Error('繰上返済額は0円より大きく、残高未満である必要があります');
  }

  // 繰上返済後の新しい残高
  const newBalance = balanceAtPrepayment - prepaymentAmount;
  const remainingMonths = totalMonths - prepaymentMonth + 1;

  let newSchedule: PaymentSchedule[];
  let newMonthlyPayment: number;
  let newEndMonth: number;

  if (prepaymentType === 'period') {
    // 期間短縮型: 月々の返済額は変わらず、返済期間が短縮される
    newMonthlyPayment = originalMonthlyPayment;

    // 残高と月々返済額から、新しい返済期間を逆算
    const monthlyRate = getMonthlyRate(loanParams.interestRate);

    if (loanParams.interestRate === 0) {
      // 金利0%の場合
      newEndMonth = Math.ceil(newBalance / newMonthlyPayment);
    } else {
      // 元利均等の場合の期間計算
      // n = -log(1 - r*P/PMT) / log(1 + r)
      const numerator = Math.log(1 - (monthlyRate * newBalance) / newMonthlyPayment);
      const denominator = Math.log(1 + monthlyRate);
      newEndMonth = Math.ceil(-numerator / denominator);
    }

    // 新しい返済計画表を生成
    if (loanParams.repaymentType === 'equal-payment') {
      newSchedule = generateEqualPaymentSchedule(newBalance, loanParams.interestRate, newEndMonth);
    } else {
      newSchedule = calculateEqualPrincipal(newBalance, loanParams.interestRate, newEndMonth);
    }

    // 繰上返済前の期間を追加
    const beforePrepayment = originalSchedule.slice(0, prepaymentMonth - 1);
    newSchedule = [
      ...beforePrepayment,
      ...newSchedule.map((s, idx) => ({
        ...s,
        month: prepaymentMonth + idx,
      })),
    ];

    newEndMonth = prepaymentMonth - 1 + newEndMonth;

  } else {
    // 返済額軽減型: 返済期間は変わらず、月々の返済額が減少する
    newEndMonth = totalMonths;

    // 新しい月々返済額を計算
    if (loanParams.repaymentType === 'equal-payment') {
      newMonthlyPayment = calculateEqualPayment(newBalance, loanParams.interestRate, remainingMonths);
      const afterSchedule = generateEqualPaymentSchedule(newBalance, loanParams.interestRate, remainingMonths);

      // 繰上返済前の期間を追加
      const beforePrepayment = originalSchedule.slice(0, prepaymentMonth - 1);
      newSchedule = [
        ...beforePrepayment,
        ...afterSchedule.map((s, idx) => ({
          ...s,
          month: prepaymentMonth + idx,
        })),
      ];
    } else {
      const afterSchedule = calculateEqualPrincipal(newBalance, loanParams.interestRate, remainingMonths);
      newMonthlyPayment = afterSchedule[0].payment;

      // 繰上返済前の期間を追加
      const beforePrepayment = originalSchedule.slice(0, prepaymentMonth - 1);
      newSchedule = [
        ...beforePrepayment,
        ...afterSchedule.map((s, idx) => ({
          ...s,
          month: prepaymentMonth + idx,
        })),
      ];
    }
  }

  const newTotalPayment = newSchedule.reduce((sum, s) => sum + s.payment, 0);
  const adjustedTotalPayment = newTotalPayment + prepaymentAmount;
  const newTotalInterest = newSchedule.reduce((sum, s) => sum + s.interest, 0);

  const afterPrepayment: AfterPrepaymentState = {
    totalPayment: roundFinancial(adjustedTotalPayment),
    totalInterest: roundFinancial(newTotalInterest),
    endMonth: newEndMonth,
    monthlyPayment: roundFinancial(newMonthlyPayment),
  };

  if (prepaymentType === 'payment') {
    afterPrepayment.monthlySavings = roundFinancial(originalMonthlyPayment - newMonthlyPayment);
  } else {
    afterPrepayment.periodReduction = totalMonths - newEndMonth;
  }

  return {
    original,
    afterPrepayment,
    benefit: {
      interestSaved: roundFinancial(original.totalInterest - afterPrepayment.totalInterest),
      totalSaved: roundFinancial(original.totalPayment - afterPrepayment.totalPayment),
      prepaymentAmount,
    },
    schedule: newSchedule,
  };
};

/**
 * 複数回繰上返済のシミュレーション
 *
 * @param params 複数回繰上返済パラメータ
 * @returns シミュレーション結果
 */
export const calculateMultiplePrepayments = (params: {
  loanParams: LoanParams;
  prepayments: Prepayment[];
}): PrepaymentSimulation => {
  const { loanParams, prepayments } = params;

  // 元のローン状態
  const totalMonths = getTotalMonths(loanParams.years, loanParams.months);
  const originalSchedule = loanParams.repaymentType === 'equal-payment'
    ? generateEqualPaymentSchedule(loanParams.principal, loanParams.interestRate, totalMonths)
    : calculateEqualPrincipal(loanParams.principal, loanParams.interestRate, totalMonths);

  const original: OriginalLoanState = {
    totalPayment: roundFinancial(originalSchedule.reduce((sum, s) => sum + s.payment, 0)),
    totalInterest: roundFinancial(originalSchedule.reduce((sum, s) => sum + s.interest, 0)),
    endMonth: totalMonths,
    monthlyPayment: originalSchedule[0].payment,
  };

  // 繰上返済を月順にソート
  const sortedPrepayments = [...prepayments].sort((a, b) => a.month - b.month);

  // 繰上返済を順番に適用
  let currentParams = { ...loanParams };
  let currentSchedule = [...originalSchedule];
  let totalPrepaymentAmount = 0;
  let cumulativeElapsedMonths = 0; // 累積経過月数

  for (let i = 0; i < sortedPrepayments.length; i++) {
    const prepayment = sortedPrepayments[i];
    totalPrepaymentAmount += prepayment.amount;

    // 現在のスケジュールにおける繰上返済時点の相対月数
    const relativePrepaymentMonth = prepayment.month - cumulativeElapsedMonths;

    // 繰上返済時点の残高を取得
    const prepaymentMonthIndex = relativePrepaymentMonth - 1;
    if (prepaymentMonthIndex < 0 || prepaymentMonthIndex >= currentSchedule.length) {
      console.error(`Invalid prepayment month: ${prepayment.month} (relative: ${relativePrepaymentMonth})`);
      continue;
    }

    const remainingBalance = currentSchedule[prepaymentMonthIndex].balance;
    const remainingMonths = currentSchedule.length - relativePrepaymentMonth;

    // 次の繰上返済のために、ローンパラメータを更新
    currentParams = {
      ...currentParams,
      principal: remainingBalance,
      years: Math.floor(remainingMonths / 12),
      months: remainingMonths % 12,
    };

    // この繰上返済の効果を計算（相対月数を使用）
    const effect = calculatePrepaymentEffect({
      loanParams: currentParams,
      prepaymentAmount: prepayment.amount,
      prepaymentMonth: relativePrepaymentMonth,
      prepaymentType: prepayment.type,
    });

    currentSchedule = effect.schedule;

    // 累積経過月数を更新
    cumulativeElapsedMonths = prepayment.month;
  }

  const finalTotalPayment = currentSchedule.reduce((sum, s) => sum + s.payment, 0);
  const finalTotalInterest = currentSchedule.reduce((sum, s) => sum + s.interest, 0);

  const afterPrepayments: AfterPrepaymentState = {
    totalPayment: roundFinancial(finalTotalPayment + totalPrepaymentAmount),
    totalInterest: roundFinancial(finalTotalInterest),
    endMonth: currentSchedule.length,
    monthlyPayment: currentSchedule[currentSchedule.length - 1]?.payment || 0,
  };

  return {
    original,
    afterPrepayments,
    totalBenefit: {
      interestSaved: roundFinancial(original.totalInterest - afterPrepayments.totalInterest),
      totalSaved: roundFinancial(original.totalPayment - afterPrepayments.totalPayment),
      totalPrepaymentAmount,
    },
    prepayments: sortedPrepayments,
    schedule: currentSchedule,
  };
};

/**
 * 最適な繰上返済タイミングを分析
 *
 * @param params 分析パラメータ
 * @returns 分析結果
 */
export const analyzeBestPrepaymentTiming = (params: {
  loanParams: LoanParams;
  availableFunds: number;
  targetYear?: number;
}): OptimalPrepaymentAnalysis => {
  const { loanParams, availableFunds, targetYear } = params;

  const totalMonths = getTotalMonths(loanParams.years, loanParams.months);
  const maxMonth = targetYear ? Math.min(targetYear * 12, totalMonths) : Math.min(120, totalMonths); // 最大10年分を分析

  const comparisons: { month: number; savings: number }[] = [];

  // 各月に繰上返済した場合の節約額を計算
  for (let month = 1; month <= maxMonth; month += 6) { // 6ヶ月刻みで分析
    try {
      const effect = calculatePrepaymentEffect({
        loanParams,
        prepaymentAmount: availableFunds,
        prepaymentMonth: month,
        prepaymentType: 'period', // 期間短縮型で分析
      });

      comparisons.push({
        month,
        savings: effect.benefit.interestSaved,
      });
    } catch {
      // エラーの場合はスキップ
      continue;
    }
  }

  if (comparisons.length === 0) {
    throw new Error('有効な繰上返済タイミングが見つかりませんでした');
  }

  // 最も節約額が大きい月を推奨
  const best = comparisons.reduce((max, current) =>
    current.savings > max.savings ? current : max
  );

  const reasoning = `繰上返済は早い時期に行うほど利息削減効果が高くなります。
${best.month}ヶ月目（${Math.floor(best.month / 12)}年${best.month % 12}ヶ月）に繰上返済を行うと、
約${(best.savings / 10000).toFixed(0)}万円の利息を削減できます。`;

  return {
    recommendedMonth: best.month,
    expectedSavings: roundFinancial(best.savings),
    reasoning,
    monthlyComparison: comparisons,
  };
};
