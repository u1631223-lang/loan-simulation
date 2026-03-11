/**
 * InterestRatePresets - 金利プリセットボタン & +0.25%比較ボタン
 *
 * 実務で使われる金利値をワンタップで選択可能にする。
 * +0.25ボタンで金利上昇時の比較用値を機械的に加算する。
 */

import React from 'react';

/** 実務寄りのプリセット金利値 */
const PRESET_RATES = [0.625, 0.700, 0.780, 0.800, 0.850, 0.880, 0.900];

interface InterestRatePresetsProps {
  currentRate: number;
  onSelectRate: (rate: number) => void;
}

/** 小数第3位までの丸め（浮動小数点対策） */
const roundRate = (rate: number): number => Math.round(rate * 1000) / 1000;

const InterestRatePresets: React.FC<InterestRatePresetsProps> = ({
  currentRate,
  onSelectRate,
}) => {
  const handlePresetClick = (rate: number) => {
    onSelectRate(rate);
  };

  const handlePlusQuarter = () => {
    const newRate = roundRate(currentRate + 0.25);
    onSelectRate(newRate);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 font-medium">金利プリセット</p>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_RATES.map((rate) => {
          // 完全一致のみハイライト
          const isActive = roundRate(currentRate) === rate;
          return (
            <button
              key={rate}
              type="button"
              onClick={() => handlePresetClick(rate)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                isActive
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {rate.toFixed(3)}%
            </button>
          );
        })}
        <button
          type="button"
          onClick={handlePlusQuarter}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
        >
          +0.25
        </button>
      </div>
    </div>
  );
};

export default InterestRatePresets;
export { PRESET_RATES, roundRate };
