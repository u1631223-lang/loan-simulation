/**
 * BonusSettings コンポーネント
 * ボーナス払い設定
 */

import type { BonusPayment } from '@/types';

interface BonusSettingsProps {
  enabled: boolean;
  settings?: BonusPayment;
  onToggle: (enabled: boolean) => void;
  onChange: (settings: BonusPayment) => void;
  errors?: Record<string, string>;
}

const BonusSettings: React.FC<BonusSettingsProps> = ({
  enabled,
  settings = {
    enabled: false,
    amount: 0,
    months: [6, 12],
  },
  onToggle,
  onChange,
  errors = {},
}) => {
  const handleChange = (field: keyof BonusPayment, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const handleMonthToggle = (month: number) => {
    const currentMonths = settings.months || [];
    const newMonths = currentMonths.includes(month)
      ? currentMonths.filter((m: number) => m !== month)
      : [...currentMonths, month].sort((a: number, b: number) => a - b);

    handleChange('months', newMonths);
  };

  const inputClass = (hasError: boolean) => `
    w-full px-4 py-2 rounded-lg border-2
    ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
    focus:outline-none focus:ring-2 focus:ring-primary/50
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-150
  `;

  const monthButtonClass = (isSelected: boolean) => `
    px-3 py-2 rounded-lg border-2 text-sm font-medium
    transition-all duration-150
    ${
      isSelected
        ? 'bg-primary text-white border-primary'
        : 'bg-white text-gray-700 border-gray-300 hover:border-primary/50'
    }
    ${enabled ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
  `;

  return (
    <div className="space-y-4">
      {/* ボーナス払い有効/無効切り替え */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-800">ボーナス払い</p>
          <p className="text-sm text-gray-500 mt-1">
            年2回のボーナス月に追加返済を行います
          </p>
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
        <>
          {/* ボーナス加算額 */}
          <div>
            <label
              htmlFor="bonusAmount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ボーナス加算額（1回あたり）
            </label>
            <div className="relative">
              <input
                id="bonusAmount"
                type="number"
                value={settings.amount || ''}
                onChange={(e) =>
                  handleChange('amount', parseFloat(e.target.value) || 0)
                }
                className={inputClass(!!errors.amount)}
                placeholder="500000"
                min="0"
                max="10000000"
                step="10000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                円
              </span>
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* ボーナス月選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ボーナス支払月
            </label>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const isSelected = settings.months?.includes(month);
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthToggle(month)}
                    disabled={!enabled}
                    className={monthButtonClass(isSelected)}
                    aria-pressed={isSelected}
                  >
                    {month}月
                  </button>
                );
              })}
            </div>
            {errors.months && (
              <p className="text-red-500 text-sm mt-1">{errors.months}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              ボーナス月を選択してください（複数選択可）
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BonusSettings;
