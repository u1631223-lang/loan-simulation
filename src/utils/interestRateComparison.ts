/**
 * 金利上昇比較ユーティリティ
 *
 * 現在の条件をそのまま使って、金利だけ変えた再計算を行う。
 * 既存の計算ロジック（loanCalculator.ts）を再利用する。
 */

import type { LoanParams, LoanResult } from '@/types';
import {
  calculateWithBonus,
  calculateEqualPayment,
  calculateEqualPrincipal,
  generateEqualPaymentSchedule,
  calculateTotalFromSchedule,
  calculateTotalInterestFromSchedule,
  getTotalMonths,
  roundFinancial,
} from '@/utils/loanCalculator';

export interface InterestComparisonItem {
  label: 'current' | 'plus025' | 'plus050';
  interestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  monthlyDiff: number;
  totalDiff: number;
}

export const calculateInterestComparisons = (
  params: LoanParams,
  baseResult: LoanResult
): InterestComparisonItem[] => {
  const rates = [
    { label: 'current' as const, rate: params.interestRate },
    { label: 'plus025' as const, rate: params.interestRate + 0.25 },
    { label: 'plus050' as const, rate: params.interestRate + 0.5 },
  ];

  const totalMonths = getTotalMonths(params.years, params.months);

  return rates.map(({ label, rate }) => {
    let monthlyPayment: number;
    let totalPayment: number;
    let totalInterest: number;

    if (params.bonusPayment?.enabled) {
      const result = calculateWithBonus(
        params.principal,
        rate,
        totalMonths,
        params.bonusPayment.amount,
        params.bonusPayment.months,
        params.repaymentType
      );
      monthlyPayment = result.monthlyPayment;
      totalPayment = result.totalPayment;
      totalInterest = result.totalInterest;
    } else if (params.repaymentType === 'equal-payment') {
      monthlyPayment = calculateEqualPayment(params.principal, rate, totalMonths);
      const schedule = generateEqualPaymentSchedule(params.principal, rate, totalMonths);
      totalPayment = roundFinancial(calculateTotalFromSchedule(schedule));
      totalInterest = roundFinancial(calculateTotalInterestFromSchedule(schedule));
    } else {
      const schedule = calculateEqualPrincipal(params.principal, rate, totalMonths);
      monthlyPayment = roundFinancial(schedule[0]?.payment || 0);
      totalPayment = roundFinancial(calculateTotalFromSchedule(schedule));
      totalInterest = roundFinancial(calculateTotalInterestFromSchedule(schedule));
    }

    return {
      label,
      interestRate: rate,
      monthlyPayment,
      totalPayment,
      totalInterest,
      monthlyDiff: monthlyPayment - baseResult.monthlyPayment,
      totalDiff: totalPayment - baseResult.totalPayment,
    };
  });
};
