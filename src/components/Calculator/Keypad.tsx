/**
 * Keypad コンポーネント
 * 電卓風のキーパッド
 */

interface KeypadProps {
  onInput: (value: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  disabled?: boolean;
}

const Keypad: React.FC<KeypadProps> = ({
  onInput,
  onClear,
  onBackspace,
  onCalculate,
  disabled = false,
}) => {
  const handleNumberClick = (num: string) => {
    if (!disabled) {
      onInput(num);
    }
  };

  const buttonBaseClass = `
    min-h-[44px] px-4 py-3 rounded-lg font-semibold text-lg
    transition-all duration-150
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const numberButtonClass = `
    ${buttonBaseClass}
    bg-white border-2 border-gray-300
    hover:bg-gray-50 hover:border-gray-400
    active:bg-gray-100
  `;

  const operationButtonClass = `
    ${buttonBaseClass}
    bg-gray-100 border-2 border-gray-300
    hover:bg-gray-200 hover:border-gray-400
    active:bg-gray-300
  `;

  const clearButtonClass = `
    ${buttonBaseClass}
    bg-red-500 text-white border-2 border-red-600
    hover:bg-red-600
    active:bg-red-700
  `;

  const calculateButtonClass = `
    ${buttonBaseClass}
    bg-secondary text-white border-2 border-green-600
    hover:bg-green-600
    active:bg-green-700
    col-span-2
  `;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-3 gap-2">
        {/* 数字ボタン 7-9 */}
        {['7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            disabled={disabled}
            className={numberButtonClass}
            aria-label={`数字 ${num}`}
          >
            {num}
          </button>
        ))}

        {/* 数字ボタン 4-6 */}
        {['4', '5', '6'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            disabled={disabled}
            className={numberButtonClass}
            aria-label={`数字 ${num}`}
          >
            {num}
          </button>
        ))}

        {/* 数字ボタン 1-3 */}
        {['1', '2', '3'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            disabled={disabled}
            className={numberButtonClass}
            aria-label={`数字 ${num}`}
          >
            {num}
          </button>
        ))}

        {/* 小数点 */}
        <button
          onClick={() => handleNumberClick('.')}
          disabled={disabled}
          className={operationButtonClass}
          aria-label="小数点"
        >
          .
        </button>

        {/* 数字ボタン 0 */}
        <button
          onClick={() => handleNumberClick('0')}
          disabled={disabled}
          className={numberButtonClass}
          aria-label="数字 0"
        >
          0
        </button>

        {/* バックスペース */}
        <button
          onClick={onBackspace}
          disabled={disabled}
          className={operationButtonClass}
          aria-label="バックスペース"
        >
          ←
        </button>

        {/* クリアボタン */}
        <button
          onClick={onClear}
          disabled={disabled}
          className={clearButtonClass}
          aria-label="クリア"
        >
          C
        </button>

        {/* 計算ボタン */}
        <button
          onClick={onCalculate}
          disabled={disabled}
          className={calculateButtonClass}
          aria-label="計算実行"
        >
          計算実行
        </button>
      </div>
    </div>
  );
};

export default Keypad;
