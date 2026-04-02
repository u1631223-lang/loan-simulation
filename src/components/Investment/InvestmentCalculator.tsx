import React, { useState } from 'react';
import type { InvestmentParams, InvestmentResult } from '@/types';
import {
  calculateCompoundInterest,
  formatInvestmentAmount,
} from '@/utils/investmentCalculator';
import InvestmentChart from './InvestmentChart';
import InvestmentComparison from './InvestmentComparison';

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

const createParams = (
  monthlyAmount: number,
  annualReturn: number,
  years: number,
  initialInvestment: number
): InvestmentParams => ({
  monthlyAmount: Math.round(monthlyAmount * 10_000),
  annualReturn,
  years: Math.round(years),
  initialInvestment: Math.round(initialInvestment * 10_000),
});

const InvestmentCalculator: React.FC = () => {
  const showComparisonMode = true;

  const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single');

  const [monthlyAmount, setMonthlyAmount] = useState(3);
  const [monthlyInputValue, setMonthlyInputValue] = useState('3.0'); // 入力フィールドの表示用
  const [annualReturn, setAnnualReturn] = useState(7.0); // S&P500の長期平均リターン（保守的見積もり）
  const [returnInputValue, setReturnInputValue] = useState('7.0'); // 利回り入力フィールドの表示用
  const [years, setYears] = useState(40); // 20歳から60歳まで想定
  const [yearsInputValue, setYearsInputValue] = useState('40'); // 期間入力フィールドの表示用
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [initialInputValue, setInitialInputValue] = useState('0'); // 初期投資額入力フィールドの表示用
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    // 月々積立と初期投資の両方が0の場合はエラー
    if (monthlyAmount === 0 && initialInvestment === 0) {
      setResult(null);
      setError('月々の積立額または初期投資額のいずれかを入力してください');
      return;
    }

    if (!Number.isFinite(annualReturn) || annualReturn < 0 || annualReturn > 20) {
      setResult(null);
      setError('想定利回りは0%〜20%の範囲で入力してください');
      return;
    }

    if (!Number.isFinite(years) || years < 1) {
      setResult(null);
      setError('積立期間は1年以上で入力してください');
      return;
    }

    setError(null);
    const params = createParams(
      monthlyAmount,
      annualReturn,
      years,
      initialInvestment
    );
    setResult(calculateCompoundInterest(params));
  };

  const handleMonthlyChange = (value: string) => {
    setMonthlyInputValue(value);

    // 空文字の場合は0にセット（一括投資のみのケース）
    if (value === '' || value === '.') {
      setMonthlyAmount(0);
      return;
    }

    const parsed = parseFloat(value);
    // 数値として有効な場合のみ更新
    if (!Number.isNaN(parsed)) {
      setMonthlyAmount(clamp(parsed, 0, 100));
    }
  };

  const handleMonthlyBlur = () => {
    // フォーカスが外れた時にフォーマット
    if (monthlyAmount === 0) {
      setMonthlyInputValue('0');
    } else {
      setMonthlyInputValue(monthlyAmount.toFixed(1));
    }
  };

  const handleReturnChange = (value: string) => {
    setReturnInputValue(value);

    // 空文字の場合は0にセット
    if (value === '' || value === '.') {
      setAnnualReturn(0);
      return;
    }

    const parsed = parseFloat(value);
    // 数値として有効な場合のみ更新
    if (!Number.isNaN(parsed)) {
      setAnnualReturn(clamp(parsed, 0, 20));
    }
  };

  const handleReturnBlur = () => {
    // フォーカスが外れた時にフォーマット
    setReturnInputValue(annualReturn.toFixed(1));
  };

  const handleYearsChange = (value: string) => {
    setYearsInputValue(value);

    // 空文字の場合は最小値にセット
    if (value === '') {
      setYears(1);
      return;
    }

    const parsed = parseInt(value, 10);
    // 数値として有効な場合のみ更新
    if (!Number.isNaN(parsed)) {
      setYears(clamp(parsed, 1, 50));
    }
  };

  const handleYearsBlur = () => {
    // フォーカスが外れた時にフォーマット
    setYearsInputValue(years.toString());
  };

  const handleInitialChange = (value: string) => {
    setInitialInputValue(value);

    // 空文字の場合は0にセット
    if (value === '' || value === '.') {
      setInitialInvestment(0);
      return;
    }

    const parsed = parseFloat(value);
    // 数値として有効な場合のみ更新
    if (!Number.isNaN(parsed)) {
      setInitialInvestment(clamp(parsed, 0, 10_000));
    }
  };

  const handleInitialBlur = () => {
    // フォーカスが外れた時にフォーマット
    setInitialInputValue(initialInvestment.toString());
  };

  const increment = (field: 'monthly' | 'return' | 'years' | 'initial') => {
    switch (field) {
      case 'monthly':
        setMonthlyAmount(prev => {
          const newVal = clamp(parseFloat((prev + 0.1).toFixed(1)), 0, 100);
          setMonthlyInputValue(newVal === 0 ? '0' : newVal.toFixed(1));
          return newVal;
        });
        break;
      case 'return':
        setAnnualReturn(prev => {
          const newVal = clamp(parseFloat((prev + 0.1).toFixed(1)), 0, 20);
          setReturnInputValue(newVal.toFixed(1));
          return newVal;
        });
        break;
      case 'years':
        setYears(prev => {
          const newVal = clamp(prev + 1, 1, 50);
          setYearsInputValue(newVal.toString());
          return newVal;
        });
        break;
      case 'initial':
        setInitialInvestment(prev => {
          const newVal = clamp(prev + 10, 0, 10_000);
          setInitialInputValue(newVal.toString());
          return newVal;
        });
        break;
      default:
        break;
    }
  };

  const decrement = (field: 'monthly' | 'return' | 'years' | 'initial') => {
    switch (field) {
      case 'monthly':
        setMonthlyAmount(prev => {
          const newVal = clamp(parseFloat((prev - 0.1).toFixed(1)), 0, 100);
          setMonthlyInputValue(newVal === 0 ? '0' : newVal.toFixed(1));
          return newVal;
        });
        break;
      case 'return':
        setAnnualReturn(prev => {
          const newVal = clamp(parseFloat((prev - 0.1).toFixed(1)), 0, 20);
          setReturnInputValue(newVal.toFixed(1));
          return newVal;
        });
        break;
      case 'years':
        setYears(prev => {
          const newVal = clamp(prev - 1, 1, 50);
          setYearsInputValue(newVal.toString());
          return newVal;
        });
        break;
      case 'initial':
        setInitialInvestment(prev => {
          const newVal = clamp(prev - 10, 0, 10_000);
          setInitialInputValue(newVal.toString());
          return newVal;
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* タブ切り替え（Tier 2以上で比較モード表示） */}
      {showComparisonMode && (
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'single'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            通常モード
          </button>
          <button
            type="button"
            onClick={() => setViewMode('comparison')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'comparison'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            比較モード
          </button>
        </div>
      )}

      {/* 比較モード */}
      {viewMode === 'comparison' ? (
        <InvestmentComparison />
      ) : (
        /* 通常モード */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                NISA複利シミュレーション
              </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  月々の積立額
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={monthlyInputValue}
                    onChange={event => handleMonthlyChange(event.target.value)}
                    onBlur={handleMonthlyBlur}
                    onKeyDown={event => {
                      // Enterキーで計算実行
                      if (event.key === 'Enter') {
                        handleCalculate();
                      }
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="3.0"
                  />
                  <span className="text-gray-600">万円</span>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => increment('monthly')}
                      className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                      aria-label="積立額を増やす"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => decrement('monthly')}
                      className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                      aria-label="積立額を減らす"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  想定利回り（年利）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={returnInputValue}
                    onChange={event => handleReturnChange(event.target.value)}
                    onBlur={handleReturnBlur}
                    onKeyDown={event => {
                      // Enterキーで計算実行
                      if (event.key === 'Enter') {
                        handleCalculate();
                      }
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="7.0"
                  />
                  <span className="text-gray-600">%</span>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => increment('return')}
                      className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                      aria-label="利回りを上げる"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => decrement('return')}
                      className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                      aria-label="利回りを下げる"
                    >
                      ▼
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  ※ デフォルト7%：S&P500の長期平均リターン（約10.5%）を保守的に見積もった値。過去50年以上のデータに基づく。
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  積立期間
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={yearsInputValue}
                    onChange={event => handleYearsChange(event.target.value)}
                    onBlur={handleYearsBlur}
                    onKeyDown={event => {
                      // Enterキーで計算実行
                      if (event.key === 'Enter') {
                        handleCalculate();
                      }
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="40"
                  />
                  <span className="text-gray-600">年</span>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => increment('years')}
                      className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                      aria-label="期間を延ばす"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => decrement('years')}
                      className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                      aria-label="期間を短くする"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* 初期投資額（全ユーザーに表示） */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  初期投資額（任意）
                </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={initialInputValue}
                      onChange={event => handleInitialChange(event.target.value)}
                      onBlur={handleInitialBlur}
                      onKeyDown={event => {
                        // Enterキーで計算実行
                        if (event.key === 'Enter') {
                          handleCalculate();
                        }
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="0"
                    />
                    <span className="text-gray-600">万円</span>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => increment('initial')}
                        className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                        aria-label="初期投資額を増やす"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => decrement('initial')}
                        className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
                        aria-label="初期投資額を減らす"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                <p className="mt-1 text-xs text-gray-500">
                  ※ 年初一括投資や退職金運用など、まとまった資金の運用シミュレーションに
                </p>
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white shadow hover:bg-emerald-600"
              >
                シミュレーションを実行
              </button>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-6 text-lg font-semibold text-gray-800">
                  投資シミュレーション結果
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <p className="text-sm text-blue-600">総積立額（元本）</p>
                    <p className="mt-2 text-2xl font-bold text-blue-700">
                      {formatInvestmentAmount(result.principal)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4 text-center">
                    <p className="text-sm text-emerald-600">運用益</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-700">
                      {formatInvestmentAmount(result.profit)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-600">最終資産額</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatInvestmentAmount(result.total)}
                    </p>
                  </div>
                </div>
              </div>

              <InvestmentChart yearlyData={result.yearlyData} />

              <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      繰上返済との詳細比較は有料版で
                    </h3>
                    <p className="mt-2 text-sm text-gray-700">
                      「この積立額を繰上返済に回した場合」との比較シミュレーションが可能です。
                      利息軽減効果とNISA運用益を並べて提示できるため、顧客への提案がより説得力を持ちます。
                    </p>
                    <button
                      type="button"
                      className="mt-4 text-sm font-medium text-amber-700 hover:text-amber-800"
                    >
                      詳しく見る →
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-6 py-3 text-gray-500"
                title="有料版でご利用いただけます"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                PDF出力（有料版機能）
              </button>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-500">
              左側のフォームで条件を入力し「シミュレーションを実行」を押してください
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentCalculator;
