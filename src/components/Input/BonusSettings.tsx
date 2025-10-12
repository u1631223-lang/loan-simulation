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
    months: [1, 8], // デフォルトは1月（冬）と8月（夏）
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
          <p className="text-sm text-gray-500 mt-1">
            年2回（1月・8月）のボーナス月に追加返済を行います
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
        <div>
          <label
            htmlFor="bonusAmount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ボーナス加算額（1回あたり・万円）
          </label>
          <div className="relative">
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
              className={inputClass(!!errors.amount)}
              placeholder="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              万円
            </span>
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            0万円 〜 1,000万円
          </p>
        </div>
      )}
    </div>
  );
};

export default BonusSettings;
