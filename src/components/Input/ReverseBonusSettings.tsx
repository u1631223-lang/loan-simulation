/**
 * ReverseBonusSettings コンポーネント
 * 逆算用のボーナス払い設定（返済額から計算）
 */

import type { ReverseBonusPayment } from '@/types';

interface ReverseBonusSettingsProps {
  enabled: boolean;
  settings?: ReverseBonusPayment;
  onToggle: (enabled: boolean) => void;
  onChange: (settings: ReverseBonusPayment) => void;
  errors?: Record<string, string>;
}

const ReverseBonusSettings: React.FC<ReverseBonusSettingsProps> = ({
  enabled,
  settings = {
    enabled: false,
    payment: 0,
    months: [1, 8], // デフォルトは1月（冬）と8月（夏）
  },
  onToggle,
  onChange,
  errors = {},
}) => {
  const handleChange = (field: keyof ReverseBonusPayment, value: number | number[]) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  // ボーナス返済額をカンマ区切りでフォーマット
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

  // 数値の増減ハンドラ
  const handleIncrement = (step: number) => {
    const currentValue = settings.payment || 0;
    const newValue = currentValue + step;
    handleChange('payment', Math.max(0, newValue));
  };

  const handleDecrement = (step: number) => {
    const currentValue = settings.payment || 0;
    const newValue = currentValue - step;
    handleChange('payment', Math.max(0, newValue));
  };

  const inputClass = (hasError: boolean) => `
    w-full px-4 py-2 rounded-lg border-2
    ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
    focus:outline-none focus:ring-2 focus:ring-primary/50
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-150
  `;

  return (
    <div className="space-y-4">
      {/* ボーナス払い有効/無効切り替え */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-800">ボーナス払い</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* ボーナス設定（有効時のみ表示） */}
      {enabled && (
        <div>
          <label
            htmlFor="bonusPayment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ボーナス月の返済額（円）
          </label>
          <div className="relative flex items-center gap-2">
            <input
              id="bonusPayment"
              type="text"
              inputMode="numeric"
              value={formatPayment(settings.payment)}
              onChange={(e) => {
                const input = e.target.value;
                if (input === '' || /^[\d,]*$/.test(input)) {
                  handleChange('payment', parsePayment(input));
                }
              }}
              className={`${inputClass(!!errors.payment)} flex-1`}
              placeholder="50,000"
            />
            <span className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              円
            </span>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleIncrement(10000)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
                aria-label="1万円増やす"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => handleDecrement(10000)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
                aria-label="1万円減らす"
              >
                ▼
              </button>
            </div>
          </div>
          {errors.payment && (
            <p className="text-red-500 text-sm mt-1">{errors.payment}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReverseBonusSettings;
