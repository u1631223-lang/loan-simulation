/**
 * Phase 15: 資産運用管理ページ
 *
 * ポートフォリオ管理・積立シミュレーション・リスク分析を統合
 */

import { useState } from 'react';
import { PortfolioManager } from '@/components/FP/Asset/PortfolioManager';
import { InvestmentSimulator } from '@/components/FP/Asset/InvestmentSimulator';
import { RiskReturnChart } from '@/components/FP/Asset/RiskReturnChart';
import { FeatureGate } from '@/components/Common/FeatureGate';
import type { AssetAllocation } from '@/types/investment';

type TabType = 'simulator' | 'portfolio' | 'analysis';

export const AssetManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('simulator');
  const [currentAllocations, setCurrentAllocations] = useState<AssetAllocation[]>([
    { assetClass: 'foreign_stocks', percentage: 30 },
    { assetClass: 'domestic_stocks', percentage: 20 },
    { assetClass: 'foreign_bonds', percentage: 20 },
    { assetClass: 'domestic_bonds', percentage: 10 },
    { assetClass: 'reit', percentage: 10 },
    { assetClass: 'cash', percentage: 10 },
  ]);

  const tabs: { id: TabType; label: string; description: string }[] = [
    {
      id: 'simulator',
      label: '積立シミュレーション',
      description: '月々の積立で将来いくら貯まるか計算',
    },
    {
      id: 'portfolio',
      label: 'ポートフォリオ設定',
      description: '資産配分を調整して期待リターンを最適化',
    },
    {
      id: 'analysis',
      label: 'リスク・リターン分析',
      description: 'ポートフォリオのリスクとリターンを可視化',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">資産運用シミュレーション</h1>
              <p className="mt-1 text-sm text-gray-600">
                積立投資・ポートフォリオ管理・リスク分析
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-sm font-semibold text-white">
              Premium限定
            </span>
          </div>
        </div>
      </div>

      <FeatureGate tier="premium" featureName="資産運用シミュレーション">
        {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{tab.label}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{tab.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 積立シミュレーション */}
        {activeTab === 'simulator' && (
          <div>
            <InvestmentSimulator />
          </div>
        )}

        {/* ポートフォリオ設定 */}
        {activeTab === 'portfolio' && (
          <div>
            <PortfolioManager
              initialAllocations={currentAllocations}
              onAllocationsChange={setCurrentAllocations}
            />
          </div>
        )}

        {/* リスク・リターン分析 */}
        {activeTab === 'analysis' && (
          <div>
            <RiskReturnChart allocations={currentAllocations} />
          </div>
        )}
      </div>

      {/* フッター情報 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            ご利用上の注意
          </h3>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>
              • このシミュレーションは過去のデータに基づく参考値であり、将来の運用成績を保証するものではありません
            </li>
            <li>
              • 実際の投資には税金（約20%）、手数料、為替リスクなどが発生します
            </li>
            <li>
              • 投資判断の最終決定は、お客様ご自身の責任で行ってください
            </li>
            <li>
              • 詳細な投資アドバイスが必要な場合は、専門のファイナンシャルプランナーにご相談ください
            </li>
          </ul>
        </div>
      </div>
      </FeatureGate>
    </div>
  );
};

export default AssetManagement;
