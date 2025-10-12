/**
 * HistoryList コンポーネント
 * 計算履歴の表示と管理
 */

import type { LoanParams, LoanResult } from '@/types';

export interface HistoryItem {
  id: string;
  timestamp: number;
  params: LoanParams;
  result: LoanResult;
}

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  className?: string;
}

const HistoryList: React.FC<HistoryListProps> = ({
  items,
  onSelect,
  onDelete,
  onClear,
  className = '',
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRepaymentTypeLabel = (type: string): string => {
    return type === 'equal-payment' ? '元利均等' : '元金均等';
  };

  if (items.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          📜 計算履歴
        </h2>
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-medium">履歴がありません</p>
          <p className="text-sm mt-2">計算を実行すると履歴が保存されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-xl font-bold text-gray-800">📜 計算履歴</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-red-600 hover:text-red-700 font-medium
                     px-3 py-1 rounded-lg hover:bg-red-50
                     transition-colors duration-150"
          aria-label="すべての履歴を削除"
        >
          すべて削除
        </button>
      </div>

      {/* 履歴件数 */}
      <p className="text-sm text-gray-600 mb-4">
        {items.length}件の履歴（最大20件まで保存）
      </p>

      {/* 履歴リスト */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary/50
                     transition-colors duration-150 cursor-pointer group"
            onClick={() => onSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(item);
              }
            }}
          >
            {/* 上部: タイムスタンプと削除ボタン */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">
                {formatDate(item.timestamp)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700
                         text-xs font-medium px-2 py-1 rounded hover:bg-red-50
                         transition-all duration-150"
                aria-label="この履歴を削除"
              >
                削除
              </button>
            </div>

            {/* メイン情報 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">借入金額</p>
                <p className="font-bold text-gray-800">
                  {formatCurrency(item.params.principal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">金利</p>
                <p className="font-bold text-gray-800">
                  {item.params.interestRate}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">返済期間</p>
                <p className="font-bold text-gray-800">
                  {item.params.years}年
                  {item.params.months > 0 ? `${item.params.months}ヶ月` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">返済方式</p>
                <p className="font-bold text-gray-800">
                  {getRepaymentTypeLabel(item.params.repaymentType)}
                </p>
              </div>
            </div>

            {/* 結果サマリー */}
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">月々返済額</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(item.result.monthlyPayment)}
                </span>
              </div>
              {item.result.bonusPayment && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary/20">
                  <span className="text-xs text-gray-600">ボーナス返済</span>
                  <span className="text-sm font-bold text-secondary">
                    {formatCurrency(item.result.bonusPayment)}
                  </span>
                </div>
              )}
            </div>

            {/* ホバー時のヒント */}
            <div className="mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              クリックして詳細を表示
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
