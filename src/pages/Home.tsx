/**
 * Home Page - メイン計算画面
 *
 * ローン計算フォーム、電卓、結果表示を統合
 */

import React, { useState } from 'react';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import LoanForm from '@/components/Input/LoanForm';
import ReverseLoanForm from '@/components/Input/ReverseLoanForm';
import IncomeForm from '@/components/Input/IncomeForm';
import Summary from '@/components/Result/Summary';
import Schedule from '@/components/Result/Schedule';
import SimpleCalculator from '@/components/Calculator/SimpleCalculator';
// import { InvestmentCalculator } from '@/components/Investment'; // 資産運用モード開発完了後に有効化
import { ExportButton } from '@/components/Common/ExportButton';
import { PDFExportButton } from '@/components/Common/PDFExportButton';
import { FeatureShowcase } from '@/components/Common/FeatureShowcase';
import { useCalculator } from '@/hooks/useCalculator';
import type { LoanParams, ReverseLoanParams, CalculationMode } from '@/types';
import type { IncomeResult } from '@/types/income';

type ViewMode = 'loan' | 'calculator' | 'investment';

const Home: React.FC = () => {
  const { loanParams, loanResult, error, calculate, calculateReverse } = useCalculator();
  const [showSchedule, setShowSchedule] = useState(false);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('forward');
  const [viewMode, setViewMode] = useState<ViewMode>('loan');

  const [currentParams, setCurrentParams] = useState<LoanParams>(
    loanParams || {
      principal: 50000000, // デフォルト: 5000万円
      interestRate: 1.0,
      years: 40,
      months: 0,
      repaymentType: 'equal-payment',
      bonusPayment: {
        enabled: false,
        amount: 15000000, // デフォルト: 1500万円
        months: [1, 8], // デフォルト: 1月（冬）と8月（夏）
      },
    }
  );

  const [reverseParams, setReverseParams] = useState<ReverseLoanParams>({
    monthlyPayment: 150000, // デフォルト: 15万円
    interestRate: 1.0,
    years: 40,
    months: 0,
    repaymentType: 'equal-payment',
    bonusPayment: {
      enabled: false,
      payment: 200000,
      months: [1, 8], // デフォルト: 1月（冬）と8月（夏）
    },
  });

  const exportParams = loanParams ?? currentParams;

  const handleCalculate = () => {
    calculate(currentParams);
    setShowSchedule(true);
  };

  const handleReverseCalculate = () => {
    calculateReverse(reverseParams);
    setShowSchedule(true);
  };

  // 年収計算から詳細計算への遷移
  const handleDetailPlan = (result: IncomeResult, incomeParams: any) => {
    // 借入可能額を借入金額にセット
    setCurrentParams({
      principal: result.maxBorrowableAmount,
      interestRate: incomeParams.interestRate,
      years: incomeParams.years,
      months: 0,
      repaymentType: 'equal-payment',
      bonusPayment: {
        enabled: false,
        amount: 15000000,
        months: [1, 8],
      },
    });
    // ローン計算モード（forward）に切り替え
    setViewMode('loan');
    setCalculationMode('forward');
    // 自動計算
    calculate({
      principal: result.maxBorrowableAmount,
      interestRate: incomeParams.interestRate,
      years: incomeParams.years,
      months: 0,
      repaymentType: 'equal-payment',
      bonusPayment: {
        enabled: false,
        amount: 15000000,
        months: [1, 8],
      },
    });
    setShowSchedule(true);
  };

  const viewModeButtonClass = (mode: ViewMode) => `
    w-full h-14 sm:h-16 rounded-xl border transition-all text-sm sm:text-base font-semibold
    ${viewMode === mode
      ? 'bg-primary text-white shadow-lg border-primary'
      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
  `;

  const calculationModeButtonClass = (mode: CalculationMode) => `
    flex flex-col items-center justify-center rounded-xl border text-xs sm:text-sm font-semibold tracking-wide
    transition-all h-20 sm:h-24
    ${calculationMode === mode
      ? 'bg-secondary text-white shadow-md border-secondary'
      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
  `;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <Container>
        <div className="py-8">
          {/* タイトル */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              住宅ローン電卓
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {viewMode === 'loan'
                ? calculationMode === 'forward'
                  ? '借入金額と返済条件を入力して、月々の返済額を計算できます'
                  : calculationMode === 'reverse'
                    ? '月々の返済額を入力して、借入可能額を計算できます'
                    : '年収から借入可能な最大額を計算できます'
                : viewMode === 'calculator'
                  ? '坪数計算や簡易計算に便利な電卓です'
                  : 'NISAを活用した資産運用のシミュレーションが行えます'}
            </p>
          </div>

          {/* 表示モード切り替え */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-xl mx-auto w-full">
            <button
              onClick={() => setViewMode('loan')}
              className={viewModeButtonClass('loan')}
            >
              💰 ローン計算
            </button>
            <button
              onClick={() => setViewMode('calculator')}
              className={viewModeButtonClass('calculator')}
            >
              🧮 電卓
            </button>
            {/* 資産運用モード - 開発完了後に有効化 */}
            {/*
            <button
              onClick={() => setViewMode('investment')}
              className={viewModeButtonClass('investment')}
            >
              📈 資産運用
            </button>
            */}
          </div>

          {/* ローンモード時の計算タイプ切り替え */}
          {viewMode === 'loan' && (
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl mx-auto w-full">
              <button
                onClick={() => setCalculationMode('forward')}
                className={calculationModeButtonClass('forward')}
              >
                <span className="text-lg">🏠</span>
                借入額
              </button>
              <button
                onClick={() => setCalculationMode('reverse')}
                className={calculationModeButtonClass('reverse')}
              >
                <span className="text-lg">💳</span>
                返済額
              </button>
              <button
                onClick={() => setCalculationMode('income')}
                className={calculationModeButtonClass('income')}
              >
                <span className="text-lg">💼</span>
                年収
              </button>
            </div>
          )}

          {/* メインコンテンツ */}
          {viewMode === 'calculator' && <SimpleCalculator />}
          {/* 資産運用モード - 開発完了後に有効化 */}
          {/* {viewMode === 'investment' && <InvestmentCalculator />} */}
          {viewMode === 'loan' && calculationMode === 'income' && (
            <IncomeForm onDetailPlan={handleDetailPlan} />
          )}
          {viewMode === 'loan' && calculationMode !== 'income' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左側: 入力フォーム */}
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    {calculationMode === 'forward' ? 'ローン条件入力' : '返済条件入力'}
                  </h2>
                  {calculationMode === 'forward' ? (
                    <LoanForm
                      values={currentParams}
                      onChange={setCurrentParams}
                      onSubmit={handleCalculate}
                    />
                  ) : (
                    <ReverseLoanForm
                      values={reverseParams}
                      onChange={setReverseParams}
                      onSubmit={handleReverseCalculate}
                    />
                  )}
                </div>
              </div>

              {/* 右側: 計算結果 */}
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">エラー</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                )}

                {loanResult && (
                  <>
                    {/* 結果サマリー */}
                    <Summary
                      result={loanResult}
                      mode={calculationMode}
                      className="shadow-md"
                      actions={
                        exportParams ? (
                          <PDFExportButton
                            result={loanResult}
                            params={exportParams}
                            className="w-full sm:w-auto"
                          />
                        ) : undefined
                      }
                    />

                    {/* 返済計画表 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                          返済計画表
                        </h2>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => setShowSchedule(!showSchedule)}
                            className="text-primary hover:text-primary-dark font-medium text-sm"
                          >
                            {showSchedule ? '非表示' : '表示'}
                          </button>
                          <ExportButton
                            schedule={loanResult.schedule}
                            className="w-full sm:w-auto"
                          />
                        </div>
                      </div>

                      {showSchedule && (
                        <Schedule schedule={loanResult.schedule} />
                      )}
                    </div>
                  </>
                )}

                {!loanResult && !error && (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-500">
                      ローン条件を入力して「計算する」ボタンを押してください
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 機能紹介セクション */}
          <FeatureShowcase />
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default Home;
