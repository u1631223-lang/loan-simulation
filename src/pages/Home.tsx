/**
 * Home Page - メイン計算画面
 *
 * ローン計算フォーム、電卓、結果表示を統合
 */

import React, { useEffect, useState, lazy, Suspense } from 'react';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import LoanForm from '@/components/Input/LoanForm';
import ReverseLoanForm from '@/components/Input/ReverseLoanForm';
import IncomeForm from '@/components/Input/IncomeForm';
import { RepaymentRatioForm } from '@/components/Input/RepaymentRatioForm';
import Summary from '@/components/Result/Summary';
import Schedule from '@/components/Result/Schedule';
import { RepaymentRatioSummary } from '@/components/Result/RepaymentRatioSummary';
import SimpleCalculator from '@/components/Calculator/SimpleCalculator';
import { ExportButton } from '@/components/Common/ExportButton';
import { FeatureShowcase } from '@/components/Common/FeatureShowcase';
import { HeroPitch } from '@/components/Common/HeroPitch';
import { InstallHint } from '@/components/Common/InstallHint';
import { useCalculator } from '@/hooks/useCalculator';
import InterestRateComparisonPanel from '@/components/Input/InterestRateComparisonPanel';

// 重いライブラリ（recharts / jspdf / html2canvas）を含むため遅延読み込み
const InvestmentCalculator = lazy(() =>
  import('@/components/Investment').then((m) => ({ default: m.InvestmentCalculator }))
);
const GuideViewer = lazy(() => import('@/components/Guide/GuideViewer'));
const PDFExportButton = lazy(() =>
  import('@/components/Common/PDFExportButton').then((m) => ({ default: m.PDFExportButton }))
);

const LazyFallback: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500" aria-live="polite">
    読み込み中…
  </div>
);
import type { LoanParams, ReverseLoanParams, CalculationMode } from '@/types';
import type { IncomeParams, IncomeResult } from '@/types/income';
import type { RepaymentRatioResult } from '@/types/repaymentRatio';
import {
  loadFormDraft,
  saveFormDraft,
  clearFormDraft,
  hasFormDraft,
  DEFAULT_FORWARD,
  DEFAULT_REVERSE,
  type ViewMode,
} from '@/utils/formDraft';
import { useToast } from '@/hooks/useToast';

const initialDraft = loadFormDraft();
const initialDraftExists = hasFormDraft();

