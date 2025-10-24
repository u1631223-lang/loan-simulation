/**
 * HouseholdBudget - 家計収支管理ページ
 *
 * 収入項目と支出項目の管理画面（デモ用）
 */

import React, { useState } from 'react';
import Container from '@/components/Layout/Container';
import IncomeItems from '@/components/FP/Household/IncomeItems';
import ExpenseItems from '@/components/FP/Household/ExpenseItems';

const HouseholdBudget: React.FC = () => {
  // デモ用のbudgetId（実際はuseParams()やpropsから取得）
  const [budgetId] = useState('demo-budget-id');

  return (
    <Container>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* ページヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            家計収支シミュレーション
          </h1>
          <p className="text-gray-600">
            収入と支出を管理して、月次のキャッシュフローを把握しましょう
          </p>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="text-sm text-blue-600 font-medium mb-1">月次収入</div>
            <div className="text-3xl font-bold text-blue-700">
              ¥0
            </div>
            <div className="text-xs text-blue-500 mt-1">収入項目を追加してください</div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="text-sm text-red-600 font-medium mb-1">月次支出</div>
            <div className="text-3xl font-bold text-red-700">
              ¥0
            </div>
            <div className="text-xs text-red-500 mt-1">支出項目を追加してください</div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <div className="text-sm text-green-600 font-medium mb-1">月次収支</div>
            <div className="text-3xl font-bold text-green-700">
              ¥0
            </div>
            <div className="text-xs text-green-500 mt-1">収入 - 支出</div>
          </div>
        </div>

        {/* 収入項目セクション */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <IncomeItems budgetId={budgetId} />
        </section>

        {/* 支出項目セクション */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <ExpenseItems budgetId={budgetId} />
        </section>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div className="text-sm text-yellow-800">
              <strong>デモページについて:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>このページはTICKET-1302の実装確認用デモです</li>
                <li>実際の使用時は、Supabase認証と household_budgets テーブルのセットアップが必要です</li>
                <li>budgetId は実際のbudget作成後に動的に取得されます</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 実装メモ */}
        <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700">
            開発者向け実装メモ
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2">
            <p><strong>実装済み機能:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>収入項目のCRUD（useIncomeItems hook）</li>
              <li>支出項目のCRUD（useExpenseItems hook）</li>
              <li>カテゴリごとのアイコン表示</li>
              <li>月次/年次/単発の頻度設定</li>
              <li>固定費・変動費の区別</li>
              <li>月次金額の自動計算</li>
              <li>Supabase RLS適用</li>
            </ul>

            <p className="pt-2"><strong>次のステップ（TICKET-1303以降）:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>キャッシュフロー計算エンジン実装</li>
              <li>サマリーカードの実データ表示</li>
              <li>タイムラインUI実装</li>
              <li>グラフ・ビジュアライゼーション実装</li>
            </ul>

            <p className="pt-2"><strong>使用方法:</strong></p>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded mt-2 overflow-x-auto text-xs">
{`import IncomeItems from '@/components/FP/Household/IncomeItems';
import ExpenseItems from '@/components/FP/Household/ExpenseItems';

function MyComponent() {
  const budgetId = 'your-budget-id';

  return (
    <>
      <IncomeItems budgetId={budgetId} />
      <ExpenseItems budgetId={budgetId} />
    </>
  );
}`}
            </pre>
          </div>
        </details>
      </div>
    </Container>
  );
};

export default HouseholdBudget;
