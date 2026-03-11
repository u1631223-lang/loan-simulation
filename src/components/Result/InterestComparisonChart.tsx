/**
 * InterestComparisonChart コンポーネント
 * 月々返済額の棒グラフ（divベース、外部ライブラリ不要）
 */

import React from 'react';
import type { InterestComparisonItem } from '@/utils/interestRateComparison';

interface InterestComparisonChartProps {
  items: InterestComparisonItem[];
}

const LABELS: Record<string, string> = {
  current: '現在',
  plus025: '+0.25%',
  plus050: '+0.50%',
};

const BAR_COLORS = [
  'bg-blue-500',
  'bg-amber-500',
  'bg-red-500',
];

const formatYen = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP').format(amount) + '円';
};

const InterestComparisonChart: React.FC<InterestComparisonChartProps> = ({ items }) => {
  if (items.length === 0) return null;

  const maxPayment = Math.max(...items.map((item) => item.monthlyPayment));

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-3">月々返済額の比較</p>
      <div className="space-y-3">
        {items.map((item, index) => {
          const widthPercent = maxPayment > 0 ? (item.monthlyPayment / maxPayment) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium w-16">
                  {LABELS[item.label]}
                </span>
                <span className="text-gray-800 font-bold">{formatYen(item.monthlyPayment)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[index]} transition-all duration-500 ease-out`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterestComparisonChart;
