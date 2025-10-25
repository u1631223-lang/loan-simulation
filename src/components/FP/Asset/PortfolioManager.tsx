/**
 * Phase 15: ポートフォリオ管理UI
 *
 * アセットアロケーション設定・期待リターン計算・リバランス提案
 */

import { useState, useEffect } from 'react';
import type { AssetClass, AssetAllocation } from '@/types/investment';
import {
  ASSET_CLASSES,
  calculatePortfolioReturn,
  validatePortfolio,
} from '@/utils/assetCalculator';

interface PortfolioManagerProps {
  initialAllocations?: AssetAllocation[];
  onAllocationsChange?: (allocations: AssetAllocation[]) => void;
}

export const PortfolioManager = ({
  initialAllocations = [],
  onAllocationsChange,
}: PortfolioManagerProps) => {
  // デフォルトアロケーション（バランス型: 株式50%, 債券30%, REIT10%, 現金10%）
  const defaultAllocations: AssetAllocation[] = [
    { assetClass: 'foreign_stocks', percentage: 30 },
    { assetClass: 'domestic_stocks', percentage: 20 },
    { assetClass: 'foreign_bonds', percentage: 20 },
    { assetClass: 'domestic_bonds', percentage: 10 },
    { assetClass: 'reit', percentage: 10 },
    { assetClass: 'cash', percentage: 10 },
  ];

  const [allocations, setAllocations] = useState<AssetAllocation[]>(
    initialAllocations.length > 0 ? initialAllocations : defaultAllocations
  );

  const [totalPercentage, setTotalPercentage] = useState(0);
  const [portfolioReturn, setPortfolioReturn] = useState({
    expectedReturn: 0,
    risk: 0,
    sharpeRatio: 0,
  });

  // 合計割合・期待リターン計算
  useEffect(() => {
    const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
    setTotalPercentage(total);

    const result = calculatePortfolioReturn(allocations);
    setPortfolioReturn(result);

    if (onAllocationsChange) {
      onAllocationsChange(allocations);
    }
  }, [allocations, onAllocationsChange]);

  const handlePercentageChange = (assetClass: AssetClass, value: number) => {
    const newValue = Math.max(0, Math.min(100, value));
    setAllocations((prev) =>
      prev.map((a) =>
        a.assetClass === assetClass ? { ...a, percentage: newValue } : a
      )
    );
  };

  const handleReset = () => {
    setAllocations(defaultAllocations);
  };

  const validation = validatePortfolio(allocations);
  const isValid = validation.isValid;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">
          アセットアロケーション設定
        </h3>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          デフォルトに戻す
        </button>
      </div>

      {/* 期待リターン・リスク表示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">期待リターン（年利）</div>
          <div className="text-2xl font-bold text-blue-700">
            {portfolioReturn.expectedReturn.toFixed(2)}%
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">リスク（標準偏差）</div>
          <div className="text-2xl font-bold text-orange-700">
            {portfolioReturn.risk.toFixed(2)}%
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">シャープレシオ</div>
          <div className="text-2xl font-bold text-green-700">
            {portfolioReturn.sharpeRatio.toFixed(2)}
          </div>
        </div>
      </div>

      {/* アロケーション設定 */}
      <div className="space-y-4">
        {allocations.map((allocation) => {
          const assetInfo = ASSET_CLASSES[allocation.assetClass];
          return (
            <div key={allocation.assetClass} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-800">{assetInfo.label}</div>
                  <div className="text-xs text-gray-500">
                    期待リターン: {(assetInfo.expectedReturn * 100).toFixed(1)}% |
                    リスク: {(assetInfo.risk * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {allocation.percentage.toFixed(1)}%
                </div>
              </div>

              {/* スライダー */}
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={allocation.percentage}
                  onChange={(e) =>
                    handlePercentageChange(allocation.assetClass, parseFloat(e.target.value))
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${allocation.percentage}%, #E5E7EB ${allocation.percentage}%, #E5E7EB 100%)`,
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handlePercentageChange(allocation.assetClass, allocation.percentage - 1)
                    }
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    -1%
                  </button>
                  <button
                    onClick={() =>
                      handlePercentageChange(allocation.assetClass, allocation.percentage + 1)
                    }
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    +1%
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 合計割合表示 */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">合計割合</span>
          <span
            className={`text-2xl font-bold ${
              isValid ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {totalPercentage.toFixed(1)}%
          </span>
        </div>
        {!isValid && (
          <div className="mt-2 text-sm text-red-600">
            {validation.errors.map((error, i) => (
              <div key={i}>{error}</div>
            ))}
          </div>
        )}
        {isValid && totalPercentage !== 100 && (
          <div className="mt-2 text-sm text-yellow-600">
            合計が100%に近づけることをお勧めします
          </div>
        )}
      </div>

      {/* ヘルプテキスト */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
        <div className="font-semibold mb-2">アセットアロケーションのポイント</div>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>期待リターン</strong>: ポートフォリオ全体の年間期待収益率（過去データに基づく）
          </li>
          <li>
            <strong>リスク（標準偏差）</strong>: 価格変動の大きさ。高いほど不安定
          </li>
          <li>
            <strong>シャープレシオ</strong>: リスク1単位あたりのリターン。高いほど効率的
          </li>
          <li>
            長期投資では株式の割合を高め、短期や安定志向では債券・現金を増やす
          </li>
        </ul>
      </div>
    </div>
  );
};
