/**
 * Display コンポーネント
 * 電卓の表示画面
 */

interface DisplayProps {
  value: string;
  label?: string;
  unit?: string;
  error?: string;
  className?: string;
}

const Display: React.FC<DisplayProps> = ({
  value,
  label,
  unit = '',
  error,
  className = '',
}) => {
  // カンマ区切りフォーマット
  const formatNumber = (val: string): string => {
    if (!val || val === '') return '0';

    // 既存のカンマを削除
    const cleaned = val.replace(/,/g, '');

    // 数値に変換できるかチェック
    const num = parseFloat(cleaned);
    if (isNaN(num)) return val;

    // 小数点がある場合
    if (cleaned.includes('.')) {
      const [integer, decimal] = cleaned.split('.');
      const formattedInteger = parseInt(integer).toLocaleString('ja-JP');
      return `${formattedInteger}.${decimal}`;
    }

    // 整数の場合
    return num.toLocaleString('ja-JP');
  };

  const formattedValue = formatNumber(value);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          {label}
        </label>
      )}
      <div
        className={`
          px-4 py-3 rounded-lg border-2
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}
          transition-colors duration-150
        `}
      >
        <div className="text-right font-mono text-2xl sm:text-3xl md:text-4xl font-bold overflow-hidden text-ellipsis">
          <span className={error ? 'text-red-700' : 'text-gray-800'}>
            {formattedValue}
          </span>
          {unit && (
            <span className="text-lg sm:text-xl ml-2 text-gray-600">
              {unit}
            </span>
          )}
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Display;
