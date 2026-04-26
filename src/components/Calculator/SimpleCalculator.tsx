/**
 * SimpleCalculator コンポーネント
 * メモリー機能付き電卓（不動産業務用）
 */

import React, { useState, useEffect, useRef } from 'react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 最新のハンドラを ref 経由で参照する（useCallback の依存地獄を避ける）
  const handlersRef = useRef({
    handleNumberClick: (_n: string) => {},
    handleOperatorClick: (_o: string) => {},
    handleEquals: () => {},
    handleBackspace: () => {},
    handleClear: () => {},
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      const h = handlersRef.current;
      if (/^[0-9.]$/.test(key)) {
        h.handleNumberClick(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        const op = key === '*' ? '×' : key === '/' ? '÷' : key;
        h.handleOperatorClick(op);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        h.handleEquals();
      } else if (key === 'Backspace') {
        h.handleBackspace();
      } else if (key === 'Escape') {
        h.handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  // %ボタン（現在の値を100で割る）
  const handlePercent = () => {
    const currentValue = parseFloat(display);
    const result = currentValue / 100;
    setDisplay(String(result));
  };

  // ±ボタン（符号反転）
  const handlePlusMinus = () => {
    const currentValue = parseFloat(display);
    setDisplay(String(-currentValue));
  };

  // 坪ボタン（平米 → 坪 変換: ×0.3025）
  const handleTsubo = () => {
    const currentValue = parseFloat(display);
    const tsubo = currentValue * 0.3025;
    setDisplay(String(tsubo));
  };

  // 税込ボタン（×1.1で10%税込計算）
  const handleTaxIncluded = () => {
    const currentValue = parseFloat(display);
    const taxIncluded = currentValue * 1.1;
    setDisplay(String(Math.round(taxIncluded))); // 整数に丸める
  };

  // 式を計算（数字・小数点・四則演算子・括弧のみ許可してコード注入を防ぐ）
  const calculateExpression = (expr: string): number => {
    try {
      const jsExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\s/g, '');

      // ホワイトリスト: 数値・演算子・括弧以外が混入していたら即拒否
      if (!/^[0-9.+\-*/()]*$/.test(jsExpr)) {
        return 0;
      }

      const result = new Function(`"use strict"; return (${jsExpr})`)();
      if (typeof result !== 'number' || !Number.isFinite(result)) {
        return 0;
      }
      return Math.round(result * 100000000) / 100000000;
    } catch {
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

  // ACボタン（現在の計算をクリア、履歴は残す）
  const handleAllClear = () => {
    setDisplay('0');
    setExpression('');
    setWaitingForOperand(false);
    // 履歴とメモリーは残す
  };

  // 履歴削除ボタン
  const handleClearHistory = () => {
    setHistory([]);
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

  // キーボードハンドラから最新の関数を呼べるよう、毎レンダごとに ref を更新
  handlersRef.current = {
    handleNumberClick,
    handleOperatorClick,
    handleEquals,
    handleBackspace,
    handleClear,
  };

  // ボタンのスタイル（金融機関風 - 高級感・信頼性）
  const buttonClass = (variant: 'number' | 'operator' | 'equals' | 'memory' | 'clear' = 'number') => {
    // スマホ: 52px、タブレット以上: 68px
    const base = 'min-h-[52px] md:min-h-[68px] rounded-lg font-bold text-lg md:text-xl transition-all active:scale-95 touch-manipulation shadow-md';

    const variants = {
      // 数字ボタン: 高級感のあるホワイト（立体感）
      number: 'bg-white hover:bg-gray-50 text-gray-900 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)]',
      // 演算子: 深いネイビーブルー（金融機関カラー）
      operator: 'bg-[#1E3A5F] hover:bg-[#2C5282] text-white',
      // イコール: ゴールドアクセント（高級感）
      equals: 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-[0_4px_12px_rgba(217,119,6,0.3)]',
      // メモリー: エレガントなダークグレー
      memory: 'bg-gray-700 hover:bg-gray-800 text-white text-sm md:text-base',
      // クリア: 控えめなグレー（マットな質感）
      clear: 'bg-gray-600 hover:bg-gray-700 text-white',
    };

    return `${base} ${variants[variant]}`;
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900/95 p-4 overflow-auto' : ''}`}>
      <div className={`flex flex-col lg:flex-row gap-4 ${isFullscreen ? 'max-w-7xl mx-auto' : ''}`}>
        {/* 電卓本体 */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 md:p-6">
          {/* フルスクリーンボタン */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-xs md:text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors border border-gray-300"
            >
              {isFullscreen ? '✕ 閉じる' : '⛶ 全画面表示'}
            </button>
          </div>
        {/* ディスプレイ（金融機関風 - ダークネイビー） */}
        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-lg p-4 md:p-6 mb-3 md:mb-5 border-2 border-[#3A5F7F] shadow-inner">
          {/* 計算式表示 */}
          <div className="text-blue-200 text-sm md:text-base h-5 md:h-7 overflow-hidden text-right mb-2 md:mb-3 font-medium">
            {expression || '\u00A0'}
          </div>
          {/* 計算結果表示（大きく見やすく） */}
          <div className="text-white text-3xl sm:text-4xl md:text-5xl font-bold text-right break-all leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            {isNaN(Number(display)) ? display : Number(display).toLocaleString('ja-JP')}
          </div>
          {/* メモリー表示（ゴールドアクセント） */}
          {memory !== 0 && (
            <div className="text-amber-300 text-xs md:text-sm text-right mt-2 md:mt-3 font-semibold">
              💾 メモリー: {memory.toLocaleString('ja-JP')}
            </div>
          )}
        </div>

        {/* ボタンレイアウト - Casio BF-850-N風 5列グリッド */}
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {/* 1行目: メモリー機能 */}
          <button onClick={handleMemoryClear} className={buttonClass('memory')}>MC</button>
          <button onClick={handleMemoryRecall} className={buttonClass('memory')}>MR</button>
          <button onClick={handleMemoryAdd} className={buttonClass('memory')}>M+</button>
          <button onClick={handleMemorySubtract} className={buttonClass('memory')}>M-</button>
          <button onClick={handleTsubo} className={buttonClass('operator')}>坪</button>

          {/* 2行目: ±, %, %, 税込, ÷ */}
          <button onClick={handlePlusMinus} className={buttonClass('operator')}>±</button>
          <button onClick={handlePercent} className={buttonClass('operator')}>%</button>
          <button onClick={handlePercent} className={buttonClass('operator')}>%</button>
          <button onClick={handleTaxIncluded} className={buttonClass('memory')}>税込</button>
          <button onClick={() => handleOperatorClick('÷')} className={buttonClass('operator')}>÷</button>

          {/* 3行目: ⌫, 7, 8, 9, × */}
          <button onClick={handleBackspace} className={buttonClass('operator')}>⌫</button>
          <button onClick={() => handleNumberClick('7')} className={buttonClass('number')}>7</button>
          <button onClick={() => handleNumberClick('8')} className={buttonClass('number')}>8</button>
          <button onClick={() => handleNumberClick('9')} className={buttonClass('number')}>9</button>
          <button onClick={() => handleOperatorClick('×')} className={buttonClass('operator')}>×</button>

          {/* 4行目: C, 4, 5, 6, - */}
          <button onClick={handleClear} className={buttonClass('clear')}>C</button>
          <button onClick={() => handleNumberClick('4')} className={buttonClass('number')}>4</button>
          <button onClick={() => handleNumberClick('5')} className={buttonClass('number')}>5</button>
          <button onClick={() => handleNumberClick('6')} className={buttonClass('number')}>6</button>
          <button onClick={() => handleOperatorClick('-')} className={buttonClass('operator')}>-</button>

          {/* 5行目: AC, 1, 2, 3, + (縦長の上半分) */}
          <button onClick={handleAllClear} className={buttonClass('clear')}>AC</button>
          <button onClick={() => handleNumberClick('1')} className={buttonClass('number')}>1</button>
          <button onClick={() => handleNumberClick('2')} className={buttonClass('number')}>2</button>
          <button onClick={() => handleNumberClick('3')} className={buttonClass('number')}>3</button>
          <button onClick={() => handleOperatorClick('+')} className={`${buttonClass('operator')} row-span-2`}>+</button>

          {/* 6行目: 0, 00, ., = */}
          <button onClick={() => handleNumberClick('0')} className={buttonClass('number')}>0</button>
          <button onClick={() => handleNumberClick('00')} className={buttonClass('number')}>00</button>
          <button onClick={() => handleNumberClick('.')} className={buttonClass('number')}>.</button>
          <button onClick={handleEquals} className={buttonClass('equals')}>=</button>
          {/* +の下半分は row-span-2 で自動的に占有 */}
        </div>

        {/* キーボード操作ヒント */}
        <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 rounded-lg text-xs md:text-sm text-blue-900 border border-blue-200">
          <p className="font-semibold mb-1">⌨️ キーボード操作</p>
          <p className="text-xs">Enter: 計算 | Esc: クリア | Backspace: 削除</p>
        </div>
      </div>

      {/* 計算履歴（金融機関風） */}
      <div className="lg:w-80 bg-white rounded-lg shadow-lg p-4 md:p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-3 md:mb-4 pb-2 md:pb-3 border-b-2 border-gray-200">
          <h3 className="text-base md:text-lg font-bold text-[#1E3A5F]">📋 履歴</h3>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs md:text-sm text-red-600 hover:text-red-800 font-semibold px-2 md:px-3 py-1 md:py-1.5 rounded-md hover:bg-red-50 transition-colors border border-red-300"
            >
              履歴削除
            </button>
          )}
        </div>

        <div className="space-y-2 md:space-y-3 max-h-64 md:max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-8 md:py-12 text-sm md:text-base">
              計算履歴はありません
            </p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-amber-50 hover:to-amber-100 rounded-lg p-3 md:p-4 cursor-pointer transition-all border-2 border-blue-200 hover:border-amber-400 hover:shadow-md"
                onClick={() => handleHistoryClick(item.result)}
              >
                <div className="text-xs md:text-sm text-blue-800 mb-1 md:mb-2 font-medium">
                  {item.expression}
                </div>
                <div className="text-xl md:text-2xl font-bold text-[#1E3A5F] text-right">
                  = {item.result.toLocaleString('ja-JP')}
                </div>
              </div>
            ))
          ).reverse()}
        </div>

        {history.length > 0 && (
          <p className="text-xs text-gray-500 mt-3 md:mt-4 text-center font-medium">
            💡 タップして値を再利用
          </p>
        )}
      </div>
      </div>
    </div>
  );
};

export default SimpleCalculator;
