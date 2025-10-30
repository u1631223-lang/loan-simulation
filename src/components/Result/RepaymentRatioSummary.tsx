/**
 * RepaymentRatioSummary - 返済負担率計算結果表示
 *
 * 借入可能額、月々返済額、総返済額などを表示
 */

import React from 'react';
import type { RepaymentRatioResult } from '@/types/repaymentRatio';

interface RepaymentRatioSummaryProps {
  result: RepaymentRatioResult;
}

export const RepaymentRatioSummary: React.FC<RepaymentRatioSummaryProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">💰 計算結果</h3>

      <div className="space-y-3">
        {/* 借入可能額 */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <span className="text-gray-700 font-medium">借入可能額</span>
          <span className="text-3xl font-bold text-primary">
            {(result.maxBorrowable / 10000).toLocaleString('ja-JP', {
              maximumFractionDigits: 0,
            })}
            <span className="text-lg ml-1">万円</span>
          </span>
        </div>

        {/* 月々返済額 */}
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">月々返済額</span>
          <span className="text-lg font-semibold text-gray-900">
            {result.monthlyPayment.toLocaleString('ja-JP')}円
          </span>
        </div>

        {/* 年間返済額 */}
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">年間返済額</span>
          <span className="text-lg font-semibold text-gray-900">
            {result.annualPayment.toLocaleString('ja-JP')}円
          </span>
        </div>

        {/* 総返済額 */}
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">総返済額</span>
          <span className="text-lg font-semibold text-gray-900">
            {result.totalPayment.toLocaleString('ja-JP')}円
          </span>
        </div>

        {/* 利息総額 */}
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">利息総額</span>
          <span className="text-lg font-semibold text-orange-600">
            {result.totalInterest.toLocaleString('ja-JP')}円
          </span>
        </div>
      </div>

      {/* 情報ボックス */}
      <div className="mt-6 space-y-3">
        {/* 合算年収 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            💼 合算年収:{' '}
            <span className="font-semibold text-gray-900">
              {result.totalIncome.toLocaleString('ja-JP')}万円
            </span>
          </p>
        </div>

        {/* 返済負担率 */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            📊 返済負担率:{' '}
            <span className="font-semibold text-primary">
              {(result.repaymentRatio * 100).toFixed(0)}%
            </span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            年間返済額（{result.annualPayment.toLocaleString('ja-JP')}円）÷ 合算年収（
            {(result.totalIncome * 10000).toLocaleString('ja-JP')}円）
          </p>
        </div>

        {/* アドバイス */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 font-medium mb-2">
            💡 アドバイス
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>返済負担率25%は、無理のない返済計画の目安です</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>将来の収入変動やライフイベントも考慮しましょう</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>頭金を増やすと、借入額を抑えられます</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
