/**
 * SimpleCalculator コンポーネント
 * メモリー機能付き電卓（不動産業務用）
 */

import React, { useState, useEffect, useCallback } from 'react';

interface CalculationHistory {
  expression: string;
  result: number;
}

const SimpleCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // キーボード入力対応
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key;

    // 数字キー
    if (/^[0-9.]$/.test(key)) {
      handleNumberClick(key);
    }
    // 演算子
    else if (['+', '-', '*', '/'].includes(key)) {
      const op = key === '*' ? '×' : key === '/' ? '÷' : key;
      handleOperatorClick(op);
    }
    // Enter または = で計算実行
    else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      handleEquals();
    }
    // Backspace で1文字削除
    else if (key === 'Backspace') {
      handleBackspace();
    }
    // Escape でクリア
    else if (key === 'Escape') {
      handleClear();
    }
  }, [display, expression, waitingForOperand]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // 数字ボタンクリック（00ボタン対応）
  const handleNumberClick = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num === '00' ? '0' : num);
      setWaitingForOperand(false);
    } else {
      // 0だけの状態で00を押した場合は0のまま、それ以外は追加
      if (display === '0' && num === '00') {
        setDisplay('0');
      } else {
        setDisplay(display === '0' ? num : display + num);
      }
    }
  };

  // 演算子ボタンクリック
  const handleOperatorClick = (operator: string) => {
    const currentValue = parseFloat(display);

    if (expression === '') {
      setExpression(`${currentValue} ${operator} `);
    } else {
      // 既に式がある場合は計算を実行してから次の演算子を追加
      const result = calculateExpression(expression + display);
      setDisplay(String(result));
      setExpression(`${result} ${operator} `);
    }
    setWaitingForOperand(true);
  };

  // 式を計算
  const calculateExpression = (expr: string): number => {
    try {
      // 式を JavaScript で評価できる形式に変換
      const jsExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\s/g, '');

      // eval の代わりに Function を使用（より安全）
      const result = new Function(`return ${jsExpr}`)();
      return Math.round(result * 100000000) / 100000000; // 浮動小数点誤差対策
    } catch (error) {
      return 0;
    }
  };

  // = ボタン（計算実行）
  const handleEquals = () => {
    if (expression === '') return;

    const fullExpression = expression + display;
    const result = calculateExpression(fullExpression);

    // 履歴に追加
    setHistory(prev => [...prev, {
      expression: fullExpression,
      result,
    }]);

    setDisplay(String(result));
    setExpression('');
    setWaitingForOperand(true);
  };

  // Cボタン（現在の入力をクリア）
  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setWaitingForOperand(false);
  };

  // ACボタン（すべてクリア：履歴も含む）
  const handleAllClear = () => {
    setDisplay('0');
    setExpression('');
    setWaitingForOperand(false);
    setHistory([]);
    setMemory(0);
  };

  // Backspace（1文字削除）
  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // メモリー機能
  const handleMemoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };

  const handleMemoryAdd = () => {
    setMemory(memory + parseFloat(display));
  };

  const handleMemorySubtract = () => {
    setMemory(memory - parseFloat(display));
  };

  const handleMemoryClear = () => {
    setMemory(0);
  };

  // 履歴の値をクリックして再利用
  const handleHistoryClick = (value: number) => {
    setDisplay(String(value));
    setWaitingForOperand(true);
  };

  // ボタンのスタイル（金融機関風 - 高級感・信頼性）
  const buttonClass = (variant: 'number' | 'operator' | 'equals' | 'memory' | 'clear' = 'number') => {
    const base = 'min-h-[68px] rounded-lg font-bold text-xl transition-all active:scale-95 touch-manipulation shadow-md';

    const variants = {
      // 数字ボタン: 高級感のあるホワイト（立体感）
      number: 'bg-white hover:bg-gray-50 text-gray-900 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)]',
      // 演算子: 深いネイビーブルー（金融機関カラー）
      operator: 'bg-[#1E3A5F] hover:bg-[#2C5282] text-white',
      // イコール: ゴールドアクセント（高級感）
      equals: 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-[0_4px_12px_rgba(217,119,6,0.3)]',
      // メモリー: エレガントなダークグレー
      memory: 'bg-gray-700 hover:bg-gray-800 text-white text-base',
      // クリア: 控えめなグレー（マットな質感）
      clear: 'bg-gray-600 hover:bg-gray-700 text-white',
    };

    return `${base} ${variants[variant]}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* 電卓本体 */}
      <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
        {/* ディスプレイ（金融機関風 - ダークネイビー） */}
        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-lg p-6 mb-5 border-2 border-[#3A5F7F] shadow-inner">
          {/* 計算式表示 */}
          <div className="text-blue-200 text-base h-7 overflow-hidden text-right mb-3 font-medium">
            {expression || '\u00A0'}
          </div>
          {/* 計算結果表示（大きく見やすく） */}
          <div className="text-white text-5xl sm:text-6xl font-bold text-right break-all leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            {isNaN(Number(display)) ? display : Number(display).toLocaleString('ja-JP')}
          </div>
          {/* メモリー表示（ゴールドアクセント） */}
          {memory !== 0 && (
            <div className="text-amber-300 text-sm text-right mt-3 font-semibold">
              💾 メモリー: {memory.toLocaleString('ja-JP')}
            </div>
          )}
        </div>

        {/* ボタンレイアウト */}
        <div className="grid grid-cols-4 gap-3">
          {/* メモリー機能行 */}
          <button onClick={handleMemoryClear} className={buttonClass('memory')}>MC</button>
          <button onClick={handleMemoryRecall} className={buttonClass('memory')}>MR</button>
          <button onClick={handleMemoryAdd} className={buttonClass('memory')}>M+</button>
          <button onClick={handleMemorySubtract} className={buttonClass('memory')}>M-</button>

          {/* クリア・操作行 */}
          <button onClick={handleAllClear} className={buttonClass('clear')}>AC</button>
          <button onClick={handleClear} className={buttonClass('clear')}>C</button>
          <button onClick={handleBackspace} className={buttonClass('operator')}>⌫</button>
          <button onClick={() => handleOperatorClick('÷')} className={buttonClass('operator')}>÷</button>

          {/* 数字・演算子 */}
          <button onClick={() => handleNumberClick('7')} className={buttonClass('number')}>7</button>
          <button onClick={() => handleNumberClick('8')} className={buttonClass('number')}>8</button>
          <button onClick={() => handleNumberClick('9')} className={buttonClass('number')}>9</button>
          <button onClick={() => handleOperatorClick('×')} className={buttonClass('operator')}>×</button>

          <button onClick={() => handleNumberClick('4')} className={buttonClass('number')}>4</button>
          <button onClick={() => handleNumberClick('5')} className={buttonClass('number')}>5</button>
          <button onClick={() => handleNumberClick('6')} className={buttonClass('number')}>6</button>
          <button onClick={() => handleOperatorClick('-')} className={buttonClass('operator')}>-</button>

          <button onClick={() => handleNumberClick('1')} className={buttonClass('number')}>1</button>
          <button onClick={() => handleNumberClick('2')} className={buttonClass('number')}>2</button>
          <button onClick={() => handleNumberClick('3')} className={buttonClass('number')}>3</button>
          <button onClick={() => handleOperatorClick('+')} className={buttonClass('operator')}>+</button>

          <button onClick={() => handleNumberClick('0')} className={buttonClass('number')}>0</button>
          <button onClick={() => handleNumberClick('00')} className={buttonClass('number')}>00</button>
          <button onClick={() => handleNumberClick('.')} className={buttonClass('number')}>.</button>
          <button onClick={handleEquals} className={buttonClass('equals')}>=</button>
        </div>

        {/* キーボード操作ヒント */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-900 border border-blue-200">
          <p className="font-semibold mb-1">⌨️ キーボード操作</p>
          <p className="text-xs">Enter: 計算 | Esc: クリア | Backspace: 削除</p>
        </div>
      </div>

      {/* 計算履歴（金融機関風） */}
      <div className="lg:w-80 bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
          <h3 className="text-lg font-bold text-[#1E3A5F]">📋 履歴</h3>
          {history.length > 0 && (
            <button
              onClick={handleAllClear}
              className="text-sm text-gray-600 hover:text-gray-800 font-semibold px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
            >
              全消去
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-12">
              計算履歴はありません
            </p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-amber-50 hover:to-amber-100 rounded-lg p-4 cursor-pointer transition-all border-2 border-blue-200 hover:border-amber-400 hover:shadow-md"
                onClick={() => handleHistoryClick(item.result)}
              >
                <div className="text-sm text-blue-800 mb-2 font-medium">
                  {item.expression}
                </div>
                <div className="text-2xl font-bold text-[#1E3A5F] text-right">
                  = {item.result.toLocaleString('ja-JP')}
                </div>
              </div>
            ))
          ).reverse()}
        </div>

        {history.length > 0 && (
          <p className="text-xs text-gray-500 mt-4 text-center font-medium">
            💡 タップして値を再利用
          </p>
        )}
      </div>
    </div>
  );
};

export default SimpleCalculator;
