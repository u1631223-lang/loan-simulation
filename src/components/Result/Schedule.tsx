/**
 * Schedule コンポーネント
 * 返済計画表の表示
 */

import { useState } from 'react';
import type { PaymentSchedule } from '@/types';

interface ScheduleProps {
  schedule: PaymentSchedule[];
  className?: string;
}

const Schedule: React.FC<ScheduleProps> = ({ schedule, className = '' }) => {
  const [displayCount, setDisplayCount] = useState(12);
  const [showAll, setShowAll] = useState(false);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayedSchedule = showAll
    ? schedule
    : schedule.slice(0, displayCount);

  const handleToggleDisplay = () => {
    if (showAll) {
      setShowAll(false);
      setDisplayCount(12);
    } else {
      setShowAll(true);
    }
  };

  if (!schedule || schedule.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-medium">返済計画がありません</p>
          <p className="text-sm mt-2">計算を実行してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
        📊 返済計画表
      </h2>

      <div className="text-sm text-gray-600 mb-4">
        <p>総返済回数: {schedule.length}ヶ月</p>
        <p>表示中: {displayedSchedule.length}ヶ月分</p>
      </div>

      {/* テーブル（レスポンシブ） */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-3 py-2 text-left font-medium text-gray-700 min-w-[60px]">
                回数
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-700 min-w-[100px]">
                返済額
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-700 min-w-[100px]">
                元金
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-700 min-w-[100px]">
                利息
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-700 min-w-[100px]">
                残高
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedSchedule.map((payment) => (
              <tr
                key={payment.month}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  payment.isBonus ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-3 py-2 text-left">
                  <span className="font-medium text-gray-800">
                    {payment.month}
                  </span>
                  {payment.isBonus && (
                    <span className="ml-1 text-xs text-yellow-700 font-medium">
                      ボーナス
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right font-medium text-gray-800">
                  {formatCurrency(payment.payment)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {formatCurrency(payment.principal)}
                </td>
                <td className="px-3 py-2 text-right text-red-600">
                  {formatCurrency(payment.interest)}
                </td>
                <td className="px-3 py-2 text-right text-gray-600">
                  {formatCurrency(payment.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* もっと見る/閉じる ボタン */}
      {schedule.length > 12 && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleToggleDisplay}
            className="px-6 py-2 text-sm font-medium text-primary border-2 border-primary rounded-lg
                     hover:bg-primary hover:text-white
                     focus:outline-none focus:ring-4 focus:ring-primary/30
                     transition-colors duration-150"
          >
            {showAll
              ? '閉じる'
              : `すべて表示 (残り ${schedule.length - displayCount}ヶ月)`}
          </button>
        </div>
      )}

      {/* サマリー統計 */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">初回返済額</p>
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(schedule[0].payment)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">最終回返済額</p>
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(schedule[schedule.length - 1].payment)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">総返済回数</p>
          <p className="text-lg font-bold text-gray-800">
            {schedule.length}ヶ月
          </p>
        </div>
      </div>

      {/* 注意書き */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 ボーナス返済がある場合、該当月は黄色で表示されます
        </p>
      </div>
    </div>
  );
};

export default Schedule;
