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
import GuideViewer from '@/components/Guide/GuideViewer';
import { ExportButton } from '@/components/Common/ExportButton';
import { PDFExportButton } from '@/components/Common/PDFExportButton';
import { FeatureShowcase } from '@/components/Common/FeatureShowcase';
import { AIAdviceCard } from '@/components/AI/AIAdviceCard';
import { useCalculator } from '@/hooks/useCalculator';
import { useAIAdvice } from '@/hooks/useAIAdvice';
import { generateAdvice, isGeminiAvailable } from '@/services/geminiClient';
import { generateLoanAnalysisPrompt, createAnalysisContext } from '@/utils/promptTemplates';
import { parseAIAdvice, isAIAdviceError } from '@/utils/aiAdviceParser';
import InterestRateComparisonPanel from '@/components/Result/InterestRateComparisonPanel';
import type { LoanParams, ReverseLoanParams, CalculationMode } from '@/types';
import type { IncomeResult } from '@/types/income';
import type { RepaymentRatioResult } from '@/types/repaymentRatio';
import type { AILoanAdvice, AIAdviceError, LoanAnalysisParams } from '@/types/aiAdvice';

type ViewMode = 'loan' | 'calculator' | 'investment' | 'guide';

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
        enabled: true, // デフォルト: ON
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
      enabled: true, // デフォルト: ON
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
  const [showInterestComparison, setShowInterestComparison] = useState(false);

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

      // Gemini API が利用可能かチェック
      if (!isGeminiAvailable()) {
        // テストモード: モックデータを使用
        console.info('🧪 テストモード: Gemini APIキー未設定のため、モックデータを表示します');

        // ローディング演出のため少し待つ
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 返済負担率からリスクレベルを判定
        const repaymentRatio = analysisContext.repaymentRatio;
        let riskLevel: 'low' | 'medium' | 'high' = 'medium';
        if (repaymentRatio <= 25) riskLevel = 'low';
        else if (repaymentRatio > 35) riskLevel = 'high';

        // モックアドバイスを生成
        const mockAdvice: AILoanAdvice = {
          riskLevel,
          analysis: `【テストモード】年収${analysisContext.annualIncome}万円に対して${(analysisContext.principal / 10000).toLocaleString()}万円の借入は、返済負担率が${repaymentRatio.toFixed(1)}%となります。${
            riskLevel === 'low' ? '比較的安全な範囲内での借入と言えます。' :
            riskLevel === 'medium' ? '標準的な範囲ですが、余裕を持った資金計画が重要です。' :
            '負担率がやや高めです。慎重な検討をお勧めします。'
          }金利上昇リスクや教育費・老後資金の準備も含めた総合的な計画を立てましょう。実際のAI分析を利用するには、Gemini APIキーを設定してください（詳細: docs/GEMINI_SETUP.md）。`,
          recommendations: [
            `返済期間を${analysisContext.years + 5}年に延長することで、月々の返済額を約${Math.round((analysisContext.monthlyPayment * 0.15) / 1000) * 1000}円軽減できます`,
            `ボーナス時に年間${Math.round((analysisContext.principal * 0.01) / 10000) * 10000}円の繰上返済を行うことで、総返済額を約${Math.round((analysisContext.principal * 0.05) / 100000) * 10}万円削減可能です`,
            `つみたてNISAで月3万円の積立投資を並行し、${analysisContext.childrenCount > 0 ? '教育費と' : ''}老後資金を準備しましょう`,
          ],
          warnings: [
            `変動金利の場合、金利が1%上昇すると月々の返済額が約${Math.round((analysisContext.principal * 0.01 / 12) / 1000) * 1000}円増加します`,
            analysisContext.childrenCount > 0
              ? '10年後に子供の大学進学費用が必要になる時期と返済のピークが重なる可能性があります'
              : '将来のライフイベント（結婚、出産など）による支出増加に備えた資金計画が必要です',
          ],
          generatedAt: new Date().toISOString(),
        };

        setAiAdvice(mockAdvice);
        setAiError(null);
        return;
      }

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
                  : viewMode === 'investment'
                    ? 'NISAを活用した資産運用のシミュレーションが行えます'
                    : '住宅ローンに関する基礎知識や活用方法を図解で分かりやすく解説します'}
            </p>
          </div>

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
          {viewMode === 'investment' && <InvestmentCalculator />}
          {viewMode === 'guide' && <GuideViewer />}
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

                    {/* 金利上昇比較パネル */}
                    {calculationMode === 'forward' && (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <button
                          onClick={() => setShowInterestComparison((prev) => !prev)}
                          className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                          {showInterestComparison ? '金利上昇比較を閉じる' : '金利上昇時を比較'}
                        </button>

                        {showInterestComparison && (
                          <div className="mt-4">
                            <InterestRateComparisonPanel
                              baseParams={currentParams}
                              baseResult={loanResult}
                            />
                          </div>
                        )}
                      </div>
                    )}

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
