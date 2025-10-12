/**
 * Summary コンポーネント
 * ローン計算結果のサマリー表示
 */

import type { LoanResult, CalculationMode } from '@/types';

interface SummaryProps {
  result: LoanResult | null;
  loading?: boolean;
  className?: string;
  mode?: CalculationMode;
}

const Summary: React.FC<SummaryProps> = ({
  result,
  loading = false,
  className = '',
  mode = 'forward',
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-medium">まだ計算結果がありません</p>
          <p className="text-sm mt-2">
            左側のフォームからローン情報を入力してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">
        💰 計算結果
      </h2>

      {/* 逆算モード: 借入可能額を強調表示 */}
      {mode === 'reverse' && (
        <div className="bg-secondary/10 rounded-lg p-4 mb-4 border-2 border-secondary/20">
          <p className="text-sm text-gray-600 mb-1 font-medium">借入可能額</p>
          <p className="text-3xl sm:text-4xl font-bold text-secondary">
            {formatCurrency(result.totalPrincipal)}
          </p>
        </div>
      )}

      {/* 月々返済額（メイン表示） */}
      <div className="bg-primary/10 rounded-lg p-4 mb-4 border-2 border-primary/20">
        <p className="text-sm text-gray-600 mb-1 font-medium">月々返済額</p>
        <p className="text-3xl sm:text-4xl font-bold text-primary">
          {formatCurrency(result.monthlyPayment)}
        </p>
      </div>

      {/* ボーナス返済額（ある場合） */}
      {result.bonusPayment && (
        <div className="bg-secondary/10 rounded-lg p-4 mb-4 border-2 border-secondary/20">
          <p className="text-sm text-gray-600 mb-1 font-medium">
            ボーナス返済額（1回あたり）
          </p>
          <p className="text-2xl font-bold text-secondary">
            {formatCurrency(result.bonusPayment)}
          </p>
        </div>
      )}

      {/* 詳細情報 */}
      <div className="space-y-3 mt-6">
        <ResultRow label="総返済額" value={result.totalPayment} />
        <ResultRow
          label="利息総額"
          value={result.totalInterest}
          highlight
        />
        <ResultRow label="元金総額" value={result.totalPrincipal} />
      </div>

      {/* 返済計画のヒント */}
      {result.schedule && result.schedule.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            📊 返済計画表: {result.schedule.length}ヶ月分
          </p>
        </div>
      )}
    </div>
  );
};

// ヘルパーコンポーネント
interface ResultRowProps {
  label: string;
  value: number;
  highlight?: boolean;
}

const ResultRow: React.FC<ResultRowProps> = ({ label, value, highlight }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
      <span className="text-gray-600 font-medium">{label}</span>
      <span
        className={`font-bold text-lg ${
          highlight ? 'text-red-600' : 'text-gray-800'
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
};

export default Summary;
