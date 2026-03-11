/**
 * InterestRateComparisonPanel コンポーネント
 * 金利上昇比較パネル（現在 / +0.25% / +0.50%）
 */

import React, { useMemo } from 'react';
import type { LoanParams, LoanResult } from '@/types';
import { calculateInterestComparisons } from '@/utils/interestRateComparison';
import type { InterestComparisonItem } from '@/utils/interestRateComparison';
import InterestComparisonChart from './InterestComparisonChart';

interface InterestRateComparisonPanelProps {
  baseParams: LoanParams;
  baseResult: LoanResult;
  className?: string;
}

const CARD_LABELS: Record<string, string> = {
  current: '現在',
  plus025: '+0.25%',
  plus050: '+0.50%',
};

const CARD_BORDERS = [
  'border-blue-200',
  'border-amber-200',
  'border-red-200',
];

const CARD_HEADERS = [
  'bg-blue-50 text-blue-800',
  'bg-amber-50 text-amber-800',
  'bg-red-50 text-red-800',
];

const formatYen = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP').format(amount) + '円';
};

const formatDiff = (diff: number): string => {
  if (diff === 0) return '-';
  const sign = diff > 0 ? '+' : '';
  return sign + new Intl.NumberFormat('ja-JP').format(diff) + '円';
};

const InterestRateComparisonPanel: React.FC<InterestRateComparisonPanelProps> = ({
  baseParams,
  baseResult,
  className = '',
}) => {
  const items = useMemo(
    () => calculateInterestComparisons(baseParams, baseResult),
    [baseParams, baseResult]
  );

  const plus025 = items.find((i) => i.label === 'plus025');
  const summaryText = plus025
    ? `金利が0.25%上がると、月々返済は約${formatYen(Math.abs(plus025.monthlyDiff))}増えます`
    : '';

  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-gray-800 mb-1">金利上昇比較</h3>
      <p className="text-sm text-gray-500 mb-3">
        現在の条件のまま、金利上昇時の返済額を比較しています
      </p>

      {summaryText && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-amber-800">{summaryText}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item, index) => (
          <ComparisonCard key={item.label} item={item} index={index} />
        ))}
      </div>

      <InterestComparisonChart items={items} />
    </div>
  );
};

interface ComparisonCardProps {
  item: InterestComparisonItem;
  index: number;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ item, index }) => {
  return (
    <div className={`rounded-lg border-2 ${CARD_BORDERS[index]} overflow-hidden`}>
      <div className={`px-3 py-2 text-sm font-bold ${CARD_HEADERS[index]}`}>
        {CARD_LABELS[item.label]}
        <span className="ml-2 font-normal">({item.interestRate.toFixed(3)}%)</span>
      </div>
      <div className="p-3 space-y-2 text-sm">
        <div>
          <p className="text-gray-500 text-xs">月々返済額</p>
          <p className="font-bold text-gray-800">{formatYen(item.monthlyPayment)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">総返済額</p>
          <p className="font-bold text-gray-800">{formatYen(item.totalPayment)}</p>
        </div>
        {item.label !== 'current' && (
          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">月々差額</span>
              <span className="text-red-600 font-bold text-xs">{formatDiff(item.monthlyDiff)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">総返済差額</span>
              <span className="text-red-600 font-bold text-xs">{formatDiff(item.totalDiff)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestRateComparisonPanel;
