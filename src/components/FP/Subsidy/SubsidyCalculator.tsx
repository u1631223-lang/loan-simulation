/**
 * SubsidyCalculator - 浄化槽補助金計算コンポーネント
 *
 * 人槽・撤去有無・配管工事の有無から補助金額を自動計算
 */

import { useState, useMemo } from 'react';
import { calculateSubsidy, formatSubsidyAmount } from '@/utils/subsidyCalculator';
import type { SubsidyCalculationParams, DemolitionType } from '@/types/subsidy';
import { SUBSIDY_CATEGORY_LABELS } from '@/types/subsidy';

interface SubsidyCalculatorProps {
  onCalculated?: (result: ReturnType<typeof calculateSubsidy>) => void;
  initialCapacity?: number;
  initialHasDemolition?: boolean;
}

export const SubsidyCalculator: React.FC<SubsidyCalculatorProps> = ({
  onCalculated,
  initialCapacity = 5,
  initialHasDemolition = false,
}) => {
  const [tankCapacity, setTankCapacity] = useState(initialCapacity);
  const [hasDemolition, setHasDemolition] = useState(initialHasDemolition);
  const [demolitionType, setDemolitionType] = useState<DemolitionType>('single_tank');
  const [hasPlumbing, setHasPlumbing] = useState(false);
  const [conversionType, setConversionType] = useState<'new' | 'conversion'>('new');

  const params: SubsidyCalculationParams = useMemo(() => ({
    municipality_id: '',
    tank_capacity: tankCapacity,
    has_demolition: hasDemolition,
    demolition_type: hasDemolition ? demolitionType : undefined,
    has_plumbing: hasPlumbing,
    conversion_type: conversionType,
  }), [tankCapacity, hasDemolition, demolitionType, hasPlumbing, conversionType]);

  const result = useMemo(() => {
    const r = calculateSubsidy(params);
    onCalculated?.(r);
    return r;
  }, [params, onCalculated]);

  const capacityOptions = [
    { value: 5, label: '5人槽' },
    { value: 7, label: '6〜7人槽' },
    { value: 10, label: '8〜10人槽' },
  ];

  return (
    <div className="space-y-6">
      {/* 設置タイプ */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          設置タイプ
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setConversionType('new')}
            className={`px-4 py-3 rounded-lg border-2 font-medium transition text-sm ${
              conversionType === 'new'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            新規設置
          </button>
          <button
            onClick={() => setConversionType('conversion')}
            className={`px-4 py-3 rounded-lg border-2 font-medium transition text-sm ${
              conversionType === 'conversion'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            転換（単独→合併）
          </button>
        </div>
      </div>

      {/* 人槽選択 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          浄化槽の人槽
        </label>
        <div className="grid grid-cols-3 gap-2">
          {capacityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTankCapacity(opt.value)}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition text-sm ${
                tankCapacity === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 解体（撤去）有無 */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasDemolition}
            onChange={(e) => setHasDemolition(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-gray-700">
            既存槽の撤去（解体）あり
          </span>
        </label>

        {hasDemolition && (
          <div className="mt-3 ml-8 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="demolitionType"
                checked={demolitionType === 'single_tank'}
                onChange={() => setDemolitionType('single_tank')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">
                単独処理浄化槽の撤去（上限 12万円）
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="demolitionType"
                checked={demolitionType === 'cesspool'}
                onChange={() => setDemolitionType('cesspool')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">
                くみ取り便槽の撤去（上限 9万円）
              </span>
            </label>
          </div>
        )}
      </div>

      {/* 配管工事有無 */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasPlumbing}
            onChange={(e) => setHasPlumbing(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-gray-700">
            配管工事あり（上限 30万円）
          </span>
        </label>
      </div>

      {/* 計算結果 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">補助金額（概算）</h3>

        <div className="space-y-3">
          {result.breakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-sm text-gray-600">{item.label}</span>
                {item.note && (
                  <span className="text-xs text-gray-400 ml-2">({item.note})</span>
                )}
              </div>
              <span className="font-semibold text-gray-800">
                {formatSubsidyAmount(item.amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-blue-200 mt-4 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-800">合計補助金額</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatSubsidyAmount(result.total_subsidy)}
            </span>
          </div>
        </div>

        {!hasDemolition && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              <strong>ご確認:</strong> 既存の浄化槽やくみ取り便槽がある場合、撤去費の補助金（最大12万円）も申請できます。梅村様のように見落としがちなのでご注意ください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
