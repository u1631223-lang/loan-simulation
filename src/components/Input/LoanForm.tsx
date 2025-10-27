/**
 * LoanForm コンポーネント
 * ローンパラメータ入力フォーム
 */

import type { LoanParams } from '@/types';
import BonusSettings from './BonusSettings';
import { useAuth } from '@/hooks/useAuth';

interface LoanFormProps {
  values: LoanParams;
  onChange: (values: LoanParams) => void;
  onSubmit: () => void;
  errors?: Record<string, string>;
}

const LoanForm: React.FC<LoanFormProps> = ({
  values,
  onChange,
  onSubmit,
  errors = {},
}) => {
  const { tier } = useAuth();

  // Tier 2以上でのみ表示
  const showCustomerName = tier === 'registered' || tier === 'premium';
  const handleChange = (field: keyof LoanParams, value: string | number) => {
    onChange({
      ...values,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // 万円単位の数値をカンマ区切りでフォーマット（整数のみ）
  const formatManyen = (yen: number | string): string => {
    if (!yen) return '';
    const yenNum = typeof yen === 'string' ? parseFloat(yen.replace(/,/g, '')) : yen;
    if (isNaN(yenNum)) return '';
    const manyen = Math.round(yenNum / 10000); // 整数に丸める
    return manyen.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // カンマ区切り文字列から円単位の数値を抽出（整数のみ）
  const parseManyenToYen = (str: string): number => {
    const cleaned = str.replace(/,/g, '');
    const manyen = parseInt(cleaned);
    if (isNaN(manyen)) return 0;
    return manyen * 10000; // 万円→円に変換
  };

  // 借入金額の変更ハンドラ（万円単位、整数のみ）
  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // 数字とカンマのみ許可（小数点不可）
    if (input === '' || /^[\d,]*$/.test(input)) {
      const yenValue = parseManyenToYen(input);
      handleChange('principal', yenValue);
    }
  };

  // 金利の変更ハンドラ
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // 数字と小数点のみ許可
    if (input === '' || /^\d*\.?\d*$/.test(input)) {
      handleChange('interestRate', parseFloat(input) || 0);
    }
  };

  // 金利を2桁の小数点でフォーマット（フォーカス外れた時のみ）
  const formatInterestRate = (rate: number | string): string => {
    if (!rate && rate !== 0) return '';
    const num = typeof rate === 'string' ? parseFloat(rate) : rate;
    if (isNaN(num)) return '';
    return num.toFixed(2);
  };

  // 数値の増減ハンドラ
  const handleIncrement = (field: keyof LoanParams, step: number) => {
    const currentValue = values[field] as number;
    const newValue = currentValue + step;
    handleChange(field, Math.max(0, newValue));
  };

  const handleDecrement = (field: keyof LoanParams, step: number) => {
    const currentValue = values[field] as number;
    const newValue = currentValue - step;
    handleChange(field, Math.max(0, newValue));
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
      {/* お客様名フィールド（Tier 2以上でのみ表示） */}
      {showCustomerName && (
        <div>
          <label htmlFor="customerName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <span className="text-lg">👤</span>
            <span>お客様名（任意）</span>
          </label>
          <input
            id="customerName"
            type="text"
            value={values.customerName || ''}
            onChange={(e) => handleChange('customerName', e.target.value)}
            placeholder="例）山田 太郎"
            className={inputClass(false)}
            maxLength={50}
          />
        </div>
      )}

      {/* 借入金額 */}
      <div>
        <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-1">
          借入金額（万円）
        </label>
        <div className="relative flex items-center gap-2">
          <input
            id="principal"
            type="text"
            inputMode="decimal"
            value={formatManyen(values.principal)}
            onChange={handlePrincipalChange}
            className={`${inputClass(!!errors.principal)} flex-1`}
            placeholder="5000"
          />
          <span className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            万円
          </span>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleIncrement('principal', 10 * 10000)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
              aria-label="10万円増やす"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => handleDecrement('principal', 10 * 10000)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
              aria-label="10万円減らす"
            >
              ▼
            </button>
          </div>
        </div>
        {errors.principal && (
          <p className="text-red-500 text-sm mt-1">{errors.principal}</p>
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
        <BonusSettings
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
          principal={values.principal}
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

export default LoanForm;
