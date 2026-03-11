/**
 * InterestRateComparisonPanel - 金利上昇比較パネル
 *
 * 現在の計算結果をベースに、金利が上昇した場合の
 * 月々返済額・総返済額の変化を一覧表示する。
 */

import React, { useMemo } from 'react';
import type { LoanParams, LoanResult } from '@/types';
import {
  calculateEqualPayment,
  calculateWithBonus,
  calculateEqualPrincipal,
  calculateTotalFromSchedule,
  roundFinancial,
} from '@/utils/loanCalculator';

interface InterestRateComparisonPanelProps {
  baseParams: LoanParams;
  baseResult: LoanResult | null;
}

/** 比較する金利上昇幅 */
const RATE_OFFSETS = [0.25, 0.50, 1.00];

/** 丸め（浮動小数点対策） */
const roundRate = (rate: number): number => Math.round(rate * 1000) / 1000;

interface ComparisonRow {
  rate: number;
  monthlyPayment: number;
  totalPayment: number;
  monthlyDiff: number;
  totalDiff: number;
}

const InterestRateComparisonPanel: React.FC<InterestRateComparisonPanelProps> = ({
  baseParams,
  baseResult,
}) => {
  const rows = useMemo<ComparisonRow[]>(() => {
    if (!baseResult) return [];

    const totalMonths = baseParams.years * 12 + baseParams.months;
    if (totalMonths <= 0) return [];

    return RATE_OFFSETS.map((offset) => {
      const newRate = roundRate(baseParams.interestRate + offset);

      let monthlyPayment: number;
      let totalPayment: number;

      if (baseParams.bonusPayment?.enabled && baseParams.bonusPayment.amount > 0) {
        const result = calculateWithBonus(
          baseParams.principal,
          newRate,
          totalMonths,
          baseParams.bonusPayment.amount,
          baseParams.bonusPayment.months,
          baseParams.repaymentType
        );
        monthlyPayment = result.monthlyPayment;
        totalPayment = result.totalPayment;
      } else if (baseParams.repaymentType === 'equal-payment') {
        monthlyPayment = roundFinancial(
          calculateEqualPayment(baseParams.principal, newRate, totalMonths)
        );
        // 簡易計算: monthlyPayment * totalMonths
        totalPayment = roundFinancial(monthlyPayment * totalMonths);
      } else {
        const schedule = calculateEqualPrincipal(
          baseParams.principal,
          newRate,
          totalMonths
        );
        monthlyPayment = schedule[0]?.payment || 0;
        totalPayment = roundFinancial(calculateTotalFromSchedule(schedule));
      }

      return {
        rate: newRate,
        monthlyPayment,
        totalPayment,
        monthlyDiff: monthlyPayment - baseResult.monthlyPayment,
        totalDiff: totalPayment - baseResult.totalPayment,
      };
    });
  }, [baseParams, baseResult]);

  if (!baseResult || rows.length === 0) return null;

  const formatYen = (n: number) =>
    n.toLocaleString('ja-JP', { maximumFractionDigits: 0 });

  const formatDiff = (n: number) => {
    if (n === 0) return '±0';
    const sign = n > 0 ? '+' : '';
    return `${sign}${formatYen(n)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        金利上昇時の比較
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        現在 {baseParams.interestRate.toFixed(3)}% からの変化
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left text-gray-600 font-medium">金利</th>
              <th className="py-2 text-right text-gray-600 font-medium">月々返済</th>
              <th className="py-2 text-right text-gray-600 font-medium">差額/月</th>
              <th className="py-2 text-right text-gray-600 font-medium">総返済差額</th>
            </tr>
          </thead>
          <tbody>
            {/* 現在の金利 */}
            <tr className="border-b border-gray-100 bg-blue-50">
              <td className="py-2 font-medium text-primary">
                {baseParams.interestRate.toFixed(3)}%
              </td>
              <td className="py-2 text-right font-medium">
                {formatYen(baseResult.monthlyPayment)}円
              </td>
              <td className="py-2 text-right text-gray-400">-</td>
              <td className="py-2 text-right text-gray-400">-</td>
            </tr>
            {rows.map((row) => (
              <tr key={row.rate} className="border-b border-gray-100">
                <td className="py-2 font-medium text-gray-800">
                  {row.rate.toFixed(3)}%
                </td>
                <td className="py-2 text-right">
                  {formatYen(row.monthlyPayment)}円
                </td>
                <td className={`py-2 text-right font-medium ${
                  row.monthlyDiff > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {formatDiff(row.monthlyDiff)}円
                </td>
                <td className={`py-2 text-right font-medium ${
                  row.totalDiff > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {formatDiff(row.totalDiff)}円
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterestRateComparisonPanel;
