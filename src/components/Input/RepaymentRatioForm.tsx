/**
 * RepaymentRatioForm - 返済負担率計算入力フォーム
 *
 * 本人年収 + 連帯債務者年収（任意）から、
 * 返済負担率25%で借入可能額を計算する
 */

import React, { useState } from 'react';
import type { RepaymentRatioParams, RepaymentRatioResult } from '@/types/repaymentRatio';
import { calculateFromRepaymentRatio } from '@/utils/repaymentRatioCalculator';

interface RepaymentRatioFormProps {
  onCalculate: (result: RepaymentRatioResult) => void;
}

export const RepaymentRatioForm: React.FC<RepaymentRatioFormProps> = ({ onCalculate }) => {
  const [primaryIncome, setPrimaryIncome] = useState<string>('');
  const [coDebtorIncome, setCoDebtorIncome] = useState<string>('');
  const [repaymentRatio, setRepaymentRatio] = useState<number>(25); // デフォルト25%
  const [repaymentRatioInput, setRepaymentRatioInput] = useState<string>('25'); // 表示用
  const [interestRate, setInterestRate] = useState<number>(1.0);
  const [interestRateInput, setInterestRateInput] = useState<string>('1.00'); // 表示用
  const [years, setYears] = useState<number>(40); // デフォルト40年
  const [yearsInput, setYearsInput] = useState<string>('40'); // 表示用
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const incrementRepaymentRatio = () => {
    const newValue = Math.min(repaymentRatio + 1, 50);
    setRepaymentRatio(newValue);
    setRepaymentRatioInput(newValue.toString());
  };

  const decrementRepaymentRatio = () => {
    const newValue = Math.max(repaymentRatio - 1, 10);
    setRepaymentRatio(newValue);
    setRepaymentRatioInput(newValue.toString());
  };

  const incrementInterestRate = () => {
    const newValue = Math.min(interestRate + 0.01, 10.0);
    const rounded = Math.round(newValue * 100) / 100;
    setInterestRate(rounded);
    setInterestRateInput(rounded.toFixed(2));
  };

  const decrementInterestRate = () => {
    const newValue = Math.max(interestRate - 0.01, 0.01);
    const rounded = Math.round(newValue * 100) / 100;
    setInterestRate(rounded);
    setInterestRateInput(rounded.toFixed(2));
  };

  const incrementYears = () => {
    const newValue = Math.min(years + 1, 50);
    setYears(newValue);
    setYearsInput(newValue.toString());
  };

  const decrementYears = () => {
    const newValue = Math.max(years - 1, 1);
    setYears(newValue);
    setYearsInput(newValue.toString());
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const primary = Number(primaryIncome);
    if (!primaryIncome || primary <= 0) {
      newErrors.primaryIncome = '本人年収を入力してください';
    } else if (primary > 9999) {
      newErrors.primaryIncome = '本人年収は9999万円以下で入力してください';
    }

    const coDebtor = Number(coDebtorIncome) || 0;
    if (coDebtor < 0) {
      newErrors.coDebtorIncome = '連帯債務者年収は0以上で入力してください';
    } else if (coDebtor > 9999) {
      newErrors.coDebtorIncome = '連帯債務者年収は9999万円以下で入力してください';
    }

    if (repaymentRatio < 10 || repaymentRatio > 50) {
      newErrors.repaymentRatio = '返済負担率は10%〜50%で入力してください';
    }

    if (interestRate < 0.01 || interestRate > 10) {
      newErrors.interestRate = '金利は0.01%〜10.0%で入力してください';
    }

    if (years < 1 || years > 50) {
      newErrors.years = '返済期間は1年〜50年で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) {
      return;
    }

    const params: RepaymentRatioParams = {
      primaryIncome: Number(primaryIncome) || 0,
      coDebtorIncome: Number(coDebtorIncome) || 0,
      repaymentRatio: repaymentRatio / 100, // %を小数に変換（例：25% → 0.25）
      interestRate,
      years,
    };

    const result = calculateFromRepaymentRatio(params);
    onCalculate(result);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  // 返済負担率のハンドラー
  const handleRepaymentRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 空文字または数字（小数点含む）のみ許可
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setRepaymentRatioInput(value);
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        setRepaymentRatio(num);
      }
    }
  };

  const handleRepaymentRatioBlur = () => {
    // 空文字または無効な値の場合、25%（基本値）に戻す
    if (repaymentRatioInput === '' || isNaN(parseFloat(repaymentRatioInput))) {
      setRepaymentRatioInput('25');
      setRepaymentRatio(25);
    } else {
      // 有効な値の場合、実数値で表示を更新
      setRepaymentRatioInput(repaymentRatio.toString());
    }
  };

  // 金利のハンドラー
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 空文字または数字（小数点含む）のみ許可
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInterestRateInput(value);
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        setInterestRate(Math.round(num * 100) / 100);
      }
    }
  };

  const handleInterestRateBlur = () => {
    // 空文字の場合、デフォルト値に戻す
    if (interestRateInput === '' || isNaN(parseFloat(interestRateInput))) {
      const defaultRate = interestRate || 1.0;
      setInterestRateInput(defaultRate.toFixed(2));
      setInterestRate(defaultRate);
    } else {
      setInterestRateInput(interestRate.toFixed(2));
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
        setYears(num);
      }
    }
  };

  const handleYearsBlur = () => {
    // 空文字の場合、デフォルト値に戻す
    if (yearsInput === '' || isNaN(parseInt(yearsInput))) {
      const defaultYears = years || 40;
      setYearsInput(defaultYears.toString());
      setYears(defaultYears);
    } else {
      setYearsInput(years.toString());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        💰 返済負担率から借入可能額を計算
      </h3>

      <div className="space-y-4">
        {/* 本人年収 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            本人年収 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={primaryIncome}
              onChange={(e) => setPrimaryIncome(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="例：500"
              className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.primaryIncome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-gray-700 font-medium">万円</span>
          </div>
          {errors.primaryIncome && (
            <p className="text-red-500 text-sm mt-1">{errors.primaryIncome}</p>
          )}
        </div>

        {/* 連帯債務者年収 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            連帯債務者年収（任意）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={coDebtorIncome}
              onChange={(e) => setCoDebtorIncome(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="例：300"
              className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.coDebtorIncome ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-gray-700 font-medium">万円</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            配偶者など、共同で返済する方の年収
          </p>
          {errors.coDebtorIncome && (
            <p className="text-red-500 text-sm mt-1">{errors.coDebtorIncome}</p>
          )}
        </div>

        {/* 返済負担率（編集可能） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            返済負担率
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrementRepaymentRatio}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition active:scale-95"
            >
              ▼
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={repaymentRatioInput}
              onChange={handleRepaymentRatioChange}
              onBlur={handleRepaymentRatioBlur}
              onKeyPress={handleKeyPress}
              className={`flex-1 px-4 py-2 border rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.repaymentRatio ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-gray-700 font-medium">%</span>
            <button
              type="button"
              onClick={incrementRepaymentRatio}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition active:scale-95"
            >
              ▲
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            無理のない返済計画の目安: 25%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ※ あくまで目安であり、住宅のランニングコストによっては、無理のない返済計画の目安が前後します
          </p>
          {errors.repaymentRatio && (
            <p className="text-red-500 text-sm mt-1">{errors.repaymentRatio}</p>
          )}
        </div>

        {/* 金利 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            金利（年利）
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrementInterestRate}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition active:scale-95"
            >
              ▼
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={interestRateInput}
              onChange={handleInterestRateChange}
              onBlur={handleInterestRateBlur}
              onKeyPress={handleKeyPress}
              className={`flex-1 px-4 py-2 border rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.interestRate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-gray-700 font-medium">%</span>
            <button
              type="button"
              onClick={incrementInterestRate}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition active:scale-95"
            >
              ▲
            </button>
          </div>
          {errors.interestRate && (
            <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>
          )}
        </div>

        {/* 返済期間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            返済期間
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decrementYears}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition active:scale-95"
            >
              ▼
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={yearsInput}
              onChange={handleYearsChange}
              onBlur={handleYearsBlur}
              onKeyPress={handleKeyPress}
              className={`flex-1 px-4 py-2 border rounded-lg text-center focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.years ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-gray-700 font-medium">年</span>
            <button
              type="button"
              onClick={incrementYears}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition active:scale-95"
            >
              ▲
            </button>
          </div>
          {errors.years && (
            <p className="text-red-500 text-sm mt-1">{errors.years}</p>
          )}
        </div>

        {/* 計算ボタン */}
        <button
          onClick={handleCalculate}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition shadow-md active:scale-95"
        >
          計算する
        </button>
      </div>
    </div>
  );
};
