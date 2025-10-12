/**
 * LoanForm コンポーネント
 * ローンパラメータ入力フォーム
 */

import type { LoanParams } from '@/types';

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
  const handleChange = (field: keyof LoanParams, value: any) => {
    onChange({
      ...values,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // 数値をカンマ区切りでフォーマット
  const formatNumber = (num: number | string): string => {
    if (!num) return '';
    const numStr = num.toString().replace(/,/g, '');
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // カンマ区切り文字列から数値を抽出
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 借入金額の変更ハンドラ
  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // 数字とカンマのみ許可
    if (input === '' || /^[\d,]*$/.test(input)) {
      const numValue = parseNumber(input);
      handleChange('principal', numValue);
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

  const inputClass = (hasError: boolean) => `
    w-full px-4 py-2 rounded-lg border-2
    ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
    focus:outline-none focus:ring-2 focus:ring-primary/50
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-150
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 借入金額 */}
      <div>
        <label htmlFor="principal" className="block text-sm font-medium text-gray-700 mb-1">
          借入金額
        </label>
        <div className="relative">
          <input
            id="principal"
            type="text"
            inputMode="numeric"
            value={formatNumber(values.principal)}
            onChange={handlePrincipalChange}
            className={inputClass(!!errors.principal)}
            placeholder="30,000,000"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            円
          </span>
        </div>
        {errors.principal && (
          <p className="text-red-500 text-sm mt-1">{errors.principal}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          1円 〜 1,000,000,000円（10億円）
        </p>
      </div>

      {/* 返済期間 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          返済期間
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="relative">
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
                className={inputClass(!!errors.years)}
                placeholder="35"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                年
              </span>
            </div>
          </div>
          <div>
            <div className="relative">
              <input
                id="months"
                type="text"
                inputMode="numeric"
                value={values.months || 0}
                onChange={(e) => {
                  const input = e.target.value;
                  if (input === '' || /^\d+$/.test(input)) {
                    handleChange('months', parseInt(input) || 0);
                  }
                }}
                className={inputClass(!!errors.months)}
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                ヶ月
              </span>
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
        <div className="relative">
          <input
            id="interestRate"
            type="text"
            inputMode="decimal"
            value={values.interestRate || ''}
            onChange={handleInterestRateChange}
            className={inputClass(!!errors.interestRate)}
            placeholder="1.5"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            %
          </span>
        </div>
        {errors.interestRate && (
          <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          0% 〜 20%（小数点3桁まで）
        </p>
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
