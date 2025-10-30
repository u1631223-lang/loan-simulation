/**
 * 返済負担率計算ユーティリティ
 *
 * 返済負担率に基づいて借入可能な金額を計算します。
 * 無料版: 返済負担率25%固定
 * 有料版: 複数の返済負担率で比較（将来実装）
 */

import type { RepaymentRatioParams, RepaymentRatioResult } from '@/types/repaymentRatio';
import { calculatePrincipalFromPayment, getTotalMonths } from './loanCalculator';

/**
 * 返済負担率から借入可能額を計算
 *
 * @param params 返済負担率計算パラメータ
 * @returns 計算結果（借入可能額、月々返済額など）
 */
export const calculateFromRepaymentRatio = (
  params: RepaymentRatioParams
): RepaymentRatioResult => {
  const {
    primaryIncome,
    coDebtorIncome,
    repaymentRatio,
    interestRate,
    years,
  } = params;

  // Step 1: 合算年収の計算
  const totalIncome = primaryIncome + coDebtorIncome;

  // Step 2: 年間返済可能額の計算
  // 万円 → 円に変換
  const annualPayment = totalIncome * 10000 * repaymentRatio;

  // Step 3: 月々返済可能額の計算
  const monthlyPayment = annualPayment / 12;

  // Step 4: 借入可能額を逆算
  const totalMonths = getTotalMonths(years);
  const maxBorrowable = calculatePrincipalFromPayment(
    monthlyPayment,
    interestRate,
    totalMonths
  );

  // Step 5: 総返済額・利息計算
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - maxBorrowable;

  return {
    maxBorrowable: Math.round(maxBorrowable),
    monthlyPayment: Math.round(monthlyPayment),
    annualPayment: Math.round(annualPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    totalIncome,
    repaymentRatio,
  };
};
