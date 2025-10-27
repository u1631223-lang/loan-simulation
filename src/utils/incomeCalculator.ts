/**
 * 年収ベース借入可能額計算ユーティリティ
 *
 * 返済負担率に基づいて借入可能な最大額を計算します。
 * - 年収400万円未満: 返済負担率30%
 * - 年収400万円以上: 返済負担率35%
 */

import type { IncomeParams, IncomeResult } from '@/types/income';
import { calculatePrincipalFromPayment, getTotalMonths } from './loanCalculator';

/**
 * 年収から借入可能額を計算
 *
 * @param params 年収計算パラメータ
 * @returns 計算結果（借入可能額、月々返済額など）
 */
export const calculateMaxBorrowable = (params: IncomeParams): IncomeResult => {
  const {
    primaryIncome,
    interestRate,
    years,
    hasCoDebtor,
    coDebtorType,
    coDebtorIncome,
  } = params;

  // Step 1: 合算年収の計算
  let totalIncome = primaryIncome;

  if (hasCoDebtor && coDebtorIncome && coDebtorType) {
    if (coDebtorType === 'joint-debtor') {
      // 連帯債務者: 年収を100%合算
      totalIncome += coDebtorIncome;
    } else if (coDebtorType === 'guarantor') {
      // 連帯保証人: 年収を50%合算
      totalIncome += coDebtorIncome * 0.5;
    }
  }

  // Step 2: 返済負担率の決定
  // 年収400万円未満: 30%, 400万円以上: 35%
  const repaymentRatio = totalIncome < 400 ? 0.30 : 0.35;

  // Step 3: 年間返済可能額の計算
  const annualRepayment = totalIncome * 10000 * repaymentRatio; // 万円→円変換
  const monthlyPayment = annualRepayment / 12;

  // Step 4: 借入可能額を逆算
  const totalMonths = getTotalMonths(years);
  const maxBorrowableAmount = calculatePrincipalFromPayment(
    monthlyPayment,
    interestRate,
    totalMonths
  );

  return {
    maxBorrowableAmount,
    monthlyPayment: Math.round(monthlyPayment),
    repaymentRatio,
    totalIncome,
    annualRepayment: Math.round(annualRepayment),
  };
};

/**
 * 入力パラメータの検証
 *
 * @param params 年収計算パラメータ
 * @returns エラーメッセージ（問題なければ空オブジェクト）
 */
export const validateIncomeParams = (params: IncomeParams): Record<string, string> => {
  const errors: Record<string, string> = {};

  // 本人年収の検証
  if (params.primaryIncome <= 0) {
    errors.primaryIncome = '年収は0より大きい値を入力してください';
  } else if (params.primaryIncome < 100) {
    errors.primaryIncome = '年収は100万円以上を入力してください';
  } else if (params.primaryIncome > 3000) {
    errors.primaryIncome = '年収は3000万円以下を入力してください';
  }

  // 金利の検証
  if (params.interestRate < 0) {
    errors.interestRate = '金利は0%以上を入力してください';
  } else if (params.interestRate > 10) {
    errors.interestRate = '金利は10%以下を入力してください';
  }

  // 返済期間の検証
  if (params.years <= 0) {
    errors.years = '返済期間は0より大きい値を入力してください';
  } else if (params.years < 5) {
    errors.years = '返済期間は5年以上を入力してください';
  } else if (params.years > 50) {
    errors.years = '返済期間は50年以下を入力してください';
  }

  // 連帯債務者/保証人の検証
  if (params.hasCoDebtor) {
    if (!params.coDebtorType) {
      errors.coDebtorType = '連帯債務者または連帯保証人を選択してください';
    }

    if (!params.coDebtorIncome || params.coDebtorIncome <= 0) {
      errors.coDebtorIncome = '相手の年収を入力してください';
    } else if (params.coDebtorIncome < 100) {
      errors.coDebtorIncome = '年収は100万円以上を入力してください';
    } else if (params.coDebtorIncome > 3000) {
      errors.coDebtorIncome = '年収は3000万円以下を入力してください';
    }
  }

  return errors;
};
