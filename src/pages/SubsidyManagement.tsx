/**
 * SubsidyManagement - 浄化槽補助金管理ページ
 *
 * 稲沢市の浄化槽補助金の計算・申請管理・必要書類チェックを統合
 */

import { useState } from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { SubsidyCalculator } from '@/components/FP/Subsidy/SubsidyCalculator';
import { DocumentChecklist } from '@/components/FP/Subsidy/DocumentChecklist';
import { ApplicationForm } from '@/components/FP/Subsidy/ApplicationForm';

type TabType = 'calculator' | 'application' | 'documents';

const tabs: { id: TabType; label: string; description: string }[] = [
  {
    id: 'calculator',
    label: '補助金計算',
    description: '人槽・撤去の有無から補助金額を計算',
  },
  {
    id: 'application',
    label: '申請管理',
    description: 'お客様の申請情報を入力・管理',
  },
  {
    id: 'documents',
    label: '必要書類',
    description: '提出書類のチェックリスト',
  },
];

export const SubsidyManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [hasDemolition, setHasDemolition] = useState(true); // 梅村様のケースではtrue
  const [customerName, setCustomerName] = useState('梅村');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* ページタイトル */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            浄化槽補助金サポート
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            稲沢市 浄化槽設置整備事業補助金
          </p>
        </div>

        {/* タブ */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="block">{tab.label}</span>
              <span className="hidden sm:block text-xs font-normal text-gray-400 mt-0.5">
                {tab.description}
              </span>
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="pb-8">
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  稲沢市 浄化槽設置補助金シミュレーター
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  設置する浄化槽の条件を選択すると、補助金額が自動計算されます。
                  解体（既存槽撤去）の補助金も含めて計算できます。
                </p>
                <SubsidyCalculator
                  initialCapacity={5}
                  initialHasDemolition={hasDemolition}
                  onCalculated={() => {}}
                />
              </div>

              {/* 稲沢市の補助金一覧 */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  稲沢市 補助金額一覧（令和8年度）
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-gray-600 font-medium">区分</th>
                        <th className="text-left py-2 px-3 text-gray-600 font-medium">対象</th>
                        <th className="text-right py-2 px-3 text-gray-600 font-medium">補助金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 px-3 font-medium" rowSpan={3}>浄化槽設置</td>
                        <td className="py-2.5 px-3">5人槽</td>
                        <td className="py-2.5 px-3 text-right font-semibold">332,000円</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 px-3">6〜7人槽</td>
                        <td className="py-2.5 px-3 text-right font-semibold">414,000円</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2.5 px-3">8〜10人槽</td>
                        <td className="py-2.5 px-3 text-right font-semibold">548,000円</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-orange-50">
                        <td className="py-2.5 px-3 font-medium text-orange-700">撤去（解体）</td>
                        <td className="py-2.5 px-3 text-orange-700">単独処理浄化槽</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-orange-700">上限 120,000円</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-orange-50">
                        <td className="py-2.5 px-3 font-medium text-orange-700"></td>
                        <td className="py-2.5 px-3 text-orange-700">くみ取り便槽</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-orange-700">上限 90,000円</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium">配管工事</td>
                        <td className="py-2.5 px-3">宅内配管</td>
                        <td className="py-2.5 px-3 text-right font-semibold">上限 300,000円</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>注意:</strong> 補助金額は年度によって変更される場合があります。最新情報は稲沢市 経済環境部 環境保全課にお問い合わせください。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'application' && (
            <ApplicationForm
              initialData={{
                customerName: customerName,
                hasDemolition: hasDemolition,
                demolitionType: 'single_tank',
              }}
              onSubmit={(data) => {
                setCustomerName(data.customerName);
                setHasDemolition(data.hasDemolition);
                console.log('Application saved:', data);
              }}
            />
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  稲沢市 浄化槽補助金 必要書類チェックリスト
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  申請に必要な書類をチェックして準備状況を管理できます。
                </p>

                {/* 解体書類の表示切り替え */}
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDemolition}
                    onChange={(e) => setHasDemolition(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-600">
                    解体（撤去）関連の書類も表示する
                  </span>
                </label>
              </div>

              <DocumentChecklist
                includeDemolition={hasDemolition}
                customerName={customerName}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubsidyManagement;
