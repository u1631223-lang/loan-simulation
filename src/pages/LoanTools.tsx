/**
 * LoanTools Page - 追加ローン機能（繰上返済・ローン比較）
 */

import React, { useState, lazy, Suspense } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const PrepaymentSimulator = lazy(() =>
  import('@/components/Loan/PrepaymentSimulator').then((m) => ({ default: m.PrepaymentSimulator }))
);
const ComparisonTable = lazy(() =>
  import('@/components/Loan/ComparisonTable').then((m) => ({ default: m.ComparisonTable }))
);

type LoanToolTab = 'prepayment' | 'comparison';

const tabs: Array<{
  id: LoanToolTab;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'prepayment',
    label: '繰上返済シミュレーション',
    description: '期間短縮・返済額軽減の効果を比較',
    icon: '⏱️',
  },
  {
    id: 'comparison',
    label: 'ローン比較',
    description: '最大5件のローン条件を一括比較',
    icon: '📊',
  },
];

const LoanTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LoanToolTab>('prepayment');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              ローンの詳細シミュレーション
            </h1>
            <p className="max-w-2xl mx-auto text-gray-600">
              繰上返済シミュレーションや複数ローン比較で、最適な住宅ローン戦略を見つけましょう。
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-left transition-all ${
                  activeTab === tab.id
                    ? 'border-primary bg-white shadow-md text-primary'
                    : 'border-transparent bg-white/60 text-gray-600 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <div>
                  <div className="font-semibold text-base sm:text-lg">
                    {tab.label}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pb-12">
          <Suspense
            fallback={
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500" aria-live="polite">
                読み込み中…
              </div>
            }
          >
            {activeTab === 'prepayment' ? (
              <PrepaymentSimulator />
            ) : (
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <ComparisonTable />
              </div>
            )}
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoanTools;

