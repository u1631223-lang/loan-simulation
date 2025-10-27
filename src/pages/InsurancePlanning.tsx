/**
 * Phase 16: 保険設計シミュレーションページ
 *
 * 必要保障額計算・保険分析・保険提案を統合
 */

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { InsurancePlanForm } from '@/components/FP/Insurance/InsurancePlanForm';
import { CoverageAnalysisComponent } from '@/components/FP/Insurance/CoverageAnalysis';
import { InsuranceRecommendationComponent } from '@/components/FP/Insurance/InsuranceRecommendation';
import { FeatureGate } from '@/components/Common/FeatureGate';
import { performCoverageAnalysis } from '@/utils/insuranceCalculator';
import type {
  InsurancePlanParams,
  CoverageAnalysis as CoverageAnalysisType,
} from '@/types/insurance';

type TabType = 'input' | 'analysis' | 'recommendation';

const tabs: { id: TabType; label: string; description: string; icon: string }[] = [
  {
    id: 'input',
    label: '情報入力',
    description: '家族構成・収支・資産情報を入力',
    icon: '📝',
  },
  {
    id: 'analysis',
    label: '必要保障額分析',
    description: '遺族の生活費・教育費から算出',
    icon: '🔍',
  },
  {
    id: 'recommendation',
    label: '保険提案',
    description: '現在の保険との過不足を分析',
    icon: '💡',
  },
];

export const InsurancePlanning = () => {
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const [params, setParams] = useState<InsurancePlanParams | null>(null);
  const [analysis, setAnalysis] = useState<CoverageAnalysisType | null>(null);

  const handleSubmit = (newParams: InsurancePlanParams) => {
    setParams(newParams);

    // 必要保障額を完全分析
    const newAnalysis = performCoverageAnalysis({
      monthlyExpense: newParams.monthlyExpense,
      spouseAge: newParams.spouseAge,
      children: newParams.children,
      housingCost: newParams.housingCost,
      spouseIncome: newParams.spouseIncome,
      otherIncome: newParams.otherIncome,
      savings: newParams.savings,
      securities: newParams.securities,
      realEstate: newParams.realEstate,
      averageSalary: newParams.averageSalary,
      insuredMonths: newParams.insuredMonths,
    });
    setAnalysis(newAnalysis);

    // 自動的に分析タブに移動
    setActiveTab('analysis');
  };

  const handleReset = () => {
    setParams(null);
    setAnalysis(null);
    setActiveTab('input');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Phase 16 保険設計
                </span>
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-sm font-semibold text-white">
                  Premium限定
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                保険設計シミュレーション
              </h1>
              <p className="max-w-2xl mx-auto text-gray-600">
                必要保障額の計算・現在の保険との過不足分析・最適な保険提案
              </p>
            </div>
          </div>
        </div>

        <FeatureGate tier="premium" featureName="保険設計シミュレーション">
        {/* タブナビゲーション */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.id !== 'input' && !analysis}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : tab.id !== 'input' && !analysis
                        ? 'border-transparent text-gray-400 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{tab.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                      {tab.description}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 情報入力 */}
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">ℹ️</span>
                  <div>
                    <h3 className="font-semibold text-blue-900">必要保障額とは？</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      世帯主に万が一のことがあった場合、遺族が生活に困らないために必要な金額です。
                      遺族の生活費・教育費から、遺族年金・既存資産を差し引いて計算します。
                    </p>
                  </div>
                </div>
              </div>

              <InsurancePlanForm
                initialParams={params ?? undefined}
                onSubmit={handleSubmit}
                onCancel={params ? handleReset : undefined}
              />
            </div>
          )}

          {/* 必要保障額分析 */}
          {activeTab === 'analysis' && analysis && params && (
            <div className="space-y-6">
              <CoverageAnalysisComponent
                analysis={analysis}
                currentInsurance={params.currentInsurance}
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  入力をやり直す
                </button>
                <button
                  onClick={() => setActiveTab('recommendation')}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  保険提案を見る →
                </button>
              </div>
            </div>
          )}

          {/* 保険提案 */}
          {activeTab === 'recommendation' && analysis && params && (
            <div className="space-y-6">
              <InsuranceRecommendationComponent
                analysis={analysis}
                currentInsurance={params.currentInsurance}
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  入力をやり直す
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  ← 分析に戻る
                </button>
              </div>
            </div>
          )}

          {/* 免責事項 */}
          <div className="mt-12 bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-800 mb-2">⚠️ 免責事項</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>本シミュレーションは簡易的な試算であり、実際の保険設計には個別のご相談が必要です</li>
              <li>遺族年金の金額は概算値であり、実際の受給額とは異なる場合があります</li>
              <li>教育費は文部科学省データを参考にした平均値です</li>
              <li>保険の加入・見直しは、FP（ファイナンシャルプランナー）等の専門家にご相談ください</li>
            </ul>
          </div>
        </div>
        </FeatureGate>
      </main>

      <Footer />
    </div>
  );
};

export default InsurancePlanning;
