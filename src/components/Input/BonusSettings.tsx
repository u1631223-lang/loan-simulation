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
  principal: number; // 借入額（上限計算に使用）
}

const BonusSettings: React.FC<BonusSettingsProps> = ({
  enabled,
  settings = {
    enabled: false,
    amount: 10000000, // デフォルト: 1000万円
    months: [1, 8], // デフォルトは1月（冬）と8月（夏）
  },
  onToggle,
  onChange,
  errors = {},
  principal,
}) => {
  // ボーナス払いの上限（借入額の50%）
  const maxBonusAmount = Math.floor(principal * 0.5);

  const handleChange = (field: keyof BonusPayment, value: any) => {
    // 上限チェック
    if (field === 'amount') {
      value = Math.min(value, maxBonusAmount);
    }
    onChange({
      ...settings,
      [field]: value,
    });
  };

  // ボーナス加算額を万円単位で表示
  const formatManyen = (yen: number | string): string => {
    if (!yen) return '';
    const yenNum = typeof yen === 'string' ? parseFloat(yen.replace(/,/g, '')) : yen;
    if (isNaN(yenNum)) return '';
    const manyen = yenNum / 10000;
    const [integer, decimal] = manyen.toString().split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
  };

  const parseManyenToYen = (str: string): number => {
    const cleaned = str.replace(/,/g, '');
    const manyen = parseFloat(cleaned);
    if (isNaN(manyen)) return 0;
    return manyen * 10000;
  };

  // 数値の増減ハンドラ
  const handleIncrement = (step: number) => {
    const currentValue = settings.amount || 0;
    const newValue = currentValue + step;
    handleChange('amount', Math.max(0, newValue));
  };

  const handleDecrement = (step: number) => {
    const currentValue = settings.amount || 0;
    const newValue = currentValue - step;
    handleChange('amount', Math.max(0, newValue));
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
            htmlFor="bonusAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ボーナス分の借入金額（万円）
          </label>
          <div className="relative flex items-center gap-2">
            <input
              id="bonusAmount"
              type="text"
              inputMode="decimal"
              value={formatManyen(settings.amount)}
              onChange={(e) => {
                const input = e.target.value;
                if (input === '' || /^[\d,]*\.?\d*$/.test(input)) {
                  handleChange('amount', parseManyenToYen(input));
                }
              }}
              className={`${inputClass(!!errors.amount)} flex-1`}
              placeholder="50"
            />
            <span className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              万円
            </span>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleIncrement(10 * 10000)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
                aria-label="10万円増やす"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => handleDecrement(10 * 10000)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-xs"
                aria-label="10万円減らす"
              >
                ▼
              </button>
            </div>
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BonusSettings;