const Home: React.FC = () => {
  const { loanParams, loanResult, error, calculate, calculateReverse } = useCalculator();
  const { showToast } = useToast();
  const [showSchedule, setShowSchedule] = useState(false);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>(
    initialDraft.calculationMode
  );
  const [viewMode, setViewMode] = useState<ViewMode>(initialDraft.viewMode);

  const [currentParams, setCurrentParams] = useState<LoanParams>(
    loanParams || initialDraft.forward
  );

  const [reverseParams, setReverseParams] = useState<ReverseLoanParams>(initialDraft.reverse);

  // 返済負担率計算の状態
  const [repaymentRatioResult, setRepaymentRatioResult] = useState<RepaymentRatioResult | null>(
    null
  );

  // フォーム入力を localStorage に自動保存（次回起動時に最終入力を復元）
  useEffect(() => {
    const handle = window.setTimeout(() => {
      saveFormDraft({
        forward: currentParams,
        reverse: reverseParams,
        calculationMode,
        viewMode,
      });
    }, 400);
    return () => window.clearTimeout(handle);
  }, [currentParams, reverseParams, calculationMode, viewMode]);

  // 起動時、ドラフトを復元したことを 1 度だけ控えめに通知
  useEffect(() => {
    if (initialDraftExists) {
      showToast('前回入力した値を復元しました', 'success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // フォームを初期値に戻す
  const handleResetForm = () => {
    if (!window.confirm('入力内容を初期値に戻します。よろしいですか？')) return;
    setCurrentParams(DEFAULT_FORWARD);
    setReverseParams(DEFAULT_REVERSE);
    clearFormDraft();
    showToast('入力を初期値に戻しました', 'success');
  };

  const exportParams = loanParams ?? currentParams;
  // 比較パネルは表示中の結果と同じパラメータを使う
  const comparisonParams = loanParams ?? currentParams;

  const handleCalculate = () => {
    calculate(currentParams);
    setShowSchedule(true);
  };

  const handleReverseCalculate = () => {
    calculateReverse(reverseParams);
    setShowSchedule(true);
  };

  // 返済負担率計算のハンドラー
  const handleRepaymentRatioCalculate = (result: RepaymentRatioResult) => {
    setRepaymentRatioResult(result);
  };

  // 年収計算から詳細計算への遷移
  const handleDetailPlan = (result: IncomeResult, incomeParams: IncomeParams) => {
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
                  : viewMode === 'investment'
                    ? 'NISAを活用した資産運用のシミュレーションが行えます'
                    : '住宅ローンに関する基礎知識や活用方法を図解で分かりやすく解説します'}
            </p>
          </div>

          <HeroPitch />

          {/* 表示モード切り替え */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 max-w-4xl mx-auto w-full">
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
            <button
              onClick={() => setViewMode('investment')}
              className={viewModeButtonClass('investment')}
            >
              📈 資産運用（NISA）
            </button>
            <button
              onClick={() => setViewMode('guide')}
              className={viewModeButtonClass('guide')}
            >
              📚 解説
            </button>
          </div>

          {/* ローンモード時の計算タイプ切り替え */}
          {viewMode === 'loan' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-4xl mx-auto w-full">
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
                onClick={() => setCalculationMode('repayment-ratio')}
                className={calculationModeButtonClass('repayment-ratio')}
              >
                <span className="text-lg">💰</span>
                返済負担率
              </button>
              <button
                onClick={() => setCalculationMode('income')}
                className={calculationModeButtonClass('income')}
              >
                <span className="text-lg">💼</span>
                年収MAX
              </button>
            </div>
          )}

          {/* メインコンテンツ */}
          {viewMode === 'calculator' && <SimpleCalculator />}
          {viewMode === 'investment' && (
            <Suspense fallback={<LazyFallback />}>
              <InvestmentCalculator />
            </Suspense>
          )}
          {viewMode === 'guide' && (
            <Suspense fallback={<LazyFallback />}>
              <GuideViewer />
            </Suspense>
          )}
          {viewMode === 'loan' && calculationMode === 'income' && (
            <IncomeForm onDetailPlan={handleDetailPlan} />
          )}
          {viewMode === 'loan' && calculationMode === 'repayment-ratio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RepaymentRatioForm onCalculate={handleRepaymentRatioCalculate} />
              {repaymentRatioResult && (
                <RepaymentRatioSummary result={repaymentRatioResult} />
              )}
            </div>
          )}
          {viewMode === 'loan' && calculationMode !== 'income' && calculationMode !== 'repayment-ratio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左側: 入力フォーム */}
              <div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {calculationMode === 'forward' ? 'ローン条件入力' : '返済条件入力'}
                    </h2>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="text-sm text-gray-500 hover:text-gray-700 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      aria-label="入力内容を初期値に戻す"
                    >
                      初期値に戻す
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3" role="status">
                    入力値はこの端末に自動保存され、次回開いたときに復元されます。
                  </p>
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
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {exportParams && (
                            <Suspense fallback={null}>
                              <PDFExportButton
                                result={loanResult}
                                params={exportParams}
                                className="w-full sm:w-auto"
                              />
                            </Suspense>
                          )}
                        </div>
                      }
                    />

                    {/* 金利上昇比較パネル */}
                    {calculationMode === 'forward' && (
                      <InterestRateComparisonPanel
                        baseParams={comparisonParams}
                        baseResult={loanResult}
                      />
                    )}

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

      <InstallHint />
      <Footer />
    </div>
  );
};

export default Home;
