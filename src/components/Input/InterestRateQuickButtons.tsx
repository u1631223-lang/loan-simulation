/**
 * InterestRateQuickButtons コンポーネント
 * 金利プリセットボタン群 + +0.25加算ボタン
 */

import React from 'react';

interface InterestRateQuickButtonsProps {
  value: number;
  onChange: (nextRate: number) => void;
  disabled?: boolean;
}

const PRESET_RATES = [0.625, 0.700, 0.780, 0.800, 0.850, 0.880, 0.900];

const roundRate = (rate: number): number => Math.round(rate * 1000) / 1000;

const InterestRateQuickButtons: React.FC<InterestRateQuickButtonsProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handlePreset = (rate: number) => {
    onChange(roundRate(rate));
  };

  const handlePlus025 = () => {
    const next = roundRate(value + 0.25);
    if (next <= 20) {
      onChange(next);
    }
  };

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500 mb-1.5">よく使う金利</p>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_RATES.map((rate) => (
          <button
            key={rate}
            type="button"
            disabled={disabled}
            onClick={() => handlePreset(rate)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors
              ${value === rate
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {rate.toFixed(3)}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={handlePlus025}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +0.25
        </button>
      </div>
    </div>
  );
};

export default InterestRateQuickButtons;
