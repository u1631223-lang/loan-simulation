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
import Summary from '@/components/Result/Summary';
import Schedule from '@/components/Result/Schedule';
import SimpleCalculator from '@/components/Calculator/SimpleCalculator';
import { InvestmentCalculator } from '@/components/Investment';
import { ExportButton } from '@/components/Common/ExportButton';
import { PDFExportButton } from '@/components/Common/PDFExportButton';
import { useCalculator } from '@/hooks/useCalculator';
import type { LoanParams, ReverseLoanParams, CalculationMode } from '@/types';

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
                  : '月々の返済額を入力して、借入可能額を計算できます'
                : viewMode === 'calculator'
                  ? '坪数計算や簡易計算に便利な電卓です'
                  : 'NISAを活用した資産運用のシミュレーションが行えます'}
            </p>
          </div>

          {/* 表示モード切り替え */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button
              onClick={() => setViewMode('loan')}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewMode === 'loan'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              💰 ローン計算
            </button>
            <button
              onClick={() => setViewMode('calculator')}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewMode === 'calculator'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              🧮 電卓
            </button>
            <button
              onClick={() => setViewMode('investment')}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewMode === 'investment'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              📈 資産運用
            </button>
          </div>

          {/* ローンモード時の計算タイプ切り替え */}
          {viewMode === 'loan' && (
            <div className="flex gap-2 mb-8 justify-center">
              <button
                onClick={() => setCalculationMode('forward')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  calculationMode === 'forward'
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                借入額から計算
              </button>
              <button
                onClick={() => setCalculationMode('reverse')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  calculationMode === 'reverse'
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                返済額から計算
              </button>
            </div>
          )}

          {/* メインコンテンツ */}
          {viewMode === 'calculator' && <SimpleCalculator />}
          {viewMode === 'investment' && <InvestmentCalculator />}
          {viewMode === 'loan' && (
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
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default Home;
