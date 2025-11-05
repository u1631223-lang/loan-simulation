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
import { RepaymentRatioForm } from '@/components/Input/RepaymentRatioForm';
import Summary from '@/components/Result/Summary';
import Schedule from '@/components/Result/Schedule';
import { RepaymentRatioSummary } from '@/components/Result/RepaymentRatioSummary';
import SimpleCalculator from '@/components/Calculator/SimpleCalculator';
import { InvestmentCalculator } from '@/components/Investment';
import { ExportButton } from '@/components/Common/ExportButton';
import { PDFExportButton } from '@/components/Common/PDFExportButton';
import { FeatureShowcase } from '@/components/Common/FeatureShowcase';
import { AIAdviceCard } from '@/components/AI/AIAdviceCard';
import { useCalculator } from '@/hooks/useCalculator';
import { useAIAdvice } from '@/hooks/useAIAdvice';
import { generateAdvice, isGeminiAvailable } from '@/services/geminiClient';
import { generateLoanAnalysisPrompt, createAnalysisContext } from '@/utils/promptTemplates';
import { parseAIAdvice, isAIAdviceError } from '@/utils/aiAdviceParser';
import type { LoanParams, ReverseLoanParams, CalculationMode } from '@/types';
import type { IncomeResult } from '@/types/income';
import type { RepaymentRatioResult } from '@/types/repaymentRatio';
import type { AILoanAdvice, AIAdviceError, LoanAnalysisParams } from '@/types/aiAdvice';

type ViewMode = 'loan' | 'calculator' | 'investment';

const Home: React.FC = () => {
  const { loanParams, loanResult, error, calculate, calculateReverse } = useCalculator();
  const { saveAdvice } = useAIAdvice();
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

  // 返済負担率計算の状態
  const [repaymentRatioResult, setRepaymentRatioResult] = useState<RepaymentRatioResult | null>(
    null
  );

  // AI アドバイスの状態
  const [aiAdvice, setAiAdvice] = useState<AILoanAdvice | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<AIAdviceError | null>(null);
  const [showAiAdvice, setShowAiAdvice] = useState(false);

  const exportParams = loanParams ?? currentParams;

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

  // AI アドバイス生成
  const handleGenerateAIAdvice = async () => {
    if (!loanResult) return;

    // Gemini API が利用可能かチェック
    if (!isGeminiAvailable()) {
      setAiError({
        type: 'api_error',
        message: 'Gemini API キーが設定されていません。.env ファイルに VITE_GEMINI_API_KEY を設定してください。',
      });
      setShowAiAdvice(true);
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setShowAiAdvice(true);

    try {
      // デフォルト値で分析コンテキストを作成
      // TODO: 実際のユーザー入力から取得（Phase 13以降で実装）
      const analysisContext: LoanAnalysisParams = createAnalysisContext(
        currentParams,
        loanResult,
        600, // デフォルト年収: 600万円
        3,   // デフォルト家族人数: 3人
        1    // デフォルト子供人数: 1人
      );

      // プロンプト生成
      const prompt = generateLoanAnalysisPrompt(analysisContext);

      // Gemini API 呼び出し
      const response = await generateAdvice(prompt);

      // レスポンスをパース
      const parsedResult = parseAIAdvice(response);

      if (isAIAdviceError(parsedResult)) {
        setAiError(parsedResult);
        setAiAdvice(null);
      } else {
        setAiAdvice(parsedResult);
        setAiError(null);

        // Supabase に保存（ログイン済みの場合）
        try {
          await saveAdvice({
            advice: parsedResult,
            analysisParams: analysisContext,
          });
        } catch (saveError) {
          console.warn('AI advice save failed (non-critical):', saveError);
          // 保存失敗してもアドバイスは表示する
        }
      }
    } catch (error) {
      console.error('AI advice generation error:', error);
      setAiError({
        type: 'api_error',
        message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
        originalError: error instanceof Error ? error : undefined,
      });
      setAiAdvice(null);
    } finally {
      setAiLoading(false);
    }
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-xl mx-auto w-full">
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
          {viewMode === 'investment' && <InvestmentCalculator />}
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
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {/* AI アドバイスボタン */}
                          <button
                            onClick={handleGenerateAIAdvice}
                            disabled={aiLoading}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {aiLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>分析中...</span>
                              </>
                            ) : (
                              <>
                                <span>🤖</span>
                                <span>AIアドバイス</span>
                              </>
                            )}
                          </button>

                          {/* PDF エクスポートボタン */}
                          {exportParams && (
                            <PDFExportButton
                              result={loanResult}
                              params={exportParams}
                              className="w-full sm:w-auto"
                            />
                          )}
                        </div>
                      }
                    />

                    {/* AI アドバイスカード */}
                    {showAiAdvice && (
                      <AIAdviceCard
                        advice={aiAdvice}
                        loading={aiLoading}
                        error={aiError}
                        onRegenerate={handleGenerateAIAdvice}
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

      <Footer />
    </div>
  );
};

export default Home;
