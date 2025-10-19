/**
 * ReverseLoanForm コンポーネント
 * 逆算用のローンパラメータ入力フォーム（返済額から借入可能額を計算）
 */

import type { ReverseLoanParams } from '@/types';
import ReverseBonusSettings from './ReverseBonusSettings';

interface ReverseLoanFormProps {
  values: ReverseLoanParams;
  onChange: (values: ReverseLoanParams) => void;
  onSubmit: () => void;
  errors?: Record<string, string>;
}

const ReverseLoanForm: React.FC<ReverseLoanFormProps> = ({
  values,
  onChange,
  onSubmit,
  errors = {},
}) => {
  const handleChange = (field: keyof ReverseLoanParams, value: string | number) => {
    onChange({
      ...values,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // 金利を2桁の小数点でフォーマット
  const formatInterestRate = (rate: number | string): string => {
    if (!rate && rate !== 0) return '';
    const num = typeof rate === 'string' ? parseFloat(rate) : rate;
    if (isNaN(num)) return '';
    return num.toFixed(2);
  };

  // 金利の変更ハンドラ
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '' || /^\d*\.?\d*$/.test(input)) {
      handleChange('interestRate', parseFloat(input) || 0);
    }
  };

  // 数値の増減ハンドラ
  const handleIncrement = (field: keyof ReverseLoanParams, step: number) => {
    const currentValue = values[field] as number;
    const newValue = currentValue + step;
    handleChange(field, Math.max(0, newValue));
  };

  const handleDecrement = (field: keyof ReverseLoanParams, step: number) => {
    const currentValue = values[field] as number;
    const newValue = currentValue - step;
    handleChange(field, Math.max(0, newValue));
  };

  // 返済額をカンマ区切りでフォーマット
  const formatPayment = (payment: number | string): string => {
    if (!payment) return '';
    const numStr = payment.toString().replace(/,/g, '');
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parsePayment = (str: string): number => {
    const cleaned = str.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '' || /^[\d,]*$/.test(input)) {
      const numValue = parsePayment(input);
      handleChange('monthlyPayment', numValue);
    }
  };

  const inputClass = (hasError: boolean) => `
    w-full px-4 py-2 rounded-lg border-2
    ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
    focus:outline-none focus:ring-2 focus:ring-primary/50
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-150
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 月々の返済額 */}
      <div>
        <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700 mb-1">
          月々の返済額（円）
        </label>
        <div className="relative flex items-center gap-2">
          <input
            id="monthlyPayment"
            type="text"
            inputMode="numeric"
            value={formatPayment(values.monthlyPayment)}
            onChange={handlePaymentChange}
            className={`${inputClass(!!errors.monthlyPayment)} flex-1`}
            placeholder="150,000"
          />
          <span className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            円
          </span>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleIncrement('monthlyPayment', 1000)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
              aria-label="1000円増やす"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => handleDecrement('monthlyPayment', 1000)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
              aria-label="1000円減らす"
            >
              ▼
            </button>
          </div>
        </div>
        {errors.monthlyPayment && (
          <p className="text-red-500 text-sm mt-1">{errors.monthlyPayment}</p>
        )}
      </div>

      {/* 返済期間 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          返済期間
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="relative flex items-center gap-2">
              <input
                id="years"
                type="text"
                inputMode="numeric"
                value={values.years || ''}
                onChange={(e) => {
                  const input = e.target.value;
                  if (input === '' || /^\d+$/.test(input)) {
                    handleChange('years', parseInt(input) || 0);
                  }
                }}
                className={`${inputClass(!!errors.years)} flex-1`}
                placeholder="35"
              />
              <span className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                年
              </span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleIncrement('years', 1)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
                  aria-label="1年増やす"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleDecrement('years', 1)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
                  aria-label="1年減らす"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className="relative flex items-center gap-2">
              <input
                id="months"
                type="text"
                inputMode="numeric"
                value={values.months === 0 ? '' : values.months}
                onChange={(e) => {
                  const input = e.target.value;
                  if (input === '' || /^\d+$/.test(input)) {
                    handleChange('months', parseInt(input) || 0);
                  }
                }}
                className={`${inputClass(!!errors.months)} flex-1`}
                placeholder="0"
              />
              <span className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                ヶ月
              </span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleIncrement('months', 1)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
                  aria-label="1ヶ月増やす"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleDecrement('months', 1)}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
                  aria-label="1ヶ月減らす"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>
        </div>
        {(errors.years || errors.months) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.years || errors.months}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          1ヶ月 〜 50年（600ヶ月）
        </p>
      </div>

      {/* 金利 */}
      <div>
        <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
          金利（年利）
        </label>
        <div className="relative flex items-center gap-2">
          <input
            id="interestRate"
            type="text"
            inputMode="decimal"
            value={formatInterestRate(values.interestRate)}
            onChange={handleInterestRateChange}
            className={`${inputClass(!!errors.interestRate)} flex-1`}
            placeholder="1.50"
          />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            %
          </span>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleIncrement('interestRate', 0.01)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
              aria-label="0.01%増やす"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => handleDecrement('interestRate', 0.01)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
              aria-label="0.01%減らす"
            >
              ▼
            </button>
          </div>
        </div>
        {errors.interestRate && (
          <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>
        )}
      </div>

      {/* 返済方式 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          返済方式
        </label>
        <div className="space-y-2">
          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="repaymentType"
              value="equal-payment"
              checked={values.repaymentType === 'equal-payment'}
              onChange={(e) => handleChange('repaymentType', e.target.value)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="ml-3">
              <span className="font-medium">元利均等返済</span>
              <span className="text-sm text-gray-500 ml-2">
                （月々の返済額が一定）
              </span>
            </span>
          </label>
          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="repaymentType"
              value="equal-principal"
              checked={values.repaymentType === 'equal-principal'}
              onChange={(e) => handleChange('repaymentType', e.target.value)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="ml-3">
              <span className="font-medium">元金均等返済</span>
              <span className="text-sm text-gray-500 ml-2">
                （元金返済額が一定）
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* ボーナス払い設定 */}
      <div className="border-t pt-6">
        <ReverseBonusSettings
          enabled={values.bonusPayment?.enabled || false}
          settings={values.bonusPayment}
          onToggle={(enabled) => {
            onChange({
              ...values,
              bonusPayment: {
                ...values.bonusPayment!,
                enabled,
              },
            });
          }}
          onChange={(bonusPayment) => {
            onChange({
              ...values,
              bonusPayment,
            });
          }}
        />
      </div>

      {/* 計算ボタン */}
      <button
        type="submit"
        className="w-full bg-secondary text-white font-bold py-3 px-6 rounded-lg
                   hover:bg-green-600 active:bg-green-700
                   focus:outline-none focus:ring-4 focus:ring-secondary/50
                   transition-colors duration-150
                   disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        計算する
      </button>
    </form>
  );
};

export default ReverseLoanForm;
