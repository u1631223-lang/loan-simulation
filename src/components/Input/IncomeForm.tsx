/**
 * IncomeForm コンポーネント
 * 年収ベースの借入可能額計算フォーム
 */

import React, { useEffect, useRef, useState } from 'react';
import type { IncomeParams, IncomeResult } from '@/types/income';
import { calculateMaxBorrowable, validateIncomeParams } from '@/utils/incomeCalculator';

interface IncomeFormProps {
  onDetailPlan?: (result: IncomeResult, params: IncomeParams) => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ onDetailPlan }) => {
  const showMemo = true;

  const [params, setParams] = useState<IncomeParams>({
    primaryIncome: 500, // デフォルト: 500万円
    interestRate: 1.0,
    years: 35,
    hasCoDebtor: true, // デフォルト: ON
    coDebtorType: 'joint-debtor', // デフォルト: 連帯債務者
    coDebtorIncome: 400,
    memo: '',
  });
  const [interestRateInput, setInterestRateInput] = useState<string>(
    params.interestRate === 0 ? '' : params.interestRate.toFixed(2)
  );
  const [primaryIncomeInput, setPrimaryIncomeInput] = useState<string>('500');
  const [yearsInput, setYearsInput] = useState<string>('35');
  const [coDebtorIncomeInput, setCoDebtorIncomeInput] = useState<string>('400');

  const [result, setResult] = useState<IncomeResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const interestRateInputRef = useRef<HTMLInputElement | null>(null);
  const isInterestRateEditingRef = useRef(false);

  useEffect(() => {
    if (isInterestRateEditingRef.current) return;
    if (params.interestRate === 0) {
      setInterestRateInput('');
      return;
    }
    setInterestRateInput(params.interestRate.toFixed(2));
  }, [params.interestRate]);

  const handleChange = (field: keyof IncomeParams, value: string | number | boolean) => {
    setParams(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 数値の増減ハンドラ
  const handleIncrement = (field: keyof IncomeParams, step: number) => {
    const currentValue = params[field] as number;
    const newValue = Math.max(0, currentValue + step);
    handleChange(field, newValue);

    // 表示用の状態も更新
    if (field === 'primaryIncome') {
      setPrimaryIncomeInput(newValue.toString());
    } else if (field === 'years') {
      setYearsInput(newValue.toString());
    } else if (field === 'coDebtorIncome') {
      setCoDebtorIncomeInput(newValue.toString());
    }
  };

  const handleDecrement = (field: keyof IncomeParams, step: number) => {
    const currentValue = params[field] as number;
    const newValue = Math.max(0, currentValue - step);
    handleChange(field, newValue);

    // 表示用の状態も更新
    if (field === 'primaryIncome') {
      setPrimaryIncomeInput(newValue.toString());
    } else if (field === 'years') {
      setYearsInput(newValue.toString());
    } else if (field === 'coDebtorIncome') {
      setCoDebtorIncomeInput(newValue.toString());
    }
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '' || /^\d*\.?\d*$/.test(input)) {
      isInterestRateEditingRef.current = true;
      setInterestRateInput(input);
      const numericValue = parseFloat(input);
      handleChange('interestRate', Number.isNaN(numericValue) ? 0 : numericValue);
    }
  };

  const handleInterestRateBlur = () => {
    isInterestRateEditingRef.current = false;
    if (interestRateInput.trim() === '') {
      setInterestRateInput('');
      handleChange('interestRate', 0);
      return;
    }
    const numericValue = parseFloat(interestRateInput);
    if (Number.isNaN(numericValue)) {
      setInterestRateInput('');
      handleChange('interestRate', 0);
      return;
    }
    const formatted = numericValue.toFixed(2);
    setInterestRateInput(formatted);
    handleChange('interestRate', numericValue);
  };

  const handleInterestRateFocus = () => {
    isInterestRateEditingRef.current = true;
  };

  const handleInterestRateClear = () => {
    isInterestRateEditingRef.current = true;
    setInterestRateInput('');
    handleChange('interestRate', 0);
    requestAnimationFrame(() => {
      interestRateInputRef.current?.focus();
    });
  };

  // 本人年収のハンドラー
  const handlePrimaryIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 空文字または数字（小数点含む）のみ許可
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrimaryIncomeInput(value);
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        handleChange('primaryIncome', num);
      }
    }
  };

  const handlePrimaryIncomeBlur = () => {
    // 空文字の場合、デフォルト値に戻す
    if (primaryIncomeInput === '' || isNaN(parseFloat(primaryIncomeInput))) {
      const defaultIncome = params.primaryIncome || 500;
      setPrimaryIncomeInput(defaultIncome.toString());
      handleChange('primaryIncome', defaultIncome);
    }
  };

  // 返済期間のハンドラー
  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 空文字または数字のみ許可
    if (value === '' || /^\d+$/.test(value)) {
      setYearsInput(value);
      const num = parseInt(value);
      if (!isNaN(num) && num > 0) {
        handleChange('years', num);
      }
    }
  };

  const handleYearsBlur = () => {
    // 空文字の場合、デフォルト値に戻す
    if (yearsInput === '' || isNaN(parseInt(yearsInput))) {
      const defaultYears = params.years || 35;
      setYearsInput(defaultYears.toString());
      handleChange('years', defaultYears);
    }
  };

  // 連帯債務者年収のハンドラー
  const handleCoDebtorIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 空文字または数字（小数点含む）のみ許可
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCoDebtorIncomeInput(value);
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        handleChange('coDebtorIncome', num);
      } else if (value === '') {
        handleChange('coDebtorIncome', 0);
      }
    }
  };

  const handleCoDebtorIncomeBlur = () => {
    // 空文字の場合、デフォルト値に戻す
    if (coDebtorIncomeInput === '' || isNaN(parseFloat(coDebtorIncomeInput))) {
      const defaultIncome = params.coDebtorIncome || 400;
      setCoDebtorIncomeInput(defaultIncome.toString());
      handleChange('coDebtorIncome', defaultIncome);
    }
  };

  const handleCalculate = () => {
    // バリデーション
    const validationErrors = validateIncomeParams(params);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // 計算実行
      const calculatedResult = calculateMaxBorrowable(params);
      setResult(calculatedResult);
    } else {
      setResult(null);
    }
  };

  const handleDetailPlanClick = () => {
    if (result && onDetailPlan) {
      onDetailPlan(result, params);
    }
  };

  const inputClass = (hasError: boolean) => `
    w-full px-3 py-2 rounded-lg border-2 text-sm
    ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
    focus:outline-none focus:ring-2 focus:ring-primary/50
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-150
  `;

  const buttonClass = `
    w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200
    transition-colors duration-150 active:scale-95
    flex items-center justify-center text-base font-semibold text-gray-700
  `;

  return (
    <div className="space-y-6">
      {/* 基本入力フォーム */}
      <div className="bg-white rounded-lg shadow-md p-5 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          💰 年収から借入可能額を計算
        </h2>

        {/* Input Section - 2 columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {/* メモフィールド（Tier 2以上で表示） */}
            {showMemo && (
              <div>
                <label htmlFor="memo" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <span className="text-lg">📝</span>
                  <span>メモ</span>
                </label>
                <input
                  id="memo"
                  type="text"
                  value={params.memo || ''}
                  onChange={(e) => handleChange('memo', e.target.value)}
                  placeholder="例）新築用、山田様など"
                  className={inputClass(false)}
                  maxLength={50}
                />
              </div>
            )}

            {/* 本人の年収 */}
            <div className="space-y-2">
              <label htmlFor="primaryIncome" className="block text-sm font-medium text-gray-700 mb-1">
                💰 あなたの年収
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="primaryIncome"
                    type="text"
                    inputMode="decimal"
                    value={primaryIncomeInput}
                    onChange={handlePrimaryIncomeChange}
                    onBlur={handlePrimaryIncomeBlur}
                    className={`${inputClass(!!errors.primaryIncome)} pr-14`}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">
                    万円
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleIncrement('primaryIncome', 10)}
                  className={buttonClass}
                >
                  ＋
                </button>
                <button
                  type="button"
                  onClick={() => handleDecrement('primaryIncome', 10)}
                  className={buttonClass}
                >
                  －
                </button>
              </div>
              {errors.primaryIncome && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryIncome}</p>
              )}
            </div>

            {/* 金利 */}
            <div className="space-y-2">
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                📈 金利（年利）
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={interestRateInputRef}
                    id="interestRate"
                    type="text"
                    value={interestRateInput}
                    onChange={handleInterestRateChange}
                    onFocus={handleInterestRateFocus}
                    onBlur={handleInterestRateBlur}
                    className={`${inputClass(!!errors.interestRate)} pr-16`}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">
                    %
                  </span>
                  {interestRateInput && (
                    <button
                      type="button"
                      onClick={handleInterestRateClear}
                      className="absolute inset-y-0 right-10 flex items-center text-xs text-gray-400 hover:text-gray-600"
                      aria-label="金利入力をクリア"
                    >
                      クリア
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleIncrement('interestRate', 0.01)}
                  className={buttonClass}
                >
                  ＋
                </button>
                <button
                  type="button"
                  onClick={() => handleDecrement('interestRate', 0.01)}
                  className={buttonClass}
                >
                  －
                </button>
              </div>
              {errors.interestRate && (
                <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
              )}
            </div>

            {/* 返済期間 */}
            <div className="space-y-2">
              <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-1">
                📅 返済期間
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="years"
                    type="text"
                    inputMode="numeric"
                    value={yearsInput}
                    onChange={handleYearsChange}
                    onBlur={handleYearsBlur}
                    className={`${inputClass(!!errors.years)} pr-14`}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">
                    年
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleIncrement('years', 1)}
                  className={buttonClass}
                >
                  ＋
                </button>
                <button
                  type="button"
                  onClick={() => handleDecrement('years', 1)}
                  className={buttonClass}
                >
                  －
                </button>
              </div>
              {errors.years && (
                <p className="mt-1 text-sm text-red-600">{errors.years}</p>
              )}
            </div>
          </div>

          {/* Right column - 連帯債務者/保証人 */}
          <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  👥 共働き / 連帯保証人
                </p>
                <p className="text-xs text-gray-500">
                  同時返済者がいる場合はオンにすると借入可能額を試算できます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('hasCoDebtor', !params.hasCoDebtor)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  params.hasCoDebtor ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-pressed={params.hasCoDebtor}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    params.hasCoDebtor ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {params.hasCoDebtor && (
              <div className="space-y-4">
                {/* ラジオボタン */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('coDebtorType', 'joint-debtor')}
                    className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                      params.coDebtorType === 'joint-debtor'
                        ? 'border-primary bg-white shadow-sm'
                        : 'border-gray-200 bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-800">連帯債務者</p>
                    <p className="text-xs text-gray-500">年収を100%合算</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('coDebtorType', 'guarantor')}
                    className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                      params.coDebtorType === 'guarantor'
                        ? 'border-primary bg-white shadow-sm'
                        : 'border-gray-200 bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-800">連帯保証人</p>
                    <p className="text-xs text-gray-500">年収を50%合算</p>
                  </button>
                </div>
                {errors.coDebtorType && (
                  <p className="text-sm text-red-600">{errors.coDebtorType}</p>
                )}

                {/* 相手の年収 */}
                <div className="space-y-2">
                  <label htmlFor="coDebtorIncome" className="block text-sm font-medium text-gray-700 mb-1">
                    同時返済者の年収
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="coDebtorIncome"
                        type="text"
                        inputMode="decimal"
                        value={coDebtorIncomeInput}
                        onChange={handleCoDebtorIncomeChange}
                        onBlur={handleCoDebtorIncomeBlur}
                        className={`${inputClass(!!errors.coDebtorIncome)} pr-14`}
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">
                        万円
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleIncrement('coDebtorIncome', 10)}
                      className={buttonClass}
                    >
                      ＋
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecrement('coDebtorIncome', 10)}
                      className={buttonClass}
                    >
                      －
                    </button>
                  </div>
                  {errors.coDebtorIncome && (
                    <p className="mt-1 text-sm text-red-600">{errors.coDebtorIncome}</p>
                  )}
                </div>

                {/* 説明 */}
                <div className="p-3 bg-blue-50 rounded-lg text-xs sm:text-sm text-blue-900">
                  <p className="font-medium mb-1">💡 違いについて</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <span className="font-semibold">連帯債務者</span>: 主債務者と同等の返済義務（夫婦で住宅ローンなど）
                    </li>
                    <li>
                      <span className="font-semibold">連帯保証人</span>: 主債務者が返済不能時に代わりに返済（親が保証人など）
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 計算ボタン - Full width below grid */}
        <div className="mt-6">
          <button
            onClick={handleCalculate}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            計算する
          </button>
        </div>
      </div>

      {/* 計算結果 */}
      {result && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 計算結果</h3>

          {/* 借入可能額 - 目立つように */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <div className="text-sm text-gray-600 mb-1">
              ✅ あなたの借入可能額（最大）
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {Math.round(result.maxBorrowableAmount / 10000).toLocaleString('ja-JP')}万円
            </div>
            <div className="text-sm text-gray-500 mt-1">
              = {result.maxBorrowableAmount.toLocaleString('ja-JP')}円
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">💡 返済負担率:</span>
              <div className="text-right">
                <span className="font-bold text-lg">{(result.repaymentRatio * 100).toFixed(0)}%</span>
                <div className="text-xs text-gray-500">
                  （年収{result.totalIncome}万円{result.repaymentRatio === 0.35 ? '以上' : '未満'}のため）
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">📌 月々の返済額:</span>
              <span className="font-bold text-lg">
                約 {result.monthlyPayment.toLocaleString('ja-JP')}円
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">📅 年間返済額:</span>
              <span className="font-bold text-lg">
                {result.annualRepayment.toLocaleString('ja-JP')}円
              </span>
            </div>
            {params.hasCoDebtor && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">👥 合算年収:</span>
                <span className="font-bold text-lg">
                  {result.totalIncome}万円
                </span>
              </div>
            )}
          </div>

          {/* 注意事項 */}
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <h4 className="font-bold text-yellow-800 mb-2">⚠️ 注意事項</h4>
            <ul className="text-sm text-yellow-900 space-y-1">
              <li>• この金額は理論上の最大値です。</li>
              <li>• 実際の借入額は、他の借入状況や審査基準により異なります。</li>
            </ul>
          </div>

          {/* CTA */}
          {onDetailPlan && (
            <button
              onClick={handleDetailPlanClick}
              className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              💰 詳しい返済計画を立てる
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default IncomeForm;
